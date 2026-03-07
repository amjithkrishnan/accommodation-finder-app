package com.example.webapp;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class ProxyController {
    
    @Value("${serviceapp.url}")
    private String serviceAppUrl;
    
    @Value("${serviceapp.secret:default-secret-change-in-production}")
    private String sharedSecret;
    
    private final RestTemplate restTemplate;
    
    public ProxyController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }
    
    @RequestMapping(value = "/properties/**", method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
    public ResponseEntity<?> proxyProperties(HttpServletRequest request, @RequestBody(required = false) String body) {
        // Handle multipart requests (file uploads)
        if (request.getContentType() != null && request.getContentType().startsWith("multipart/form-data")) {
            return proxyMultipartRequest((MultipartHttpServletRequest) request);
        }
        return proxyRequest(request, body);
    }
    
    @RequestMapping(value = "/auth/me", method = RequestMethod.GET)
    public ResponseEntity<?> proxyAuthMe(HttpServletRequest request) {
        return proxyRequest(request, null);
    }
    
    @RequestMapping(value = "/auth/register", method = RequestMethod.POST)
    public ResponseEntity<?> proxyAuthRegister(HttpServletRequest request, @RequestBody String body) {
        return proxyRequest(request, body);
    }
    
    @RequestMapping(value = "/auth/login", method = RequestMethod.POST)
    public ResponseEntity<?> proxyAuthLogin(HttpServletRequest request, @RequestBody String body) {
        return proxyRequest(request, body);
    }
    
    @RequestMapping(value = "/auth/logout", method = RequestMethod.POST)
    public ResponseEntity<?> proxyAuthLogout(HttpServletRequest request) {
        return proxyRequest(request, null);
    }
    
    @RequestMapping(value = "/master/**", method = RequestMethod.GET)
    public ResponseEntity<?> proxyMaster(HttpServletRequest request) {
        return proxyRequest(request, null);
    }
    
    @RequestMapping(value = "/media/**", method = {RequestMethod.GET, RequestMethod.POST})
    public ResponseEntity<?> proxyMedia(HttpServletRequest request, @RequestBody(required = false) String body) {
        return proxyRequest(request, body);
    }
    
    private ResponseEntity<?> proxyMultipartRequest(MultipartHttpServletRequest request) {
        try {
            String path = request.getRequestURI().replace("/api", "");
            String url = serviceAppUrl + "/api" + path;
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            
            // Forward session cookie
            String sessionCookie = getSessionCookie(request);
            if (sessionCookie != null) {
                headers.set("Cookie", sessionCookie);
            }
            
            // Add shared secret
            headers.set("X-Internal-Secret", sharedSecret);
            headers.set("X-Forwarded-For", getClientIP(request));
            
            // Build multipart body
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            
            // Add all form parameters
            Map<String, String[]> paramMap = request.getParameterMap();
            for (Map.Entry<String, String[]> entry : paramMap.entrySet()) {
                for (String value : entry.getValue()) {
                    body.add(entry.getKey(), value);
                }
            }
            
            // Add all files
            Map<String, MultipartFile> fileMap = request.getFileMap();
            for (Map.Entry<String, MultipartFile> entry : fileMap.entrySet()) {
                MultipartFile file = entry.getValue();
                ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
                    @Override
                    public String getFilename() {
                        return file.getOriginalFilename();
                    }
                };
                body.add(entry.getKey(), resource);
            }
            
            HttpEntity<MultiValueMap<String, Object>> entity = new HttpEntity<>(body, headers);
            
            return restTemplate.exchange(url, HttpMethod.valueOf(request.getMethod()), entity, Object.class);
        } catch (HttpClientErrorException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("{\"status\":\"error\",\"message\":\"Failed to process file upload\"}");
        }
    }
    
    private ResponseEntity<?> proxyRequest(HttpServletRequest request, String body) {
        try {
            String path = request.getRequestURI().replace("/api", "");
            String url = serviceAppUrl + "/api" + path;
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            // Forward session cookie
            String sessionCookie = getSessionCookie(request);
            if (sessionCookie != null) {
                headers.set("Cookie", sessionCookie);
            }
            
            // Add shared secret for internal authentication
            headers.set("X-Internal-Secret", sharedSecret);
            
            // Forward client IP for logging/security
            headers.set("X-Forwarded-For", getClientIP(request));
            
            HttpEntity<String> entity = new HttpEntity<>(body, headers);
            
            return restTemplate.exchange(url, HttpMethod.valueOf(request.getMethod()), entity, Object.class);
        } catch (HttpClientErrorException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("{\"status\":\"error\",\"message\":\"Service temporarily unavailable\"}");
        }
    }
    
    private String getSessionCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("SESSION".equals(cookie.getName())) {
                    return "SESSION=" + cookie.getValue();
                }
            }
        }
        return null;
    }
    
    private String getClientIP(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
