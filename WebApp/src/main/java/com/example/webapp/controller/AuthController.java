package com.example.webapp.controller;

import com.example.webapp.dto.ApiResponse;
import com.example.webapp.model.User;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Value("${serviceapp.auth.url}")
    private String serviceAppUrl;
    
    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@RequestBody User user, HttpServletResponse response) {
        return forwardAuthRequest("/register", user, response);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@RequestBody User user, HttpServletResponse response) {
        return forwardAuthRequest("/login", user, response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse> forgotPassword(@RequestBody User user) {
        try {
            Map<String, String> request = new HashMap<>();
            request.put("email", user.getEmail());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(request, headers);
            
            ResponseEntity<ApiResponse> serviceResponse = restTemplate.postForEntity(
                serviceAppUrl + "/forgot-password", entity, ApiResponse.class);
            
            return serviceResponse;
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.failed("Email not found", "EMAIL_NOT_FOUND"));
        }
    }
    
    private ResponseEntity<ApiResponse> forwardAuthRequest(String endpoint, User user, HttpServletResponse response) {
        try {
            Map<String, String> request = new HashMap<>();
            request.put("email", user.getEmail());
            request.put("password", user.getPassword());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(request, headers);
            
            ResponseEntity<ApiResponse> serviceResponse = restTemplate.postForEntity(
                serviceAppUrl + endpoint, entity, ApiResponse.class);
            
            // Forward Set-Cookie header from ServiceApp to browser
            List<String> cookies = serviceResponse.getHeaders().get(HttpHeaders.SET_COOKIE);
            if (cookies != null) {
                for (String cookie : cookies) {
                    response.addHeader("Set-Cookie", cookie);
                }
            }
            
            return serviceResponse;
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.failed("Authentication failed", "AUTH_FAILED"));
        }
    }
}
