package com.placement.portal.controller;

import com.placement.portal.dto.JobApplicationDTO;
import com.placement.portal.dto.JobPostingDTO;
import com.placement.portal.model.JobApplication;
import com.placement.portal.model.JobPosting;
import com.placement.portal.model.StudentProfile;
import com.placement.portal.repository.JobApplicationRepository;
import com.placement.portal.repository.JobPostingRepository;
import com.placement.portal.repository.StudentProfileRepository;
import com.placement.portal.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    @Autowired
    private JobPostingRepository jobPostingRepository;

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private com.placement.portal.service.AuditLogService auditLogService;
    
    @Autowired
    private com.placement.portal.repository.InterviewSlotRepository interviewSlotRepository;

    @GetMapping
    public ResponseEntity<?> getEligibleJobs(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String salary,
            @RequestParam(required = false) String branchFilter) {
        
        StudentProfile profile = studentProfileRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        List<JobPosting> jobs = jobPostingRepository.findByStatus("ACTIVE");
        
        // Filter jobs
        List<JobPostingDTO> jobDTOs = jobs.stream()
            .filter(j -> {
                if (search != null && !search.trim().isEmpty()) {
                    String s = search.toLowerCase();
                    boolean match = (j.getJobTitle() != null && j.getJobTitle().toLowerCase().contains(s)) ||
                                    (j.getCompanyName() != null && j.getCompanyName().toLowerCase().contains(s)) ||
                                    (j.getRequiredSkills() != null && j.getRequiredSkills().toLowerCase().contains(s));
                    if (!match) return false;
                }
                if (location != null && !location.trim().isEmpty()) {
                    if (j.getLocation() == null || !j.getLocation().toLowerCase().contains(location.toLowerCase())) {
                        return false;
                    }
                }
                if (salary != null && !salary.trim().isEmpty()) {
                    if (j.getSalaryPackage() == null || !j.getSalaryPackage().toLowerCase().contains(salary.toLowerCase())) {
                        return false;
                    }
                }
                if (branchFilter != null && !branchFilter.trim().isEmpty() && !branchFilter.equalsIgnoreCase("ALL")) {
                    if (j.getEligibleBranches() != null && !j.getEligibleBranches().equalsIgnoreCase("ALL")) {
                        if (!j.getEligibleBranches().contains(branchFilter)) {
                            return false;
                        }
                    }
                }
                return true;
            })
            .map(job -> new JobPostingDTO(
                job.getId(), job.getCompanyName(), job.getJobTitle(),
                job.getDescription(), job.getMinCgpa(), job.getStatus(),
                job.getLocation(), job.getSalaryPackage(), job.getRequiredSkills(),
                job.getEligibilityCriteria(), job.getLastDateToApply(),
                job.getCtcComponents(), job.getSelectionRounds(), job.getBondDetails(),
                job.getEligibleBranches(), job.getTestPlatform(), job.getTestDatetime(), job.getTestLink()
            )).collect(Collectors.toList());

        return ResponseEntity.ok(jobDTOs);
    }
    
    @GetMapping("/{jobId}")
    public ResponseEntity<?> getJobDetails(@AuthenticationPrincipal CustomUserDetails currentUser, @PathVariable Long jobId) {
        JobPosting job = jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
                
        JobPostingDTO dto = new JobPostingDTO(
                job.getId(), job.getCompanyName(), job.getJobTitle(),
                job.getDescription(), job.getMinCgpa(), job.getStatus(),
                job.getLocation(), job.getSalaryPackage(), job.getRequiredSkills(),
                job.getEligibilityCriteria(), job.getLastDateToApply(),
                job.getCtcComponents(), job.getSelectionRounds(), job.getBondDetails(),
                job.getEligibleBranches(), job.getTestPlatform(), job.getTestDatetime(), job.getTestLink()
        );
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/{jobId}/apply")
    public ResponseEntity<?> applyForJob(@AuthenticationPrincipal CustomUserDetails currentUser, 
                                         @PathVariable Long jobId) {
        StudentProfile profile = studentProfileRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        JobPosting job = jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getStatus().equals("ACTIVE")) {
            return ResponseEntity.badRequest().body("Job is no longer active");
        }

        // Eligibility checks
        if (profile.getCgpa() < job.getMinCgpa()) {
            return ResponseEntity.badRequest().body("Not eligible for this job based on CGPA criteria. Required: " + job.getMinCgpa() + ", Your CGPA: " + profile.getCgpa());
        }
        
        // Branch Check
        if (job.getEligibleBranches() != null && !job.getEligibleBranches().equalsIgnoreCase("ALL")) {
            String studentBranch = profile.getDepartment();
            if (studentBranch == null || !job.getEligibleBranches().contains(studentBranch)) {
                return ResponseEntity.badRequest().body("Not eligible for this job based on Branch criteria.");
            }
        }

        if (Boolean.TRUE.equals(profile.getIsOptedOut())) {
            return ResponseEntity.badRequest().body("You have opted out of Campus Placements for this academic year.");
        }

        if (jobApplicationRepository.existsByStudentProfileIdAndJobPostingId(profile.getId(), jobId)) {
            return ResponseEntity.badRequest().body("Already applied for this job");
        }

        // Rule Engine Check
        List<JobApplication> existingApps = jobApplicationRepository.findByStudentProfileId(profile.getId());
        double maxCurrentCTC = 0.0;
        boolean hasTier1Offer = false;

        for (JobApplication app : existingApps) {
            if (app.getStatus() == com.placement.portal.model.ApplicationStatus.SELECTED || 
                app.getStatus() == com.placement.portal.model.ApplicationStatus.OFFER_ACCEPTED ||
                app.getStatus() == com.placement.portal.model.ApplicationStatus.OFFER_EXTENDED) {
                double ctc = extractCTC(app.getJobPosting().getSalaryPackage());
                if (ctc >= 10.0) {
                    hasTier1Offer = true;
                }
                if (ctc > maxCurrentCTC) {
                    maxCurrentCTC = ctc;
                }
            }
        }

        if (hasTier1Offer) {
            return ResponseEntity.badRequest().body("Placement Policy Restriction: You have already secured a Tier-1 offer.");
        }

        if (maxCurrentCTC > 0) {
            double newJobCTC = extractCTC(job.getSalaryPackage());
            if (newJobCTC <= maxCurrentCTC) {
                return ResponseEntity.badRequest().body("Placement Policy Restriction: You can only apply for a role with a higher package than your current offer.");
            }
        }

        JobApplication application = new JobApplication();
        application.setStudentProfile(profile);
        application.setJobPosting(job);
        
        jobApplicationRepository.save(application);
        auditLogService.logAction("APPLY_JOB", profile.getUser().getEmail(), "Applied for job: " + job.getJobTitle());
        
        return ResponseEntity.ok("Successfully applied for the job");
    }

    @GetMapping("/applications")
    public ResponseEntity<?> getMyApplications(@AuthenticationPrincipal CustomUserDetails currentUser) {
        StudentProfile profile = studentProfileRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        List<JobApplication> applications = jobApplicationRepository.findByStudentProfileId(profile.getId());
        
        List<JobApplicationDTO> applicationDTOs = applications.stream().map(app -> {
            JobPosting job = app.getJobPosting();
            JobPostingDTO jobDTO = new JobPostingDTO(
                    job.getId(), job.getCompanyName(), job.getJobTitle(),
                    job.getDescription(), job.getMinCgpa(), job.getStatus(),
                    job.getLocation(), job.getSalaryPackage(), job.getRequiredSkills(),
                    job.getEligibilityCriteria(), job.getLastDateToApply(),
                    job.getCtcComponents(), job.getSelectionRounds(), job.getBondDetails(),
                    job.getEligibleBranches(), job.getTestPlatform(), job.getTestDatetime(), job.getTestLink()
            );
            return new JobApplicationDTO(app.getId(), jobDTO, null, app.getStatus(), app.getApplicationDate(), app.getInterviewDetails(), app.getOfferLetterUrl());
        }).collect(Collectors.toList());

        return ResponseEntity.ok(applicationDTOs);
    }
    
    @PostMapping("/applications/{appId}/respond")
    public ResponseEntity<?> respondToOffer(
            @AuthenticationPrincipal CustomUserDetails currentUser, 
            @PathVariable Long appId,
            @RequestBody Map<String, String> payload) {
        
        StudentProfile profile = studentProfileRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        JobApplication application = jobApplicationRepository.findById(appId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (!application.getStudentProfile().getId().equals(profile.getId())) {
            return ResponseEntity.status(403).body("Unauthorized");
        }

        String response = payload.get("response"); // "ACCEPT" or "DECLINE"
        if ("ACCEPT".equalsIgnoreCase(response)) {
            application.setStatus(com.placement.portal.model.ApplicationStatus.OFFER_ACCEPTED);
            auditLogService.logAction("OFFER_ACCEPTED", profile.getUser().getEmail(), "Accepted offer for job: " + application.getJobPosting().getJobTitle());
        } else if ("DECLINE".equalsIgnoreCase(response)) {
            application.setStatus(com.placement.portal.model.ApplicationStatus.OFFER_DECLINED);
            auditLogService.logAction("OFFER_DECLINED", profile.getUser().getEmail(), "Declined offer for job: " + application.getJobPosting().getJobTitle());
        } else {
            return ResponseEntity.badRequest().body("Invalid response");
        }

        jobApplicationRepository.save(application);
        return ResponseEntity.ok("Offer response recorded");
    }
    
    @GetMapping("/{jobId}/slots")
    public ResponseEntity<?> getAvailableSlots(@AuthenticationPrincipal CustomUserDetails currentUser, @PathVariable Long jobId) {
        // Return only unbooked slots
        return ResponseEntity.ok(interviewSlotRepository.findByJobPostingIdAndIsBookedFalseOrderBySlotTimeAsc(jobId));
    }
    
    @PostMapping("/slots/{slotId}/book")
    public ResponseEntity<?> bookSlot(@AuthenticationPrincipal CustomUserDetails currentUser, @PathVariable Long slotId) {
        StudentProfile profile = studentProfileRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Profile not found"));
                
        com.placement.portal.model.InterviewSlot slot = interviewSlotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));
                
        if (slot.isBooked()) {
            return ResponseEntity.badRequest().body("Slot is already booked");
        }
        
        slot.setBooked(true);
        slot.setStudentProfile(profile);
        interviewSlotRepository.save(slot);
        
        auditLogService.logAction("BOOK_SLOT", profile.getUser().getEmail(), "Booked interview slot at " + slot.getSlotTime() + " for job: " + slot.getJobPosting().getJobTitle());
        return ResponseEntity.ok("Slot booked successfully");
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<?> getLeaderboard() {
        List<JobApplication> selectedApps = jobApplicationRepository.findAll().stream()
                .filter(a -> a.getStatus() == com.placement.portal.model.ApplicationStatus.SELECTED || 
                             a.getStatus() == com.placement.portal.model.ApplicationStatus.OFFER_ACCEPTED)
                .collect(Collectors.toList());
                
        double maxCTC = 0.0;
        double sumCTC = 0.0;
        int count = 0;
        
        Map<String, Integer> branchPlaced = new java.util.HashMap<>();
        
        for (JobApplication app : selectedApps) {
            double ctc = extractCTC(app.getJobPosting().getSalaryPackage());
            if (ctc > maxCTC) maxCTC = ctc;
            sumCTC += ctc;
            count++;
            
            String branch = app.getStudentProfile().getDepartment();
            if (branch != null) {
                branchPlaced.put(branch, branchPlaced.getOrDefault(branch, 0) + 1);
            }
        }
        
        double avgCTC = count > 0 ? (sumCTC / count) : 0.0;
        
        // Calculate Branch Wise Percentage
        List<StudentProfile> allStudents = studentProfileRepository.findAll();
        Map<String, Integer> branchTotal = new java.util.HashMap<>();
        for (StudentProfile s : allStudents) {
            if (s.getDepartment() != null) {
                branchTotal.put(s.getDepartment(), branchTotal.getOrDefault(s.getDepartment(), 0) + 1);
            }
        }
        
        Map<String, Double> branchPercentage = new java.util.HashMap<>();
        for (String branch : branchTotal.keySet()) {
            int total = branchTotal.get(branch);
            int placed = branchPlaced.getOrDefault(branch, 0);
            double pct = total > 0 ? ((double) placed / total) * 100.0 : 0.0;
            branchPercentage.put(branch, Math.round(pct * 100.0) / 100.0);
        }
        
        Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("highestPackage", maxCTC);
        stats.put("averagePackage", Math.round(avgCTC * 100.0) / 100.0);
        stats.put("branchPlacementPercentages", branchPercentage);
        stats.put("totalPlaced", count);
        
        return ResponseEntity.ok(stats);
    }

    private Double extractCTC(String salaryPackage) {
        if (salaryPackage == null || salaryPackage.trim().isEmpty()) return 0.0;
        try {
            java.util.regex.Pattern p = java.util.regex.Pattern.compile("(\\d+(\\.\\d+)?)");
            java.util.regex.Matcher m = p.matcher(salaryPackage);
            if (m.find()) {
                return Double.parseDouble(m.group(1));
            }
        } catch (Exception e) {}
        return 0.0;
    }
}
