# AWS VPC + Subnets + Security Groups Setup Guide
> AccommodateMe - Property Rental Platform

---

## Architecture

```
Region: us-east-1 (N. Virginia)

VPC: accommodateme-vpc (10.0.0.0/16)
├── cpp-public-subnet-a   (10.0.1.0/24) - us-east-1a  ← WebApp + Bastion
├── cpp-public-subnet-b   (10.0.2.0/24) - us-east-1b  ← ALB requires 2 AZs
└── serviceapp-private-subnet-a (10.0.3.0/24) - us-east-1a  ← ServiceApp + MySQL
```

> **Why one VPC for both apps?**
> WebApp and ServiceApp must communicate internally.
> Separate VPCs would require VPC Peering - extra cost and complexity.
> One VPC with clear naming per app is the correct approach.

> **Why 3 subnets?**
> - 2 public subnets required because ALB must span 2 Availability Zones (AWS enforces this)
> - 1 private subnet for ServiceApp + MySQL

---

## EC2 Instances

| Server | Subnet | Public IP | Private IP | Runs |
|---|---|---|---|---|
| Bastion | cpp-public-subnet-a | ✅ Yes | Auto | SSH tunnel only |
| WebApp | cpp-public-subnet-a | ✅ Yes | Auto | webapp.jar (port 8080) |
| ServiceApp | serviceapp-private-subnet-a | ❌ No | **10.0.3.10** (fixed) | serviceapp.jar (port 8081) + MySQL (port 3306) |

> **Why fixed private IP for ServiceApp?**
> If ServiceApp EC2 restarts, its private IP could change.
> WebApp uses `SERVICE_APP_URL=http://10.0.3.10:8081` in config.
> Fixed IP ensures WebApp always reaches ServiceApp without any DNS or service discovery setup.

---

## Step 1: Create VPC

1. Go to **AWS Console → VPC → Create VPC**
2. Select **VPC only**
3. Fill in:

| Field | Value |
|---|---|
| Name | `accommodateme-vpc` |
| IPv4 CIDR | `10.0.0.0/16` |
| Tenancy | Default |

4. Click **Create VPC**

> **What is CIDR 10.0.0.0/16?**
> - First 16 bits are fixed (`10.0`)
> - Last 16 bits are free
> - Gives **65,536 IP addresses** (`10.0.0.0` → `10.0.255.255`)
> - You carve subnets out of this range

---

## Step 2: Create Subnets

Go to **VPC → Subnets → Create Subnet**, select `accommodateme-vpc`

Create 3 subnets:

| Name | AZ | CIDR | Type |
|---|---|---|---|
| `cpp-public-subnet-a` | us-east-1a | `10.0.1.0/24` | Public |
| `cpp-public-subnet-b` | us-east-1b | `10.0.2.0/24` | Public (ALB only) |
| `serviceapp-private-subnet-a` | us-east-1a | `10.0.3.0/24` | Private |

> **What is /24?**
> - 256 IPs per subnet (`10.0.x.0` → `10.0.x.255`)
> - AWS reserves 5, so **251 usable**

---

## Step 3: Internet Gateway

Public subnets need this to reach the internet.

1. Go to **VPC → Internet Gateways → Create**
   - Name: `accommodateme-igw`
2. After creating → **Actions → Attach to VPC**
3. Select `accommodateme-vpc`

---

## Step 4: NAT Gateway

Private subnet needs this for **outbound** internet access
(ServiceApp calling S3, yum updates etc.)
while remaining unreachable from the internet.

1. Go to **VPC → NAT Gateways → Create**

| Field | Value |
|---|---|
| Name | `accommodateme-nat` |
| Subnet | `cpp-public-subnet-a` ← must be PUBLIC |
| Elastic IP | Click **Allocate Elastic IP** |

2. Click **Create NAT Gateway**

> **Internet Gateway vs NAT Gateway**
> ```
> Internet Gateway → Public EC2 ↔ Internet (both directions)
>                    Anyone can initiate connection to your EC2
>
> NAT Gateway     → Private EC2 → Internet (outbound only)
>                    Internet CANNOT reach private EC2
> ```

---

## Step 5: Route Tables

### Public Route Table

1. **VPC → Route Tables → Create**

| Field | Value |
|---|---|
| Name | `cpp-public-rt` |
| VPC | `accommodateme-vpc` |

2. **Routes tab → Edit routes → Add route:**

| Destination | Target |
|---|---|
| `0.0.0.0/0` | `accommodateme-igw` |

3. **Subnet Associations → Associate:**
   - `cpp-public-subnet-a`
   - `cpp-public-subnet-b`

### Private Route Table

