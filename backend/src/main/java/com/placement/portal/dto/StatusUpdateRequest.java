package com.placement.portal.dto;

public class StatusUpdateRequest {
    private String status;
    private String interviewDetails;
    private String offerLetterUrl;

    public StatusUpdateRequest() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getInterviewDetails() { return interviewDetails; }
    public void setInterviewDetails(String interviewDetails) { this.interviewDetails = interviewDetails; }

    public String getOfferLetterUrl() { return offerLetterUrl; }
    public void setOfferLetterUrl(String offerLetterUrl) { this.offerLetterUrl = offerLetterUrl; }

    private String assessmentLink;
    private String interviewLink;

    public String getAssessmentLink() { return assessmentLink; }
    public void setAssessmentLink(String assessmentLink) { this.assessmentLink = assessmentLink; }

    public String getInterviewLink() { return interviewLink; }
    public void setInterviewLink(String interviewLink) { this.interviewLink = interviewLink; }
}
