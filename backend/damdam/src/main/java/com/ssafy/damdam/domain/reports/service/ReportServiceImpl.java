package com.ssafy.damdam.domain.reports.service;

import com.ssafy.damdam.domain.reports.dto.PeriodReportOutputDto;
import com.ssafy.damdam.domain.reports.dto.SessionReportOutputDto;
import com.ssafy.damdam.domain.reports.entity.PeriodReport;
import com.ssafy.damdam.domain.reports.entity.SessionReport;
import com.ssafy.damdam.domain.reports.repository.PeriodReportRepository;
import com.ssafy.damdam.domain.reports.repository.SessionReportRepository;
import com.ssafy.damdam.domain.users.entity.Users;
import com.ssafy.damdam.domain.users.exception.auth.AuthException;
import com.ssafy.damdam.global.util.user.UserUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import static com.ssafy.damdam.domain.users.exception.auth.AuthExceptionCode.AUTH_MEMBER_NOT_FOUND;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final PeriodReportRepository periodReportRepository;
    private final SessionReportRepository sessionReportRepository;
    private final UserUtil userUtil;

    // 유저 검증 메서드
    private Users validateUser() {
        Users user = userUtil.getUser();
        if (user == null) {
            throw new AuthException(AUTH_MEMBER_NOT_FOUND);
        }
        return user;
    }

    @Override
    public List<SessionReportOutputDto> getSReportList(
            String startDate, String endDate, String keyword) {
        Users user = validateUser();

        LocalDate start = (startDate == null || startDate.isBlank())
                ? null
                : LocalDate.parse(startDate);
        LocalDate end = (endDate == null || endDate.isBlank())
                ? null
                : LocalDate.parse(endDate);

        List<SessionReport> reports = sessionReportRepository
                .findByFilter(user, start, end, keyword);

        return reports.stream()
                .map(r -> {
                    var counseling = r.getCounseling();
                    var member     = counseling.getUsers();    // Users 엔티티
                    return SessionReportOutputDto.builder()
                            .sReportId   (r.getSReportId())
                            .sReportTitle(r.getSReportTitle())

                            .userId      (member.getUserId())
                            .nickname    (member.getNickname())

                            .counsId     (counseling.getCounsId())
                            .counsTitle  (counseling.getCounsTitle())

                            .summary     (r.getSummary())
                            .analyze     (r.getAnalyze())

                            .valence     (r.getValence())
                            .arousal     (r.getArousal())

                            .createdAt   (r.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<PeriodReportOutputDto> getPReportList(
            String startDate, String endDate, String keyword) {
        Users user = validateUser();

        LocalDate start = (startDate == null || startDate.isBlank())
                ? null
                : LocalDate.parse(startDate);
        LocalDate end = (endDate == null || endDate.isBlank())
                ? null
                : LocalDate.parse(endDate);

        List<PeriodReport> reports = periodReportRepository
                .findByFilter(user, start, end, keyword);

        return List.of();
    }

}
