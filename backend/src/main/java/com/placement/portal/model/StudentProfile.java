package com.placement.portal.model;

import jakarta.persistence.*;

@Entity
@Table(name = "students")
public class StudentProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "student_id")
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User user;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "email")
    private String email;

    @Column(nullable = false, unique = true)
    private String rollNo;

    @Column(name = "branch", nullable = false, length = 100)
    private String department;

    @Column(name = "cgpa", columnDefinition = "DECIMAL(3,2)", nullable = false)
    private Double cgpa;

    @Column(nullable = false)
    private Integer graduationYear;

    @Column(name = "resume")
    private String resumeLink;

    @Column(name = "phone", length = 20)
    private String mobileNumber;

    @Column(name = "skills", columnDefinition = "TEXT")
    private String skills;

    @Column(name = "projects", columnDefinition = "TEXT")
    private String projects;

    @Column(name = "experience", columnDefinition = "TEXT")
    private String experience;

    @Column(name = "tenth_marksheet_url")
    private String tenthMarksheetUrl;

    @Column(name = "twelfth_marksheet_url")
    private String twelfthMarksheetUrl;

    @Column(name = "aadhar_url")
    private String aadharUrl;

    @Column(name = "profile_photo_url")
    private String profilePhotoUrl;

    @Column(name = "is_opted_out")
    private Boolean isOptedOut = false;

    public StudentProfile() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRollNo() {
        return rollNo;
    }

    public void setRollNo(String rollNo) {
        this.rollNo = rollNo;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Double getCgpa() {
        return cgpa;
    }

    public void setCgpa(Double cgpa) {
        this.cgpa = cgpa;
    }

    public Integer getGraduationYear() {
        return graduationYear;
    }

    public void setGraduationYear(Integer graduationYear) {
        this.graduationYear = graduationYear;
    }

    public String getResumeLink() {
        return resumeLink;
    }

    public void setResumeLink(String resumeLink) {
        this.resumeLink = resumeLink;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    public String getSkills() {
        return skills;
    }

    public void setSkills(String skills) {
        this.skills = skills;
    }

    public Boolean getIsOptedOut() {
        return isOptedOut;
    }

    public void setIsOptedOut(Boolean isOptedOut) {
        this.isOptedOut = isOptedOut;
    }

    public String getProjects() {
        return projects;
    }

    public void setProjects(String projects) {
        this.projects = projects;
    }

    public String getExperience() {
        return experience;
    }

    public void setExperience(String experience) {
        this.experience = experience;
    }

    public String getTenthMarksheetUrl() {
        return tenthMarksheetUrl;
    }

    public void setTenthMarksheetUrl(String tenthMarksheetUrl) {
        this.tenthMarksheetUrl = tenthMarksheetUrl;
    }

    public String getTwelfthMarksheetUrl() {
        return twelfthMarksheetUrl;
    }

    public void setTwelfthMarksheetUrl(String twelfthMarksheetUrl) {
        this.twelfthMarksheetUrl = twelfthMarksheetUrl;
    }

    public String getAadharUrl() {
        return aadharUrl;
    }

    public void setAadharUrl(String aadharUrl) {
        this.aadharUrl = aadharUrl;
    }

    public String getProfilePhotoUrl() {
        return profilePhotoUrl;
    }

    public void setProfilePhotoUrl(String profilePhotoUrl) {
        this.profilePhotoUrl = profilePhotoUrl;
    }
}
