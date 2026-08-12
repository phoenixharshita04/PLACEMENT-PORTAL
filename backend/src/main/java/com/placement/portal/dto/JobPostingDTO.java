package com.placement.portal.dto;

public class JobPostingDTO {
    private Long id;
    private String companyName;
    private String jobTitle;
    private String description;
    private Double minCgpa;
    private String status;
    private String location;
    private String salaryPackage;
    private String requiredSkills;
    private String eligibilityCriteria;
    private String lastDateToApply;
    private String ctcComponents;
    private String selectionRounds;
    private String bondDetails;
    private String eligibleBranches = "ALL";
    private String testPlatform;
    private String testDatetime;
    private String testLink;

    public JobPostingDTO() {}

    public JobPostingDTO(Long id, String companyName, String jobTitle, String description, Double minCgpa, String status) {
        this.id = id;
        this.companyName = companyName;
        this.jobTitle = jobTitle;
        this.description = description;
        this.minCgpa = minCgpa;
        this.status = status;
    }
    
    public JobPostingDTO(Long id, String companyName, String jobTitle, String description, Double minCgpa, String status, String location, String salaryPackage, String requiredSkills, String eligibilityCriteria, String lastDateToApply) {
        this.id = id;
        this.companyName = companyName;
        this.jobTitle = jobTitle;
        this.description = description;
        this.minCgpa = minCgpa;
        this.status = status;
        this.location = location;
        this.salaryPackage = salaryPackage;
        this.requiredSkills = requiredSkills;
        this.eligibilityCriteria = eligibilityCriteria;
        this.lastDateToApply = lastDateToApply;
    }
    
    public JobPostingDTO(Long id, String companyName, String jobTitle, String description, Double minCgpa, String status, String location, String salaryPackage, String requiredSkills, String eligibilityCriteria, String lastDateToApply, String ctcComponents, String selectionRounds, String bondDetails, String eligibleBranches, String testPlatform, String testDatetime, String testLink) {
        this.id = id;
        this.companyName = companyName;
        this.jobTitle = jobTitle;
        this.description = description;
        this.minCgpa = minCgpa;
        this.status = status;
        this.location = location;
        this.salaryPackage = salaryPackage;
        this.requiredSkills = requiredSkills;
        this.eligibilityCriteria = eligibilityCriteria;
        this.lastDateToApply = lastDateToApply;
        this.ctcComponents = ctcComponents;
        this.selectionRounds = selectionRounds;
        this.bondDetails = bondDetails;
        this.eligibleBranches = eligibleBranches;
        this.testPlatform = testPlatform;
        this.testDatetime = testDatetime;
        this.testLink = testLink;
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Double getMinCgpa() { return minCgpa; }
    public void setMinCgpa(Double minCgpa) { this.minCgpa = minCgpa; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getSalaryPackage() { return salaryPackage; }
    public void setSalaryPackage(String salaryPackage) { this.salaryPackage = salaryPackage; }
    public String getRequiredSkills() { return requiredSkills; }
    public void setRequiredSkills(String requiredSkills) { this.requiredSkills = requiredSkills; }
    public String getEligibilityCriteria() { return eligibilityCriteria; }
    public void setEligibilityCriteria(String eligibilityCriteria) { this.eligibilityCriteria = eligibilityCriteria; }
    public String getLastDateToApply() { return lastDateToApply; }
    public void setLastDateToApply(String lastDateToApply) { this.lastDateToApply = lastDateToApply; }
    
    public String getCtcComponents() { return ctcComponents; }
    public void setCtcComponents(String ctcComponents) { this.ctcComponents = ctcComponents; }
    
    public String getSelectionRounds() { return selectionRounds; }
    public void setSelectionRounds(String selectionRounds) { this.selectionRounds = selectionRounds; }
    
    public String getBondDetails() { return bondDetails; }
    public void setBondDetails(String bondDetails) { this.bondDetails = bondDetails; }
    
    public String getEligibleBranches() { return eligibleBranches; }
    public void setEligibleBranches(String eligibleBranches) { this.eligibleBranches = eligibleBranches; }

    public String getTestPlatform() { return testPlatform; }
    public void setTestPlatform(String testPlatform) { this.testPlatform = testPlatform; }
    
    public String getTestDatetime() { return testDatetime; }
    public void setTestDatetime(String testDatetime) { this.testDatetime = testDatetime; }
    
    public String getTestLink() { return testLink; }
    public void setTestLink(String testLink) { this.testLink = testLink; }
}
