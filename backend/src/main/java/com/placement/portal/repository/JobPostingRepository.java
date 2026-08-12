package com.placement.portal.repository;

import com.placement.portal.model.JobPosting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {
    List<JobPosting> findByStatus(String status);
    List<JobPosting> findByCompanyProfileId(Long companyProfileId);

    @Transactional
    void deleteByCompanyProfileId(Long companyProfileId);
}
