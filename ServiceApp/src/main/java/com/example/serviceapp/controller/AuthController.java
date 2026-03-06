package com.example.serviceapp.controller;

import com.example.serviceapp.dto.ApiResponse;
import com.example.serviceapp.dto.UserDTO;
import com.example.serviceapp.model.User;
import com.example.serviceapp.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:8080", allowCredentials = "true")
public class AuthController {
    @Autowired
    private AuthService authService;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpSession session) {
        if (authService.isLoggedIn(session)) {
            UserDTO user = authService.getUser(session);
            Map<String, Object> response = new HashMap<>();
            response.put("authenticated", true);
            response.put("user", user);
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("authenticated", false));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@RequestBody User user, HttpSession session) {
        if (authService.isLoggedIn(session)) {
            return ResponseEntity.badRequest().body(ApiResponse.failed("Already logged in", "ALREADY_LOGGED_IN"));
        }
        if (authService.register(user.getEmail(), user.getPassword())) {
            return ResponseEntity.ok(ApiResponse.success("User registered successfully"));
        }
        return ResponseEntity.badRequest().body(ApiResponse.failed("User already exists", "USER_EXISTS"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@RequestBody User user, HttpSession session) {
        if (authService.isLoggedIn(session)) {
            return ResponseEntity.badRequest().body(ApiResponse.failed("Already logged in", "ALREADY_LOGGED_IN"));
        }
        if (authService.login(user.getEmail(), user.getPassword(), session)) {
            return ResponseEntity.ok(ApiResponse.success("Login successful"));
        }
        return ResponseEntity.badRequest().body(ApiResponse.failed("Invalid credentials", "INVALID_CREDENTIALS"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logout(HttpSession session) {
        authService.logout(session);
        return ResponseEntity.ok(ApiResponse.success("Logout successful"));
    }

    @GetMapping("/check")
    public ResponseEntity<ApiResponse> checkSession(HttpSession session) {
        if (authService.isLoggedIn(session)) {
            return ResponseEntity.ok(ApiResponse.success("Logged in"));
        }
        return ResponseEntity.ok(ApiResponse.failed("Not logged in", "NOT_LOGGED_IN"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse> forgotPassword(@RequestBody User user) {
        if (authService.resetPassword(user.getEmail())) {
            return ResponseEntity.ok(ApiResponse.success("Password reset link sent"));
        }
        return ResponseEntity.badRequest().body(ApiResponse.failed("Email not found", "EMAIL_NOT_FOUND"));
    }
}
