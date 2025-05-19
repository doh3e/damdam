package com.ssafy.damdam.domain.reports.repository;

import com.ssafy.damdam.domain.reports.entity.SessionReport;
import com.ssafy.damdam.domain.users.entity.Users;

import java.time.LocalDate;
import java.util.List;

public interface SessionReportRepositoryCustom {
    List<SessionReport> findByFilter(
            Users user,
            LocalDate startDate,
            LocalDate endDate,
            String keyword
    );
}
