package com.placement.portal.model;

import jakarta.persistence.*;

@Entity
@Table(name = "jobs")
public class JobPosting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "job_id")
    private Long id;

    @Column(nullable = false)
    private String companyName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_profile_id", nullable = false)
    private CompanyProfile companyProfile;

    @Column(nullable = false)
    private String jobTitle;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Double minCgpa;

    private String location;
    
    private String salaryPackage;
    
    @Column(columnDefinition = "TEXT")
    private String requiredSkills;
    
    @Column(columnDefinition = "TEXT")
    private String eligibilityCriteria;
    
    private String lastDateToApply;

    @Column(nullable = false)
    private String eligibleBranches = "ALL";

    @Column(nullable = false)
    private String status = "ACTIVE"; 

    @Column(columnDefinition = "TEXT")
    private String ctcComponents;

    @Column(columnDefinition = "TEXT")
    private String selectionRounds;

    @Column(columnDefinition = "TEXT")
    private String bondDetails;

    private String testPlatform;
    private String testDatetime;
    private String testLink;

    public JobPosting() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public CompanyProfile getCompanyProfile() { return companyProfile; }
    public void setCompanyProfile(CompanyProfile companyProfile) { this.companyProfile = companyProfile; }
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Double getMinCgpa() { return minCgpa; }
    public void setMinCgpa(Double minCgpa) { this.minCgpa = minCgpa; }
    
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

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getEligibleBranches() { return eligibleBranches; }
    public void setEligibleBranches(String eligibleBranches) { this.eligibleBranches = eligibleBranches; }

    public String getCtcComponents() { return ctcComponents; }
    public void setCtcComponents(String ctcComponents) { this.ctcComponents = ctcComponents; }

    public String getSelectionRounds() { return selectionRounds; }
    public void setSelectionRounds(String selectionRounds) { this.selectionRounds = selectionRounds; }

    public String getBondDetails() { return bondDetails; }
    public void setBondDetails(String bondDetails) { this.bondDetails = bondDetails; }

    public String getTestPlatform() { return testPlatform; }
    public void setTestPlatform(String testPlatform) { this.testPlatform = testPlatform; }
    
    public String getTestDatetime() { return testDatetime; }
    public void setTestDatetime(String testDatetime) { this.testDatetime = testDatetime; }
    
    public String getTestLink() { return testLink; }
    public void setTestLink(String testLink) { this.testLink = testLink; }
}