1. Create route table:

| Field | Value |
|---|---|
| Name | `serviceapp-private-rt` |
| VPC | `accommodateme-vpc` |

2. Add route:

| Destination | Target |
|---|---|
| `0.0.0.0/0` | `accommodateme-nat` |

3. Associate:
   - `serviceapp-private-subnet-a`

> **Route Table Logic**
> ```
> Public subnets:
>   10.0.0.0/16 → local (within VPC)
>   0.0.0.0/0   → Internet Gateway
>
> Private subnet:
>   10.0.0.0/16 → local (within VPC)
>   0.0.0.0/0   → NAT Gateway (outbound only)
> ```

---

## Step 6: Enable Auto-assign Public IP

For public subnets only:

1. Select `cpp-public-subnet-a` → **Actions → Edit subnet settings**
2. Check **Enable auto-assign public IPv4 address** → Save
3. Repeat for `cpp-public-subnet-b`

---

## Step 7: Security Groups

Security Groups are virtual firewalls per resource.
**Stateful** - if inbound is allowed, response is automatically allowed.

### SG 1: bastion-sg

| Field | Value |
|---|---|
| Name | `bastion-sg` |
| VPC | `accommodateme-vpc` |

**Inbound:**
| Type | Port | Source |
|---|---|---|
| SSH | 22 | `YOUR_IP/32` ← your IP only |

**Outbound:** All traffic → `0.0.0.0/0`

---

### SG 2: alb-sg

| Field | Value |
|---|---|
| Name | `alb-sg` |
| VPC | `accommodateme-vpc` |

**Inbound:**
| Type | Port | Source |
|---|---|---|
| HTTP | 80 | `0.0.0.0/0` |
| HTTPS | 443 | `0.0.0.0/0` |

**Outbound:**
| Type | Port | Destination |
|---|---|---|
| Custom TCP | 8080 | `cpp-sg` |

---

### SG 3: cpp-sg

| Field | Value |
|---|---|
| Name | `cpp-sg` |
| VPC | `accommodateme-vpc` |

**Inbound:**
| Type | Port | Source |
|---|---|---|
| HTTP | 80 | `0.0.0.0/0` |
| HTTPS | 443 | `0.0.0.0/0` |
| Custom TCP | 8080 | `alb-sg` |
| SSH | 22 | `bastion-sg` |

**Outbound:** All traffic → `0.0.0.0/0`

---

### SG 4: serviceapp-sg

| Field | Value |
|---|---|
| Name | `serviceapp-sg` |
| VPC | `accommodateme-vpc` |

**Inbound:**
| Type | Port | Source |
|---|---|---|
| Custom TCP | 8081 | `cpp-sg` |
| SSH | 22 | `bastion-sg` |

> ⚠️ No public internet access. MySQL runs on localhost - no external port needed.

**Outbound:** All traffic → `0.0.0.0/0`

---

## Step 8: Verify Traffic Flow

```
User Request:
  Internet
    → ALB (cpp-public-subnet-a or b)    [alb-sg: 443 open]
    → WebApp EC2 (cpp-public-subnet-a)  [cpp-sg: 8080 from alb-sg]
    → ServiceApp EC2 (10.0.3.10)           [serviceapp-sg: 8081 from cpp-sg]
    → MySQL (localhost:3306)               [same EC2, no network hop]

SSH Access:
  Your IP
    → Bastion EC2 (cpp-public-subnet-a) [bastion-sg: 22 from your IP]
    → ServiceApp EC2 (10.0.3.10)           [serviceapp-sg: 22 from bastion-sg]

Outbound (ServiceApp → S3):
  ServiceApp EC2 (10.0.3.10)
    → S3 VPC Endpoint                      [stays inside AWS network - free]
    → S3 Bucket

Outbound (ServiceApp → internet):
  ServiceApp EC2 (10.0.3.10)
    → NAT Gateway (cpp-public-subnet-a)
    → Internet Gateway
    → Internet (yum updates etc.)
```

---

## Summary Table

| Resource | Subnet | Public IP | Private IP | Accessible From |
|---|---|---|---|---|
| ALB | Public A + B | ✅ Yes | Auto | Internet |
| WebApp EC2 | cpp-public-subnet-a | ✅ Yes | Auto | ALB + Bastion |
| Bastion EC2 | cpp-public-subnet-a | ✅ Yes | Auto | Your IP only |
| ServiceApp EC2 | serviceapp-private-subnet-a | ❌ No | **10.0.3.10** (fixed) | WebApp + Bastion |
| MySQL | serviceapp-private-subnet-a | ❌ No | localhost | ServiceApp only |
| NAT Gateway | cpp-public-subnet-a | ✅ Yes | - | Private subnet (outbound) |

