package com.ssafy.damdam.domain.reports.service;

import com.ssafy.damdam.domain.reports.dto.PeriodReportOutputDto;
import com.ssafy.damdam.domain.reports.dto.SessionReportOutputDto;
import com.ssafy.damdam.domain.reports.repository.PeriodReportRepository;
import com.ssafy.damdam.domain.reports.repository.SessionReportRepository;
import com.ssafy.damdam.global.util.user.UserUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final PeriodReportRepository periodReportRepository;
    private final SessionReportRepository sessionReportRepository;
    private final UserUtil userUtil;

    @Override
    public List<SessionReportOutputDto> getSReportList(String startDate, String endDate, String keyword) {
        return List.of();
    }

    @Override
    public List<PeriodReportOutputDto> getPReportList(String startDate, String endDate, String keyword) {
        return List.of();
    }
}
