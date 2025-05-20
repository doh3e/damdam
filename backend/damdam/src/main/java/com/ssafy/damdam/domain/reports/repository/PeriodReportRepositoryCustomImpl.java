package com.ssafy.damdam.domain.reports.repository;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.ssafy.damdam.domain.reports.entity.PeriodReport;
import com.ssafy.damdam.domain.reports.entity.QPeriodReport;
import com.ssafy.damdam.domain.users.entity.Users;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;


@Repository
@RequiredArgsConstructor
public class PeriodReportRepositoryCustomImpl implements PeriodReportRepositoryCustom {

    private final JPAQueryFactory queryFactory;
    private final QPeriodReport pr =  QPeriodReport.periodReport;

    @Override
    public List<PeriodReport> findByFilter(Users user, LocalDate startDate, LocalDate endDate, String keyword) {
        BooleanBuilder builder = new BooleanBuilder();
        builder.and(pr.users.eq(user));

        if (startDate != null) {
            builder.and(pr.startDate.goe(startDate));
        }
        if (endDate != null) {
            builder.and(pr.endDate.loe(endDate));
        }

        if (keyword != null && !keyword.isBlank()) {
            String kw = "%" + keyword.trim() + "%";
            builder.and(
                    pr.pReportTitle.like(kw)
                            .or(pr.summary.like(kw))
            );
        }

        return queryFactory
                .selectFrom(pr)
                .where(builder)
                .orderBy(pr.createdAt.desc())
                .fetch();
    }
}
