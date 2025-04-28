package com.ssafy.damdam.domain.reports.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QPeriodReport is a Querydsl query type for PeriodReport
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QPeriodReport extends EntityPathBase<PeriodReport> {

    private static final long serialVersionUID = 1677865774L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QPeriodReport periodReport = new QPeriodReport("periodReport");

    public final com.ssafy.damdam.global.audit.QBaseTimeEntity _super = new com.ssafy.damdam.global.audit.QBaseTimeEntity(this);

    public final StringPath advice = createString("advice");

    public final StringPath compliment = createString("compliment");

    public final ListPath<Long, NumberPath<Long>> counselList = this.<Long, NumberPath<Long>>createList("counselList", Long.class, NumberPath.class, PathInits.DIRECT2);

    public final NumberPath<Integer> counselTime = createNumber("counselTime", Integer.class);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> createdAt = _super.createdAt;

    public final DatePath<java.time.LocalDate> endDate = createDate("endDate", java.time.LocalDate.class);

    public final NumberPath<Long> pReportId = createNumber("pReportId", Long.class);

    public final DatePath<java.time.LocalDate> startDate = createDate("startDate", java.time.LocalDate.class);

    public final StringPath summary = createString("summary");

    public final com.ssafy.damdam.domain.users.entity.QUsers users;

    public final StringPath worry = createString("worry");

    public QPeriodReport(String variable) {
        this(PeriodReport.class, forVariable(variable), INITS);
    }

    public QPeriodReport(Path<? extends PeriodReport> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QPeriodReport(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QPeriodReport(PathMetadata metadata, PathInits inits) {
        this(PeriodReport.class, metadata, inits);
    }

    public QPeriodReport(Class<? extends PeriodReport> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.users = inits.isInitialized("users") ? new com.ssafy.damdam.domain.users.entity.QUsers(forProperty("users")) : null;
    }

}

