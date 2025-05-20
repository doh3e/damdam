package com.ssafy.damdam.domain.reports.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import com.ssafy.damdam.domain.reports.dto.SessionReportOutputDto;
import com.ssafy.damdam.domain.users.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ssafy.damdam.domain.reports.entity.SessionReport;

public interface SessionReportRepository extends JpaRepository<SessionReport, Long>,
SessionReportRepositoryCustom {

    Optional<SessionReport> findByCounseling_CounsId(Long counsId);

}
