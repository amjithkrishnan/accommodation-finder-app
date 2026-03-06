package com.example.serviceapp.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class InternalSecurityFilter implements Filter {

    @Value("${serviceapp.internal.secret:default-secret-change-in-production}")
    private String expectedSecret;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        String path = httpRequest.getRequestURI();
        
        // Skip auth endpoints (called directly by WebApp AuthService)
        if (path.startsWith("/api/auth/")) {
            chain.doFilter(request, response);
            return;
        }
        
        // Validate internal secret for all other API calls
        if (path.startsWith("/api/")) {
            String secret = httpRequest.getHeader("X-Internal-Secret");
            
            if (secret == null || !secret.equals(expectedSecret)) {
                httpResponse.setStatus(HttpServletResponse.SC_FORBIDDEN);
                httpResponse.setContentType("application/json");
                httpResponse.getWriter().write("{\"status\":\"error\",\"message\":\"Direct access forbidden\"}");
                return;
            }
        }
        
        chain.doFilter(request, response);
    }
}
