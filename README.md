# AccommodateMe - Property Rental Platform

A full-stack property rental application built with React (frontend) and Spring Boot (backend).

## Architecture

- **WebApp**: Gateway service (Port 8080) - Serves React frontend and proxies API requests
- **ServiceApp**: Backend service (Port 8081) - Handles business logic, database operations, and file storage

## Technology Stack

### Frontend
- React 18 (CDN-based, no npm dependencies in production)
- Material-UI 5
- Axios for HTTP requests
- Custom build system with Babel & Terser

### Backend
- Spring Boot 3.2.0
- Spring Security (CSRF protection)
- Spring Session JDBC (MySQL)
- MySQL Database
- AWS S3 / Local File Storage
- Maven

## Prerequisites

- Java 21
- Node.js 18+ (for building React app)
- MySQL 8.0+
- Maven 3.8+
- AWS Account (optional, for S3 storage)

## Database Setup

```sql
CREATE DATABASE accommodateme;
USE accommodateme;

-- Tables will be auto-created by Spring Boot JPA
```

## Configuration

### ServiceApp Configuration
Edit `ServiceApp/src/main/resources/application.properties`:

```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/accommodateme
spring.datasource.username=root
spring.datasource.password=your_password

# Storage Mode (s3 or local)
app.storage.mode=local
app.storage.local.path=./uploads

# AWS S3 (if using S3)
aws.s3.bucket-name=your-bucket
aws.s3.region=eu-west-1
aws.access-key-id=your-key
aws.secret-access-key=your-secret
```

### WebApp Configuration
Edit `WebApp/src/main/resources/application.properties`:

```properties
server.port=8080
serviceapp.url=http://localhost:8081
serviceapp.secret=your-shared-secret
```

Edit `WebApp/src/main/resources/react-frontend/config.js`:

```javascript
const API_CONFIG = {
    BASE_URL: 'http://localhost:8080'
};
```

## Building the Application

### Build ServiceApp
```bash
cd ServiceApp
mvn clean package -DskipTests
```

### Build WebApp
```bash
cd WebApp
mvn clean package -DskipTests
```

This will:
1. Run `npm install` in react-frontend
2. Run `npm run build` to create production bundle
3. Copy build output to `target/classes/static`
4. Package everything into `webapp.jar`

## Running the Application

### Start ServiceApp (Backend)
```bash
cd ServiceApp/target
java -jar serviceapp.jar
```

### Start WebApp (Gateway)
```bash
cd WebApp/target
java -jar webapp.jar
```

Access the application at: `http://localhost:8080`

## Development Workflow

### React Development

#### File Structure
```
WebApp/src/main/resources/react-frontend/
├── components/          # React components
├── services/           # API service layers
├── context/            # React context providers
├── build.js            # Custom build script
├── package.json        # Build dependencies only
└── index.html          # Development HTML (loads source files)
```

#### Adding New Components

1. Create component file in `components/`:
```javascript
function MyComponent() {
    const { Typography, Box } = MaterialUI;
    return (
        <Box>
            <Typography>Hello World</Typography>
        </Box>
    );
}
```

2. Add to `build.js` file list:
```javascript
const files = [
    // ... existing files
    'components/MyComponent.js',
    'components/App.js'  // App.js must be last
];
```

3. Rebuild:
```bash
cd WebApp
mvn package -DskipTests
```

#### Working with ResponseDTO

All API responses follow this structure:
```javascript
{
    status: boolean,      // true for success, false for error
    response: object,     // actual data (null on error)
    error: boolean,       // true if error occurred
    errorMsg: string,     // error message (null on success)
    errorCode: string     // error code (null on success)
}
```

Example usage:
```javascript
const data = await authService.login(email, password);
if (data.status) {
    // Success - data is in data.response
    console.log(data.response);
} else {
    // Error - message is in data.errorMsg
    console.error(data.errorMsg, data.errorCode);
}
```

#### CSRF Protection

CSRF token is automatically handled by `csrfInterceptor.js`:
- Token fetched on app load from `/api/csrf`
- Automatically added to POST/PUT/DELETE requests
- Stored in `XSRF-TOKEN` cookie
- Sent in `X-XSRF-TOKEN` header

#### Build Modes

Production build (console logs removed):
```bash
npm run build
# or
npm run build:prod
```

Development build (console logs kept):
```bash
npm run build:dev
```

### Spring Boot Development

#### Creating New REST Endpoints

1. Create DTO:
```java
package com.example.serviceapp.dto;

public class ResponseDTO {
    private boolean status;
    private Object response;
    private boolean error;
    private String errorMsg;
    private String errorCode;

    public static ResponseDTO success(Object data) {
        return new ResponseDTO(true, data, false, null, null);
    }

    public static ResponseDTO failed(String msg, String code) {
        return new ResponseDTO(false, null, true, msg, code);
    }
}
```

