package com.lms.repository;

import com.lms.entity.Leave;
import com.lms.entity.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface LeaveRepository extends JpaRepository<Leave, Long> {

    List<Leave> findByUserIdOrderByStartDateDesc(Long userId);

    List<Leave> findByStatusOrderByStartDateAsc(LeaveStatus status);

    // Find leaves (excluding a given leave id) that belong to OTHER users
    // and overlap with the given date range. Used for overlap-warning detection.
    @Query("SELECT l FROM Leave l WHERE l.status = 'PLANNED' " +
            "AND l.user.id <> :userId " +
            "AND l.startDate <= :endDate AND l.endDate >= :startDate")
    List<Leave> findOverlappingLeavesForOtherUsers(@Param("userId") Long userId,
                                                     @Param("startDate") LocalDate startDate,
                                                     @Param("endDate") LocalDate endDate);

    // All leaves overlapping a given range (any user) - used for admin overlap dashboard
    @Query("SELECT l FROM Leave l WHERE l.status = 'PLANNED' " +
            "AND l.startDate <= :endDate AND l.endDate >= :startDate")
    List<Leave> findAllOverlappingInRange(@Param("startDate") LocalDate startDate,
                                           @Param("endDate") LocalDate endDate);

    List<Leave> findByStatusAndStartDateGreaterThanEqualOrderByStartDateAsc(LeaveStatus status, LocalDate from);
}
