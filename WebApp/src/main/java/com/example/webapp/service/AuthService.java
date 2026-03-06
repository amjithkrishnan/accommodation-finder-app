package com.example.webapp.service;

import com.example.webapp.model.User;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;

@Service
public class AuthService {
    private final RestTemplate restTemplate = new RestTemplate();
    
    @Value("${serviceapp.auth.url}")
    private String serviceAppUrl;

    public boolean register(String email, String password) {
        try {
            Map<String, String> request = new HashMap<>();
            request.put("email", email);
            request.put("password", password);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(request, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(
                serviceAppUrl + "/register", entity, Map.class);
            
            Map<String, Object> body = response.getBody();
            return body != null && "success".equals(body.get("status"));
        } catch (Exception e) {
            return false;
        }
    }

    public boolean login(String email, String password) {
        try {
            Map<String, String> request = new HashMap<>();
            request.put("email", email);
            request.put("password", password);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(request, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(
                serviceAppUrl + "/login", entity, Map.class);
            
            Map<String, Object> body = response.getBody();
            return body != null && "success".equals(body.get("status"));
        } catch (Exception e) {
            return false;
        }
    }

    public boolean resetPassword(String email) {
        try {
            Map<String, String> request = new HashMap<>();
            request.put("email", email);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(request, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(
                serviceAppUrl + "/forgot-password", entity, Map.class);
            
            Map<String, Object> body = response.getBody();
            return body != null && "success".equals(body.get("status"));
        } catch (Exception e) {
            return false;
        }
    }
}
