# React Frontend

## Build

Maven automatically copies files to static folder:
```bash
mvn clean package
```

Works on Windows, Linux, and macOS.

## Environment

### Local
```properties
app.storage.mode=local
```

### Production (S3)
```properties
app.storage.mode=s3
```
Set:
```bash
export AWS_ACCESS_KEY_ID=your-key
export AWS_SECRET_ACCESS_KEY=your-secret
```