2. Create Controller:
```java
@RestController
@RequestMapping("/api/myresource")
@CrossOrigin(origins = "http://localhost:8080", allowCredentials = "true")
public class MyController {
    
    @GetMapping
    public ResponseEntity<ResponseDTO> getAll(HttpSession session) {
        UserDTO user = (UserDTO) session.getAttribute("USER");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ResponseDTO.failed("Not authenticated", "NOT_AUTHENTICATED"));
        }
        
        // Your logic here
        return ResponseEntity.ok(ResponseDTO.success(data));
    }
}
```

3. Add proxy mapping in WebApp (if needed):
```java
@RequestMapping(value = "/myresource/**", method = RequestMethod.GET)
public ResponseEntity<?> proxyMyResource(HttpServletRequest request) {
    return proxyRequest(request, null);
}
```

#### Session Management

User session is stored in MySQL via Spring Session JDBC:
```java
// Store user in session
UserDTO userDTO = new UserDTO(user.getId(), user.getEmail(), user.getName());
session.setAttribute("USER", userDTO);

// Retrieve user from session
UserDTO user = (UserDTO) session.getAttribute("USER");

// Check if logged in
boolean isLoggedIn = session.getAttribute("USER") != null;

// Logout
session.invalidate();
```

#### CSRF Configuration

WebApp has CSRF enabled, ServiceApp has it disabled:

**WebApp SecurityConfig:**
```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    CsrfTokenRequestAttributeHandler requestHandler = new CsrfTokenRequestAttributeHandler();
    requestHandler.setCsrfRequestAttributeName("_csrf");

    http
        .csrf(csrf -> csrf
            .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
            .csrfTokenRequestHandler(requestHandler)
        )
        .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());

    return http.build();
}
```

**ServiceApp SecurityConfig:**
```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
    
    return http.build();
}
```

#### File Upload Handling

```java
@PostMapping(consumes = "multipart/form-data")
public ResponseEntity<?> uploadFile(
        @RequestParam("file") MultipartFile file,
        @RequestParam("title") String title,
        HttpSession session) {
    
    UserDTO user = (UserDTO) session.getAttribute("USER");
    if (user == null) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(ResponseDTO.failed("Not authenticated", "NOT_AUTHENTICATED"));
    }
    
    // Upload to storage
    String fileUrl = storageService.uploadFile(file, "folder");
    
    return ResponseEntity.ok(ResponseDTO.success(Map.of("url", fileUrl)));
}
```

## Common Issues & Solutions

### Issue: Console logs not appearing
**Cause**: Production build removes console logs via Terser
**Solution**: Use development build or check browser Network tab

### Issue: 403 Forbidden on POST requests
**Cause**: Missing CSRF token
**Solution**: Ensure `csrfInterceptor.js` is loaded before other services

### Issue: Session not persisting
**Cause**: Missing `withCredentials: true` in axios requests
**Solution**: Add to all API calls:
```javascript
axios.get(url, { withCredentials: true })
```

### Issue: Component not found in production
**Cause**: Component not added to `build.js` file list
**Solution**: Add component to files array in `build.js`

### Issue: Static files not in JAR
**Cause**: Maven resource phase timing
**Solution**: Verify `copy-frontend-build` phase is `prepare-package`

### Issue: CORS errors
**Cause**: Missing CORS configuration
**Solution**: Add `@CrossOrigin` to controllers:
```java
@CrossOrigin(origins = "http://localhost:8080", allowCredentials = "true")
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Reset password

### Properties
- `GET /api/properties/user` - Get user's properties
- `POST /api/properties` - Create property
- `PUT /api/properties/{id}` - Update property
- `DELETE /api/properties/{id}` - Delete property
- `GET /api/properties/{id}` - Get property details

### Master Data
- `GET /api/master/property-types` - Get property types
- `GET /api/master/amenities` - Get amenities list

### CSRF
- `GET /api/csrf` - Get CSRF token

## Deployment

### Production Build Checklist
- [ ] Update `config.js` with production API URL
- [ ] Set `app.storage.mode=s3` in ServiceApp
- [ ] Configure AWS credentials
- [ ] Update database connection strings
- [ ] Change `serviceapp.secret` to secure value
- [ ] Enable HTTPS
- [ ] Configure proper CORS origins
- [ ] Set up database backups
- [ ] Configure logging

### Environment Variables
```bash
# ServiceApp
export SPRING_DATASOURCE_URL=jdbc:mysql://prod-db:3306/accommodateme
export SPRING_DATASOURCE_USERNAME=prod_user
export SPRING_DATASOURCE_PASSWORD=secure_password
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret

# WebApp
export SERVICEAPP_URL=http://serviceapp:8081
export SERVICEAPP_SECRET=secure_shared_secret
```

## Testing

### Manual Testing
1. Register new user
2. Login
3. Create property with images
4. Edit property
5. Delete property
6. Logout
7. Verify session cleared

### API Testing with cURL
```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -b cookies.txt -c cookies.txt

# Get properties
curl -X GET http://localhost:8080/api/properties/user \
  -b cookies.txt
```

## License

This project is licensed under the MIT License.

## Contributors

- Amjith Krishnan UJ (x25139088)

## Support

For issues and questions, please create an issue in the GitLab repository.
