package com.ssafy.damdam.domain.reports.repository;

import com.ssafy.damdam.domain.reports.entity.PeriodReport;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PeriodReportRepository extends JpaRepository<PeriodReport, Long>,
PeriodReportRepositoryCustom {


}
