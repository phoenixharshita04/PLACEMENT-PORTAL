package com.placement.portal.controller;

import com.placement.portal.model.ApplicationStatus;
import com.placement.portal.model.CompanyProfile;
import com.placement.portal.model.JobPosting;
import com.placement.portal.model.JobApplication;
import com.placement.portal.model.StudentProfile;
import com.placement.portal.model.AuditLog;
import com.placement.portal.repository.CompanyProfileRepository;
import com.placement.portal.repository.JobApplicationRepository;
import com.placement.portal.repository.JobPostingRepository;
import com.placement.portal.repository.StudentProfileRepository;
import com.placement.portal.repository.UserRepository;
import com.placement.portal.service.AuditLogService;
import com.placement.portal.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private CompanyProfileRepository companyProfileRepository;

    @Autowired
    private JobPostingRepository jobPostingRepository;

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogService auditLogService;
    
    @Autowired
    private AuditLogRepository auditLogRepository;

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Long>> getMetrics() {
        Map<String, Long> metrics = new HashMap<>();
        metrics.put("totalStudents", studentProfileRepository.count());
        metrics.put("totalCompanies", companyProfileRepository.count());
        metrics.put("totalJobs", jobPostingRepository.count());
        metrics.put("totalApplications", jobApplicationRepository.count());
        metrics.put("totalPlacedStudents", jobApplicationRepository.countByStatus(ApplicationStatus.SELECTED));
        return ResponseEntity.ok(metrics);
    }
    
    @GetMapping("/reports")
    public ResponseEntity<Map<String, Object>> getReports() {
        Map<String, Object> reports = new HashMap<>();
        
        long totalStudents = studentProfileRepository.count();
        long totalPlaced = jobApplicationRepository.countByStatus(ApplicationStatus.SELECTED);
        long totalUnplaced = totalStudents - totalPlaced;
        
        reports.put("totalStudents", totalStudents);
        reports.put("totalCompanies", companyProfileRepository.count());
        reports.put("totalJobs", jobPostingRepository.count());
        reports.put("totalApplications", jobApplicationRepository.count());
        reports.put("totalPlacedStudents", totalPlaced);
        reports.put("totalUnplacedStudents", totalUnplaced < 0 ? 0 : totalUnplaced);
        
        Map<String, Long> statusDistribution = new HashMap<>();
        for (ApplicationStatus status : ApplicationStatus.values()) {
            statusDistribution.put(status.name(), jobApplicationRepository.countByStatus(status));
        }
        reports.put("statusDistribution", statusDistribution);
        
        List<JobApplication> allSelected = jobApplicationRepository.findAll().stream()
                .filter(a -> a.getStatus() == ApplicationStatus.SELECTED)
                .toList();
                
        Map<String, Long> branchPlacements = new HashMap<>();
        for (JobApplication app : allSelected) {
            String branch = app.getStudentProfile().getDepartment();
            if (branch != null) {
                branchPlacements.put(branch, branchPlacements.getOrDefault(branch, 0L) + 1);
            }
        }
        reports.put("branchPlacements", branchPlacements);
        
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/students")
    public ResponseEntity<List<StudentProfile>> getAllStudents() {
        return ResponseEntity.ok(studentProfileRepository.findAll());
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
        Optional<StudentProfile> studentOpt = studentProfileRepository.findById(id);
        if (studentOpt.isPresent()) {
            StudentProfile student = studentOpt.get();
            jobApplicationRepository.deleteByStudentProfileId(id);
            studentProfileRepository.delete(student);
            if (student.getUser() != null) {
                userRepository.delete(student.getUser());
            }
            auditLogService.logAction("DELETE_STUDENT", "Admin", "Deleted student ID: " + id);
            return ResponseEntity.ok("Student deleted successfully");
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/companies")
    public ResponseEntity<List<CompanyProfile>> getAllCompanies() {
        return ResponseEntity.ok(companyProfileRepository.findAll());
    }

    @DeleteMapping("/companies/{id}")
    public ResponseEntity<?> deleteCompany(@PathVariable Long id) {
        Optional<CompanyProfile> companyOpt = companyProfileRepository.findById(id);
        if (companyOpt.isPresent()) {
            CompanyProfile company = companyOpt.get();
            
            // Delete associated job postings and their applications
            List<JobPosting> jobs = jobPostingRepository.findAll();
            for (JobPosting job : jobs) {
                if (job.getCompanyProfile() != null && job.getCompanyProfile().getId().equals(id)) {
                    jobApplicationRepository.deleteByJobPostingId(job.getId());
                }
            }
            jobPostingRepository.deleteByCompanyProfileId(id);
            
            companyProfileRepository.delete(company);
            if (company.getUser() != null) {
                userRepository.delete(company.getUser());
            }
            auditLogService.logAction("DELETE_COMPANY", "Admin", "Deleted company ID: " + id);
            return ResponseEntity.ok("Company deleted successfully");
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/jobs")
    public ResponseEntity<List<JobPosting>> getAllJobs() {
        return ResponseEntity.ok(jobPostingRepository.findAll());
    }

    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable Long id) {
        if (jobPostingRepository.existsById(id)) {
            jobApplicationRepository.deleteByJobPostingId(id);
            jobPostingRepository.deleteById(id);
            auditLogService.logAction("DELETE_JOB", "Admin", "Deleted job ID: " + id);
            return ResponseEntity.ok("Job deleted successfully");
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/applications")
    public ResponseEntity<List<JobApplication>> getAllApplications() {
        return ResponseEntity.ok(jobApplicationRepository.findAll());
    }
    
    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(auditLogRepository.findAllByOrderByTimestampDesc());
    }
}
