package com.placement.portal.controller;

import java.util.Map;
import java.util.HashMap;

import com.placement.portal.dto.JwtAuthenticationResponse;
import com.placement.portal.dto.LoginRequest;
import com.placement.portal.dto.RegisterRequest;
import com.placement.portal.model.Role;
import com.placement.portal.model.StudentProfile;
import com.placement.portal.model.CompanyProfile;
import com.placement.portal.model.User;
import com.placement.portal.repository.StudentProfileRepository;
import com.placement.portal.repository.CompanyProfileRepository;
import com.placement.portal.repository.UserRepository;
import com.placement.portal.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private CompanyProfileRepository companyProfileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        
        User user = userRepository.findByEmail(loginRequest.getEmail()).orElseThrow();

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("token", jwt);
        response.put("accessToken", jwt);
        response.put("role", user.getRole().name());
        response.put("userId", user.getId());

        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("email", user.getEmail());
        userMap.put("role", user.getRole().name());
        response.put("user", userMap);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        if(userRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        Role userRole = Role.STUDENT; // Default
        if (registerRequest.getRole() != null) {
            try {
                userRole = Role.valueOf(registerRequest.getRole().toUpperCase());
            } catch (Exception e) {
                return ResponseEntity.badRequest().body("Error: Invalid role!");
            }
        }

        if (userRole == Role.STUDENT && registerRequest.getRollNo() != null && studentProfileRepository.existsByRollNo(registerRequest.getRollNo())) {
            return ResponseEntity.badRequest().body("Error: Roll Number is already in use!");
        }

        if (userRole == Role.STUDENT && registerRequest.getCgpa() != null && registerRequest.getCgpa() < 6.0) {
            return ResponseEntity.badRequest().body("Error: Minimum CGPA allowed is 6.0");
        }

        // Creating user's account
        User user = new User();
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setRole(userRole);

        User savedUser = userRepository.save(user);

        if (userRole == Role.STUDENT) {
            StudentProfile profile = new StudentProfile();
            profile.setUser(savedUser);
            profile.setName(registerRequest.getName());
            profile.setRollNo(registerRequest.getRollNo());
            profile.setDepartment(registerRequest.getDepartment());
            profile.setCgpa(registerRequest.getCgpa());
            profile.setGraduationYear(registerRequest.getGraduationYear());
            studentProfileRepository.save(profile);
        } else if (userRole == Role.COMPANY) {
            CompanyProfile profile = new CompanyProfile();
            profile.setUser(savedUser);
            profile.setCompanyName(registerRequest.getCompanyName() != null ? registerRequest.getCompanyName() : "Unknown");
            companyProfileRepository.save(profile);
        }

        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Error: Email is required!");
        }
        // Mock handler: in a real application, this would send an email with a reset link.
        return ResponseEntity.ok("If the email exists, a password reset link has been sent.");
    }
}
