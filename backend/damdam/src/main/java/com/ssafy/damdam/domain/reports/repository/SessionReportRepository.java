package com.ssafy.damdam.domain.reports.repository;

import com.ssafy.damdam.domain.reports.entity.SessionReport;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SessionReportRepository extends JpaRepository<SessionReport, Long> {
}
