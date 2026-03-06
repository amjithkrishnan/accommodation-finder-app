package com.example.webapp.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {
    
    @GetMapping(value = {"/{path:[^\\.]*}"})
    public String redirect(HttpServletRequest request) {
        String path = request.getRequestURI();
        if (path.startsWith("/api/")) {
            return null;
        }
        return "forward:/index.html";
    }
}
