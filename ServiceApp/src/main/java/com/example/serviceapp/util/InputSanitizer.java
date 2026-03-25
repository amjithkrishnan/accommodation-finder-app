package com.example.serviceapp.util;

import org.springframework.util.StringUtils;
import java.util.List;
import java.util.stream.Collectors;

public class InputSanitizer {

    private static final int MAX_SHORT = 255;
    private static final int MAX_LONG = 2000;
    private static final int MAX_EMAIL = 254;

    // Strip HTML tags and dangerous characters
    public static String sanitize(String input) {
        if (input == null) return null;
        return input
            .replaceAll("<[^>]*>", "")           // strip HTML tags
            .replaceAll("[<>\"'%;()&+]", "")      // strip dangerous chars
            .trim();
    }

    public static String sanitizeEmail(String email) {
        if (email == null) return null;
        String cleaned = email.trim().toLowerCase();
        if (cleaned.length() > MAX_EMAIL) throw new IllegalArgumentException("Email too long");
        if (!cleaned.matches("^[\\w._%+\\-]+@[\\w.\\-]+\\.[a-z]{2,}$"))
            throw new IllegalArgumentException("Invalid email format");
        return cleaned;
    }

    public static String sanitizeShort(String input, String fieldName) {
        if (input == null) return null;
        String cleaned = sanitize(input);
        if (cleaned.length() > MAX_SHORT)
            throw new IllegalArgumentException(fieldName + " is too long (max " + MAX_SHORT + " characters)");
        return cleaned;
    }

    public static String sanitizeLong(String input, String fieldName) {
        if (input == null) return null;
        String cleaned = sanitize(input);
        if (cleaned.length() > MAX_LONG)
            throw new IllegalArgumentException(fieldName + " is too long (max " + MAX_LONG + " characters)");
        return cleaned;
    }

    public static String sanitizePassword(String password) {
        if (password == null || password.isBlank())
            throw new IllegalArgumentException("Password is required");
        if (password.length() < 6)
            throw new IllegalArgumentException("Password must be at least 6 characters");
        if (password.length() > 128)
            throw new IllegalArgumentException("Password too long");
        return password;
    }

    public static List<String> sanitizeList(List<String> items, String fieldName) {
        if (items == null) return null;
        if (items.size() > 50) throw new IllegalArgumentException(fieldName + " list too large");
        return items.stream()
            .map(item -> sanitizeShort(item, fieldName))
            .filter(item -> item != null && !item.isBlank())
            .collect(Collectors.toList());
    }
}
