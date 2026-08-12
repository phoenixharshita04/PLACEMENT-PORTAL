package com.placement.portal.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class StudentProfileDTO {

    @JsonProperty("student_id")
    private Long id;
    private String name;
    private String email;
    private String rollNo;
    
    @JsonProperty("branch")
    private String department;
    
    private Double cgpa;
    private Integer graduationYear;
    
    @JsonProperty("resume")
    private String resumeLink;
    
    @JsonProperty("phone")
    private String mobileNumber;
    
    private String skills;
    private Boolean isOptedOut;
    private String projects;
    private String experience;
    private String tenthMarksheetUrl;
    private String twelfthMarksheetUrl;
    private String aadharUrl;
    private String profilePhotoUrl;

    public StudentProfileDTO() {}

    public StudentProfileDTO(Long id, String name, String rollNo, String department, Double cgpa, Integer graduationYear) {
        this.id = id;
        this.name = name;
        this.rollNo = rollNo;
        this.department = department;
        this.cgpa = cgpa;
        this.graduationYear = graduationYear;
    }

    public StudentProfileDTO(Long id, String name, String email, String rollNo, String department, Double cgpa, Integer graduationYear, String mobileNumber, String skills) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.rollNo = rollNo;
        this.department = department;
        this.cgpa = cgpa;
        this.graduationYear = graduationYear;
        this.mobileNumber = mobileNumber;
        this.skills = skills;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRollNo() { return rollNo; }
    public void setRollNo(String rollNo) { this.rollNo = rollNo; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public Double getCgpa() { return cgpa; }
    public void setCgpa(Double cgpa) { this.cgpa = cgpa; }
    public Integer getGraduationYear() { return graduationYear; }
    public void setGraduationYear(Integer graduationYear) { this.graduationYear = graduationYear; }
    public String getResumeLink() { return resumeLink; }
    public void setResumeLink(String resumeLink) { this.resumeLink = resumeLink; }
    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }
    public Boolean getIsOptedOut() { return isOptedOut; }
    public void setIsOptedOut(Boolean isOptedOut) { this.isOptedOut = isOptedOut; }
    public String getProjects() { return projects; }
    public void setProjects(String projects) { this.projects = projects; }
    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }
    public String getTenthMarksheetUrl() { return tenthMarksheetUrl; }
    public void setTenthMarksheetUrl(String tenthMarksheetUrl) { this.tenthMarksheetUrl = tenthMarksheetUrl; }
    public String getTwelfthMarksheetUrl() { return twelfthMarksheetUrl; }
    public void setTwelfthMarksheetUrl(String twelfthMarksheetUrl) { this.twelfthMarksheetUrl = twelfthMarksheetUrl; }
    public String getAadharUrl() { return aadharUrl; }
    public void setAadharUrl(String aadharUrl) { this.aadharUrl = aadharUrl; }
    public String getProfilePhotoUrl() { return profilePhotoUrl; }
    public void setProfilePhotoUrl(String profilePhotoUrl) { this.profilePhotoUrl = profilePhotoUrl; }
}
