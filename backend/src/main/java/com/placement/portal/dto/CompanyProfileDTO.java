package com.placement.portal.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CompanyProfileDTO {
    
    @JsonProperty("company_id")
    private Long id;
    
    @JsonProperty("company_name")
    private String companyName;
    
    private String email;
    private String website;
    private String industry;
    private String description;
    private String contactNumber;

    public CompanyProfileDTO() {}

    public CompanyProfileDTO(Long id, String companyName, String email, String website, String industry, String description, String contactNumber) {
        this.id = id;
        this.companyName = companyName;
        this.email = email;
        this.website = website;
        this.industry = industry;
        this.description = description;
        this.contactNumber = contactNumber;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }
    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }
}
