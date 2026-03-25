package com.example.serviceapp.service;

import com.example.serviceapp.dto.UserDTO;
import com.example.serviceapp.model.User;
import com.example.serviceapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import jakarta.servlet.http.HttpSession;
import java.util.Optional;

@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(12);

    public boolean register(String email, String password) {
        if (userRepository.findByEmail(email).isPresent()) return false;
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        userRepository.save(user);
        return true;
    }

    public boolean login(String email, String password, HttpSession session) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent() && passwordEncoder.matches(password, userOpt.get().getPassword())) {
            User user = userOpt.get();
            UserDTO userDTO = new UserDTO(user.getId(), user.getEmail(), user.getName());
            session.setAttribute("USER", userDTO);
            return true;
        }
        return false;
    }

    public boolean resetPassword(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    public boolean isLoggedIn(HttpSession session) {
        return session.getAttribute("USER") != null;
    }

    public UserDTO getUser(HttpSession session) {
        return (UserDTO) session.getAttribute("USER");
    }

    public void logout(HttpSession session) {
        session.invalidate();
    }
}
