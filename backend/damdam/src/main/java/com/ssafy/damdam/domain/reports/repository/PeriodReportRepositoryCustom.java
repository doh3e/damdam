package com.ssafy.damdam.domain.reports.repository;

import com.ssafy.damdam.domain.reports.entity.PeriodReport;
import com.ssafy.damdam.domain.users.entity.Users;

import java.time.LocalDate;
import java.util.List;

public interface PeriodReportRepositoryCustom {
    List<PeriodReport> findByFilter(
            Users user,
            LocalDate start,
            LocalDate end,
            String keyword);
}
