package com.ssafy.damdam.domain.reports.repository;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.ssafy.damdam.domain.reports.entity.QSessionReport;
import com.ssafy.damdam.domain.reports.entity.SessionReport;
import com.ssafy.damdam.domain.users.entity.Users;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class SessionReportRepositoryCustomImpl implements SessionReportRepositoryCustom {

    private final JPAQueryFactory queryFactory;
    private final QSessionReport sr = QSessionReport.sessionReport;

    @Override
    public List<SessionReport> findByFilter(Users user, LocalDate startDate, LocalDate endDate, String keyword) {
        BooleanBuilder builder = new BooleanBuilder();
        builder.and(sr.counseling.users.eq(user));

        if (startDate != null) {
            builder.and(sr.createdAt.goe(startDate.atStartOfDay()));
        }
        if (endDate != null) {
            builder.and(sr.createdAt.loe(endDate.atTime(LocalTime.MAX)));
        }

        if (keyword != null && !keyword.isBlank()) {
            String kw = "%" + keyword.trim() + "%";
            builder.and(
                    sr.sReportTitle.like(kw)
                            .or(sr.summary.like(kw))
                            .or(sr.analyze.like(kw))
            );
        }

        return queryFactory
                .selectFrom(sr)
                .where(builder)
                .orderBy(sr.createdAt.desc())
                .fetch();
    }
}
