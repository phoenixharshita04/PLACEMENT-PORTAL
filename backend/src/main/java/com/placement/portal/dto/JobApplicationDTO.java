package com.placement.portal.dto;

import com.placement.portal.model.ApplicationStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;

public class JobApplicationDTO {
    @JsonProperty("application_id")
    private Long id;
    
    private JobPostingDTO jobPosting;
    private StudentProfileDTO studentProfile;
    
    private ApplicationStatus status;
    
    @JsonProperty("applied_date")
    private LocalDate applicationDate;
    private String interviewDetails;
    private String offerLetterUrl;

    public JobApplicationDTO() {}
    
    public JobApplicationDTO(Long id, JobPostingDTO jobPosting, StudentProfileDTO studentProfile, ApplicationStatus status, LocalDate applicationDate) {
        this.id = id;
        this.jobPosting = jobPosting;
        this.studentProfile = studentProfile;
        this.status = status;
        this.applicationDate = applicationDate;
    }

    public JobApplicationDTO(Long id, JobPostingDTO jobPosting, StudentProfileDTO studentProfile, ApplicationStatus status, LocalDate applicationDate, String interviewDetails, String offerLetterUrl) {
        this.id = id;
        this.jobPosting = jobPosting;
        this.studentProfile = studentProfile;
        this.status = status;
        this.applicationDate = applicationDate;
        this.interviewDetails = interviewDetails;
        this.offerLetterUrl = offerLetterUrl;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public JobPostingDTO getJobPosting() { return jobPosting; }
    public void setJobPosting(JobPostingDTO jobPosting) { this.jobPosting = jobPosting; }
    public StudentProfileDTO getStudentProfile() { return studentProfile; }
    public void setStudentProfile(StudentProfileDTO studentProfile) { this.studentProfile = studentProfile; }
    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }
    public LocalDate getApplicationDate() { return applicationDate; }
    public void setApplicationDate(LocalDate applicationDate) { this.applicationDate = applicationDate; }
    
    public String getInterviewDetails() { return interviewDetails; }
    public void setInterviewDetails(String interviewDetails) { this.interviewDetails = interviewDetails; }
    
    public String getOfferLetterUrl() { return offerLetterUrl; }
    public void setOfferLetterUrl(String offerLetterUrl) { this.offerLetterUrl = offerLetterUrl; }
}
