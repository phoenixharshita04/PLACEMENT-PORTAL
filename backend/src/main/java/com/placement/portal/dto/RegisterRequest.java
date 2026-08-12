package com.placement.portal.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class RegisterRequest {
    private String email;
    private String password;

    // For Student
    private String name;
    private String rollNo;
    
    @JsonProperty("branch")
    private String department;
    
    private Double cgpa;
    private Integer graduationYear;

    // For Role (STUDENT or COMPANY)
    private String role;

    // For Company
    @JsonProperty("company_name")
    private String companyName;

    public RegisterRequest() {}

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getRollNo() { return rollNo; }
    public void setRollNo(String rollNo) { this.rollNo = rollNo; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public Double getCgpa() { return cgpa; }
    public void setCgpa(Double cgpa) { this.cgpa = cgpa; }
    public Integer getGraduationYear() { return graduationYear; }
    public void setGraduationYear(Integer graduationYear) { this.graduationYear = graduationYear; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
}
