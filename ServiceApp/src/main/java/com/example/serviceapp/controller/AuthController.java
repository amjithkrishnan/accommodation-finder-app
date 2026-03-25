package com.example.serviceapp.controller;

import com.example.serviceapp.dto.ResponseDTO;
import com.example.serviceapp.dto.UserDTO;
import com.example.serviceapp.model.User;
import com.example.serviceapp.service.AuthService;
import com.example.serviceapp.util.InputSanitizer;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
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
            return ResponseEntity.ok(ResponseDTO.success(response));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ResponseDTO.failed("Not authenticated", "NOT_AUTHENTICATED"));
    }

    @PostMapping("/register")
    public ResponseEntity<ResponseDTO> register(@RequestBody User user, HttpSession session) {
        try {
            if (authService.isLoggedIn(session)) {
                return ResponseEntity.badRequest().body(ResponseDTO.failed("Already logged in", "ALREADY_LOGGED_IN"));
            }
            String email = InputSanitizer.sanitizeEmail(user.getEmail());
            String password = InputSanitizer.sanitizePassword(user.getPassword());
            if (authService.register(email, password)) {
                return ResponseEntity.ok(ResponseDTO.success("User registered successfully"));
            }
            return ResponseEntity.badRequest().body(ResponseDTO.failed("User already exists", "USER_EXISTS"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ResponseDTO.failed(e.getMessage(), "VALIDATION_ERROR"));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ResponseDTO> login(@RequestBody User user, HttpSession session) {
        try {
            if (authService.isLoggedIn(session)) {
                return ResponseEntity.badRequest().body(ResponseDTO.failed("Already logged in", "ALREADY_LOGGED_IN"));
            }
            String email = InputSanitizer.sanitizeEmail(user.getEmail());
            String password = InputSanitizer.sanitizePassword(user.getPassword());
            if (authService.login(email, password, session)) {
                return ResponseEntity.ok(ResponseDTO.success("Login successful"));
            }
            return ResponseEntity.badRequest().body(ResponseDTO.failed("Invalid credentials", "INVALID_CREDENTIALS"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ResponseDTO.failed(e.getMessage(), "VALIDATION_ERROR"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ResponseDTO> logout(HttpSession session, HttpServletResponse response) {
        authService.logout(session);
        Cookie cookie = new Cookie("SESSION", null);
        cookie.setMaxAge(0);
        cookie.setPath("/");
        response.addCookie(cookie);
        return ResponseEntity.ok(ResponseDTO.success("Logout successful"));
    }

    @GetMapping("/check")
    public ResponseEntity<ResponseDTO> checkSession(HttpSession session) {
        if (authService.isLoggedIn(session)) {
            return ResponseEntity.ok(ResponseDTO.success("Logged in"));
        }
        return ResponseEntity.ok(ResponseDTO.failed("Not logged in", "NOT_LOGGED_IN"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ResponseDTO> forgotPassword(@RequestBody User user) {
        if (authService.resetPassword(user.getEmail())) {
            return ResponseEntity.ok(ResponseDTO.success("Password reset link sent"));
        }
        return ResponseEntity.badRequest().body(ResponseDTO.failed("Email not found", "EMAIL_NOT_FOUND"));
    }
}