---

## Step 9: Create EC2 Instances

> ⚠️ Complete Steps 1-8 before launching EC2 instances.

Go to **EC2 → Instances → Launch Instance**

---

### EC2 1: Bastion Host

| Field | Value |
|---|---|
| Name | `accommodateme-bastion` |
| AMI | Amazon Linux 2023 |
| Instance Type | `t3.micro` |
| Key Pair | Create new → `accommodateme-key` → Download `.pem` |

**Network Settings:**
| Field | Value |
|---|---|
| VPC | `accommodateme-vpc` |
| Subnet | `cpp-public-subnet-a` |
| Auto-assign Public IP | Enable |
| Security Group | `bastion-sg` |

**Storage:** 8 GB gp3

**User Data:**
```bash
#!/bin/bash
yum update -y
```

> Only used for SSH tunneling into private subnet.
> Stop this instance when not doing deployments to save cost.

---

### EC2 2: WebApp Server

| Field | Value |
|---|---|
| Name | `accommodateme-webapp` |
| AMI | Amazon Linux 2023 |
| Instance Type | `t3.small` |
| Key Pair | `accommodateme-key` |

**Network Settings:**
| Field | Value |
|---|---|
| VPC | `accommodateme-vpc` |
| Subnet | `cpp-public-subnet-a` |
| Auto-assign Public IP | Enable |
| Security Group | `cpp-sg` |

**Storage:** 20 GB gp3

**User Data:**
```bash
#!/bin/bash
yum update -y
yum install -y java-21-amazon-corretto
mkdir -p /opt/webapp
```

---

### EC2 3: ServiceApp Server

| Field | Value |
|---|---|
| Name | `accommodateme-serviceapp` |
| AMI | Amazon Linux 2023 |
| Instance Type | `t3.small` |
| Key Pair | `accommodateme-key` |

**Network Settings:**
| Field | Value |
|---|---|
| VPC | `accommodateme-vpc` |
| Subnet | `serviceapp-private-subnet-a` ← PRIVATE |
| Auto-assign Public IP | Disable ← no public IP |
| Security Group | `serviceapp-sg` |
| **Primary IP** | **10.0.3.10** ← type manually for fixed IP |

**Storage:** 30 GB gp3 ← extra space for MySQL data

**User Data:**
```bash
#!/bin/bash
yum update -y
yum install -y java-21-amazon-corretto

# Install MySQL
yum install -y mysql-server
systemctl start mysqld
systemctl enable mysqld

# Create app directories
mkdir -p /opt/serviceapp
```

> ⚠️ This EC2 has NO public IP. Only reachable via Bastion.
> Fixed private IP `10.0.3.10` ensures WebApp always reaches ServiceApp.

---

## Step 10: Configure MySQL on ServiceApp EC2

SSH in via Bastion:
```bash
ssh -i accommodateme-key.pem \
  -o ProxyJump=ec2-user@<BASTION_PUBLIC_IP> \
  ec2-user@10.0.3.10
```

Secure MySQL and create database:
```bash
# Get temporary root password
sudo grep 'temporary password' /var/log/mysqld.log

# Secure installation
sudo mysql_secure_installation

# Login and setup
mysql -u root -p

# Inside MySQL:
CREATE DATABASE accommodateme;
CREATE USER 'appuser'@'localhost' IDENTIFIED BY 'StrongPassword123!';
GRANT ALL PRIVILEGES ON accommodateme.* TO 'appuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

> MySQL only accepts `localhost` connections.
> ServiceApp connects via `jdbc:mysql://localhost:3306/accommodateme`

---

## Step 11: Setup Systemd Services

### WebApp Service

SSH into WebApp EC2:
```bash
ssh -i accommodateme-key.pem ec2-user@<WEBAPP_PUBLIC_IP>
```

```bash
sudo nano /etc/systemd/system/webapp.service
```

```ini
[Unit]
Description=AccommodateMe WebApp
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/webapp
EnvironmentFile=/opt/webapp/.env
ExecStart=/usr/bin/java -jar /opt/webapp/webapp.jar
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable webapp
sudo systemctl start webapp
```

---

### ServiceApp Service

SSH in via Bastion:
```bash
ssh -i accommodateme-key.pem \
  -o ProxyJump=ec2-user@<BASTION_PUBLIC_IP> \
  ec2-user@10.0.3.10
```

```bash
sudo nano /etc/systemd/system/serviceapp.service
```

