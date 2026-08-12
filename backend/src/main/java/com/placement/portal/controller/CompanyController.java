package com.placement.portal.controller;

import com.placement.portal.dto.CompanyProfileDTO;
import com.placement.portal.dto.JobPostingDTO;
import com.placement.portal.dto.JobApplicationDTO;
import com.placement.portal.dto.StatusUpdateRequest;
import com.placement.portal.dto.StudentProfileDTO;
import com.placement.portal.model.*;
import com.placement.portal.repository.*;
import com.placement.portal.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

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
    private InterviewSlotRepository interviewSlotRepository;

    private CompanyProfile getProfile(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        return companyProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    CompanyProfile newProfile = new CompanyProfile();
                    newProfile.setUser(user);
                    newProfile.setCompanyName("New Company");
                    return companyProfileRepository.save(newProfile);
                });
    }

    @GetMapping("/profile")
    public ResponseEntity<CompanyProfileDTO> getCompanyProfile(Authentication auth) {
        CompanyProfile profile = getProfile(auth);
        CompanyProfileDTO dto = new CompanyProfileDTO();
        dto.setId(profile.getId());
        dto.setCompanyName(profile.getCompanyName());
        dto.setWebsite(profile.getWebsite());
        dto.setIndustry(profile.getIndustry());
        dto.setDescription(profile.getDescription());
        dto.setContactNumber(profile.getContactNumber());
        dto.setEmail(profile.getUser() != null ? profile.getUser().getEmail() : "");
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateCompanyProfile(Authentication auth, @RequestBody CompanyProfileDTO req) {
        CompanyProfile profile = getProfile(auth);
        profile.setCompanyName(req.getCompanyName());
        profile.setWebsite(req.getWebsite());
        profile.setIndustry(req.getIndustry());
        profile.setDescription(req.getDescription());
        profile.setContactNumber(req.getContactNumber());
        companyProfileRepository.save(profile);
        auditLogService.logAction("UPDATE_PROFILE", auth.getName(), "Updated company profile");
        return ResponseEntity.ok("Profile updated successfully");
    }

    @PostMapping("/jobs")
    public ResponseEntity<?> postJob(Authentication auth, @RequestBody JobPosting req) {
        if (req.getMinCgpa() != null && req.getMinCgpa() < 6.0) {
            return ResponseEntity.badRequest().body("Minimum CGPA must be at least 6.0");
        }
        CompanyProfile profile = getProfile(auth);
        JobPosting job = new JobPosting();
        job.setCompanyProfile(profile);
        job.setCompanyName(profile.getCompanyName());
        job.setJobTitle(req.getJobTitle());
        job.setDescription(req.getDescription());
        job.setMinCgpa(req.getMinCgpa());
        job.setLocation(req.getLocation());
        job.setSalaryPackage(req.getSalaryPackage());
        job.setRequiredSkills(req.getRequiredSkills());
        job.setEligibilityCriteria(req.getEligibilityCriteria());
        job.setLastDateToApply(req.getLastDateToApply());
        job.setCtcComponents(req.getCtcComponents());
        job.setSelectionRounds(req.getSelectionRounds());
        job.setBondDetails(req.getBondDetails());
        if (req.getEligibleBranches() != null && !req.getEligibleBranches().trim().isEmpty()) {
            job.setEligibleBranches(req.getEligibleBranches());
        } else {
            job.setEligibleBranches("ALL");
        }
        job.setTestPlatform(req.getTestPlatform());
        job.setTestDatetime(req.getTestDatetime());
        job.setTestLink(req.getTestLink());
        job.setStatus("ACTIVE");
        JobPosting saved = jobPostingRepository.save(job);
        auditLogService.logAction("POST_JOB", auth.getName(), "Posted new job: " + job.getJobTitle());
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/jobs")
    public ResponseEntity<List<JobPosting>> getMyJobs(Authentication auth) {
        CompanyProfile profile = getProfile(auth);
        List<JobPosting> jobs = jobPostingRepository.findAll().stream()
                .filter(j -> j.getCompanyProfile() != null && j.getCompanyProfile().getId().equals(profile.getId()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(jobs);
    }

    @PutMapping("/jobs/{jobId}")
    public ResponseEntity<?> updateJob(Authentication auth, @PathVariable Long jobId, @RequestBody JobPosting req) {
        CompanyProfile profile = getProfile(auth);
        JobPosting job = jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (job.getCompanyProfile() == null || !job.getCompanyProfile().getId().equals(profile.getId())) {
            return ResponseEntity.status(403).body("Unauthorized");
        }

        if (req.getMinCgpa() != null && req.getMinCgpa() < 6.0) {
            return ResponseEntity.badRequest().body("Minimum CGPA must be at least 6.0");
        }

        job.setJobTitle(req.getJobTitle());
        job.setDescription(req.getDescription());
        job.setMinCgpa(req.getMinCgpa());
        job.setLocation(req.getLocation());
        job.setSalaryPackage(req.getSalaryPackage());
        job.setRequiredSkills(req.getRequiredSkills());
        job.setEligibilityCriteria(req.getEligibilityCriteria());
        job.setLastDateToApply(req.getLastDateToApply());
        job.setCtcComponents(req.getCtcComponents());
        job.setSelectionRounds(req.getSelectionRounds());
        job.setBondDetails(req.getBondDetails());
        if (req.getEligibleBranches() != null && !req.getEligibleBranches().trim().isEmpty()) {
            job.setEligibleBranches(req.getEligibleBranches());
        } else {
            job.setEligibleBranches("ALL");
        }
        job.setTestPlatform(req.getTestPlatform());
        job.setTestDatetime(req.getTestDatetime());
        job.setTestLink(req.getTestLink());
        // Status can also be updated if required, keeping it active by default
        jobPostingRepository.save(job);
        
        return ResponseEntity.ok("Job updated successfully");
    }

    @DeleteMapping("/jobs/{jobId}")
    public ResponseEntity<?> deleteJob(Authentication auth, @PathVariable Long jobId) {
        CompanyProfile profile = getProfile(auth);
        JobPosting job = jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (job.getCompanyProfile() == null || !job.getCompanyProfile().getId().equals(profile.getId())) {
            return ResponseEntity.status(403).body("Unauthorized");
        }

        // JobApplicationRepository has deleteByJobPostingId thanks to Admin implementation
        jobApplicationRepository.deleteByJobPostingId(jobId);
        jobPostingRepository.delete(job);
        
        return ResponseEntity.ok("Job deleted successfully");
    }

    @GetMapping("/jobs/{jobId}/applications")
    public ResponseEntity<List<JobApplicationDTO>> getJobApplications(Authentication auth, @PathVariable Long jobId) {
        CompanyProfile profile = getProfile(auth);
        JobPosting job = jobPostingRepository.findById(jobId).orElseThrow();
        if (job.getCompanyProfile() == null || !job.getCompanyProfile().getId().equals(profile.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        List<JobApplication> apps = jobApplicationRepository.findAll().stream()
                .filter(a -> a.getJobPosting().getId().equals(jobId))
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(apps.stream().map(a -> {
            StudentProfile s = a.getStudentProfile();
            StudentProfileDTO sdto = new StudentProfileDTO(s.getId(), s.getName(), s.getEmail(), s.getRollNo(), s.getDepartment(), s.getCgpa(), s.getGraduationYear(), s.getMobileNumber(), s.getSkills());
            sdto.setResumeLink(s.getResumeLink());
            return new JobApplicationDTO(a.getId(), null, sdto, a.getStatus(), a.getApplicationDate(), a.getInterviewDetails(), a.getOfferLetterUrl());
        }).collect(Collectors.toList()));
    }
    
    @PutMapping("/applications/{appId}/status")
    public ResponseEntity<?> updateApplicationStatus(Authentication auth, @PathVariable Long appId, @RequestBody StatusUpdateRequest req) {
        CompanyProfile profile = getProfile(auth);
        JobApplication app = jobApplicationRepository.findById(appId).orElseThrow();
        
        if (app.getJobPosting().getCompanyProfile() == null || !app.getJobPosting().getCompanyProfile().getId().equals(profile.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        try {
            app.setStatus(ApplicationStatus.valueOf(req.getStatus().toUpperCase()));
            app.setInterviewDetails(req.getInterviewDetails());
            app.setOfferLetterUrl(req.getOfferLetterUrl());
            jobApplicationRepository.save(app);
            auditLogService.logAction("UPDATE_APPLICATION_STATUS", auth.getName(), "Updated application " + appId + " to " + req.getStatus());
            return ResponseEntity.ok("Status updated");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid status");
        }
    }

    @GetMapping("/reports")
    public ResponseEntity<Map<String, Object>> getCompanyReports(Authentication auth) {
        CompanyProfile profile = getProfile(auth);
        
        List<JobPosting> jobs = jobPostingRepository.findByCompanyProfileId(profile.getId());
        long totalJobs = jobs.size();
        
        List<JobApplication> apps = jobApplicationRepository.findByJobPostingCompanyProfileId(profile.getId());
        long totalApplications = apps.size();
        long totalSelected = apps.stream().filter(a -> a.getStatus() == ApplicationStatus.SELECTED).count();
        long totalInterviews = apps.stream().filter(a -> a.getStatus() == ApplicationStatus.INTERVIEW_SCHEDULED).count();

        Map<String, Long> statusDistribution = new HashMap<>();
        for (JobApplication a : apps) {
            String status = a.getStatus().name();
            statusDistribution.put(status, statusDistribution.getOrDefault(status, 0L) + 1);
        }

        Map<String, Object> reports = new HashMap<>();
        reports.put("totalJobs", totalJobs);
        reports.put("totalApplications", totalApplications);
        reports.put("totalSelected", totalSelected);
        reports.put("totalInterviews", totalInterviews);
        reports.put("statusDistribution", statusDistribution);

        return ResponseEntity.ok(reports);
    }

    @GetMapping("/jobs/{jobId}/slots")
    public ResponseEntity<?> getJobSlots(Authentication auth, @PathVariable Long jobId) {
        CompanyProfile profile = getProfile(auth);
        JobPosting job = jobPostingRepository.findById(jobId).orElseThrow();
        if (!job.getCompanyProfile().getId().equals(profile.getId())) {
            return ResponseEntity.status(403).body("Unauthorized");
        }
        return ResponseEntity.ok(interviewSlotRepository.findByJobPostingIdOrderBySlotTimeAsc(jobId));
    }

    @PostMapping("/jobs/{jobId}/slots")
    public ResponseEntity<?> createJobSlots(Authentication auth, @PathVariable Long jobId, @RequestBody Map<String, String> payload) {
        CompanyProfile profile = getProfile(auth);
        JobPosting job = jobPostingRepository.findById(jobId).orElseThrow();
        if (!job.getCompanyProfile().getId().equals(profile.getId())) {
            return ResponseEntity.status(403).body("Unauthorized");
        }
        
        String startTimeStr = payload.get("startTime"); // format: 2026-07-26T10:00:00
        int slotCount = Integer.parseInt(payload.get("slotCount"));
        int durationMinutes = Integer.parseInt(payload.get("durationMinutes"));
        
        LocalDateTime startTime = LocalDateTime.parse(startTimeStr);
        
        for (int i = 0; i < slotCount; i++) {
            InterviewSlot slot = new InterviewSlot();
            slot.setJobPosting(job);
            slot.setSlotTime(startTime.plusMinutes((long) i * durationMinutes));
            interviewSlotRepository.save(slot);
        }
        
        auditLogService.logAction("CREATE_SLOTS", auth.getName(), "Created " + slotCount + " slots for job: " + job.getJobTitle());
        return ResponseEntity.ok("Slots generated successfully");
    }
}
