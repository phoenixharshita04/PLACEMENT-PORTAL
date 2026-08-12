package com.placement.portal.repository;

import com.placement.portal.model.ApplicationStatus;
import com.placement.portal.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByStudentProfileId(Long studentProfileId);
    boolean existsByStudentProfileIdAndJobPostingId(Long studentProfileId, Long jobPostingId);
    List<JobApplication> findByJobPostingCompanyProfileId(Long companyProfileId);

    @Transactional
    void deleteByStudentProfileId(Long studentProfileId);

    @Transactional
    void deleteByJobPostingId(Long jobPostingId);

    long countByStatus(ApplicationStatus status);
}