```ini
[Unit]
Description=AccommodateMe ServiceApp
After=network.target mysqld.service

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/serviceapp
EnvironmentFile=/opt/serviceapp/.env
ExecStart=/usr/bin/java -jar /opt/serviceapp/serviceapp.jar
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable serviceapp
sudo systemctl start serviceapp
```

> `After=mysqld.service` ensures MySQL starts before ServiceApp

---

## Step 12: Create S3 VPC Endpoint

Routes S3 traffic within AWS network - no NAT Gateway needed for S3.
Faster and free.

1. Go to **VPC → Endpoints → Create Endpoint**

| Field | Value |
|---|---|
| Name | `accommodateme-s3-endpoint` |
| Service category | AWS services |
| Service | `com.amazonaws.us-east-1.s3` (Gateway type) |
| VPC | `accommodateme-vpc` |
| Route Tables | `serviceapp-private-rt` |

2. Click **Create Endpoint**

> **S3 traffic flow with VPC Endpoint:**
> ```
> ServiceApp EC2 (10.0.3.10)
>       ↓
> S3 VPC Endpoint (stays inside AWS network)
>       ↓
> S3 Bucket
>
> No NAT Gateway needed ✅  Faster ✅  Free ✅
> ```

---

## Step 13: Key Pair Setup for CI/CD

```bash
chmod 400 accommodateme-key.pem
cat accommodateme-key.pem
```

Copy entire content and add to GitHub Secrets as `SSH_PRIVATE_KEY`:
```
-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----
```

---

## Complete Setup Order

```
1.  Create VPC                (accommodateme-vpc)
2.  Create Subnets (3)        (webapp-public-a/b, serviceapp-private-a)
3.  Create Internet Gateway   (accommodateme-igw) → attach to VPC
4.  Create NAT Gateway        (accommodateme-nat) in cpp-public-subnet-a
5.  Create Route Tables       (cpp-public-rt, serviceapp-private-rt)
6.  Enable Auto-assign IP     on cpp-public-subnet-a and b
7.  Create Security Groups    (bastion-sg, alb-sg, cpp-sg, serviceapp-sg)
8.  Create S3 VPC Endpoint    (accommodateme-s3-endpoint)
9.  Launch Bastion EC2        (cpp-public-subnet-a, bastion-sg)
10. Launch WebApp EC2         (cpp-public-subnet-a, cpp-sg)
11. Launch ServiceApp EC2     (serviceapp-private-subnet-a, serviceapp-sg, IP: 10.0.3.10)
12. Configure MySQL           on ServiceApp EC2
13. Setup systemd services    on WebApp and ServiceApp EC2
14. Add secrets to GitHub     (IPs, passwords, keys)
15. Push code                 → CI/CD deploys automatically
```

---

## Cost Estimate (us-east-1)

| Service | Cost |
|---|---|
| NAT Gateway | ~$32/month + data transfer ⚠️ most expensive |
| ALB | ~$16/month + LCU costs |
| EC2 t3.micro (Bastion) | ~$8/month (stop when not needed) |
| EC2 t3.small (WebApp) | ~$15/month |
| EC2 t3.small (ServiceApp + MySQL) | ~$15/month |
| Elastic IP (NAT) | Free while attached |
| S3 VPC Endpoint | Free ✅ |

> **Total estimate: ~$85/month**
> Stop Bastion when not deploying → saves ~$8/month
> us-east-1 is one of the cheapest AWS regions

---

## GitHub Secrets Required for CI/CD

| Secret | Value |
|---|---|
| `SSH_PRIVATE_KEY` | Contents of `accommodateme-key.pem` |
| `BASTION_HOST` | Bastion EC2 public IP |
| `BASTION_USER` | `ec2-user` |
| `WEBAPP_HOST` | WebApp EC2 public IP |
| `WEBAPP_USER` | `ec2-user` |
| `SERVICEAPP_PRIVATE_HOST` | `10.0.3.10` (fixed private IP) |
| `SERVICEAPP_USER` | `ec2-user` |
| `SERVICE_APP_URL` | `http://10.0.3.10:8081` |
| `DB_URL` | `jdbc:mysql://localhost:3306/accommodateme` |
| `DB_USERNAME` | `appuser` |
| `DB_PASSWORD` | MySQL password |
| `INTERNAL_SECRET` | Shared secret between WebApp and ServiceApp |
| `APP_ENCRYPTION_KEY` | AES-256 key (base64) |
| `AWS_ACCESS_KEY_ID` | AWS credentials (or use IAM Role) |
| `AWS_SECRET_ACCESS_KEY` | AWS credentials (or use IAM Role) |
| `S3_BUCKET_NAME` | S3 bucket name |
| `STORAGE_MODE` | `s3` |
| `COOKIE_DOMAIN` | Your domain |
