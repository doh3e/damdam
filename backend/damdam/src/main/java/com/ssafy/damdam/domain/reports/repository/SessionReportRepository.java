package com.ssafy.damdam.domain.reports.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ssafy.damdam.domain.reports.entity.SessionReport;

public interface SessionReportRepository extends JpaRepository<SessionReport, Long> {
	Optional<SessionReport> findByCounseling_CounsId(Long counsId);
}
