package com.placement.portal.controller;

import com.placement.portal.dto.StudentProfileDTO;
import com.placement.portal.model.StudentProfile;
import com.placement.portal.repository.StudentProfileRepository;
import com.placement.portal.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.Collections;

@RestController
@RequestMapping("/api/student/profile")
public class StudentProfileController {

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    private static final String UPLOAD_DIR = "uploads/";

    @GetMapping
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal CustomUserDetails currentUser) {
        StudentProfile profile = studentProfileRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        StudentProfileDTO dto = new StudentProfileDTO();
        dto.setName(profile.getName());
        dto.setEmail(profile.getUser() != null ? profile.getUser().getEmail() : "");
        dto.setRollNo(profile.getRollNo());
        dto.setDepartment(profile.getDepartment());
        dto.setCgpa(profile.getCgpa());
        dto.setGraduationYear(profile.getGraduationYear());
        dto.setResumeLink(profile.getResumeLink());
        dto.setMobileNumber(profile.getMobileNumber());
        dto.setSkills(profile.getSkills());
        dto.setProjects(profile.getProjects());
        dto.setExperience(profile.getExperience());
        dto.setTenthMarksheetUrl(profile.getTenthMarksheetUrl());
        dto.setTwelfthMarksheetUrl(profile.getTwelfthMarksheetUrl());
        dto.setAadharUrl(profile.getAadharUrl());
        dto.setProfilePhotoUrl(profile.getProfilePhotoUrl());
        dto.setIsOptedOut(profile.getIsOptedOut() != null ? profile.getIsOptedOut() : false);

        return ResponseEntity.ok(dto);
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal CustomUserDetails currentUser, 
                                           @RequestBody StudentProfileDTO profileDTO) {
        StudentProfile profile = studentProfileRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        profile.setName(profileDTO.getName());
        profile.setDepartment(profileDTO.getDepartment());
        profile.setCgpa(profileDTO.getCgpa());
        profile.setGraduationYear(profileDTO.getGraduationYear());
        profile.setResumeLink(profileDTO.getResumeLink());
        profile.setMobileNumber(profileDTO.getMobileNumber());
        profile.setSkills(profileDTO.getSkills());
        profile.setProjects(profileDTO.getProjects());
        profile.setExperience(profileDTO.getExperience());
        if (profileDTO.getTenthMarksheetUrl() != null) profile.setTenthMarksheetUrl(profileDTO.getTenthMarksheetUrl());
        if (profileDTO.getTwelfthMarksheetUrl() != null) profile.setTwelfthMarksheetUrl(profileDTO.getTwelfthMarksheetUrl());
        if (profileDTO.getAadharUrl() != null) profile.setAadharUrl(profileDTO.getAadharUrl());
        if (profileDTO.getProfilePhotoUrl() != null) profile.setProfilePhotoUrl(profileDTO.getProfilePhotoUrl());
        
        if (profileDTO.getIsOptedOut() != null) {
            profile.setIsOptedOut(profileDTO.getIsOptedOut());
        }
        
        studentProfileRepository.save(profile);
        
        return ResponseEntity.ok("Profile updated successfully");
    }

    @PostMapping("/resume")
    public ResponseEntity<?> uploadResume(@AuthenticationPrincipal CustomUserDetails currentUser,
                                          @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please select a file to upload.");
        }

        StudentProfile profile = studentProfileRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        try {
            File dir = new File(UPLOAD_DIR);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path path = Paths.get(UPLOAD_DIR + fileName);
            Files.write(path, file.getBytes());

            String fileUrl = "/uploads/" + fileName;
            profile.setResumeLink(fileUrl);
            studentProfileRepository.save(profile);

            return ResponseEntity.ok(fileUrl);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to upload file.");
        }
    }

    @PostMapping("/upload-document")
    public ResponseEntity<?> uploadDocument(@AuthenticationPrincipal CustomUserDetails currentUser,
                                            @RequestParam("file") MultipartFile file,
                                            @RequestParam("type") String docType) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please select a file to upload.");
        }

        StudentProfile profile = studentProfileRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        try {
            File dir = new File(UPLOAD_DIR);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path path = Paths.get(UPLOAD_DIR + fileName);
            Files.write(path, file.getBytes());

            String fileUrl = "/uploads/" + fileName;
            
            if ("TENTH".equalsIgnoreCase(docType)) {
                profile.setTenthMarksheetUrl(fileUrl);
            } else if ("TWELFTH".equalsIgnoreCase(docType)) {
                profile.setTwelfthMarksheetUrl(fileUrl);
            } else if ("AADHAR".equalsIgnoreCase(docType)) {
                profile.setAadharUrl(fileUrl);
            } else {
                return ResponseEntity.badRequest().body("Invalid document type");
            }
            
            studentProfileRepository.save(profile);

            return ResponseEntity.ok(fileUrl);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Could not upload document: " + e.getMessage());
        }
    }

    @PostMapping("/photo")
    public ResponseEntity<?> uploadPhoto(@AuthenticationPrincipal CustomUserDetails currentUser,
                                          @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please select a file to upload.");
        }

        StudentProfile profile = studentProfileRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        try {
            File dir = new File(UPLOAD_DIR);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path path = Paths.get(UPLOAD_DIR + fileName);
            Files.write(path, file.getBytes());

            String fileUrl = "/api/files/" + fileName;
            profile.setProfilePhotoUrl(fileUrl);
            studentProfileRepository.save(profile);

            return ResponseEntity.ok(Collections.singletonMap("fileUrl", fileUrl));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Could not upload photo: " + e.getMessage());
        }
    }
}
