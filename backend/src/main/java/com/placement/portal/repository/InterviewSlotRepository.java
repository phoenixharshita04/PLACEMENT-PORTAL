package com.placement.portal.repository;

import com.placement.portal.model.InterviewSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewSlotRepository extends JpaRepository<InterviewSlot, Long> {
    List<InterviewSlot> findByJobPostingIdOrderBySlotTimeAsc(Long jobId);
    List<InterviewSlot> findByJobPostingIdAndIsBookedFalseOrderBySlotTimeAsc(Long jobId);
    List<InterviewSlot> findByStudentProfileId(Long studentId);
}
