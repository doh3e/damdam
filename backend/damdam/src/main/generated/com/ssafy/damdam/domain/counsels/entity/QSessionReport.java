package com.ssafy.damdam.domain.counsels.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QSessionReport is a Querydsl query type for SessionReport
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QSessionReport extends EntityPathBase<SessionReport> {

    private static final long serialVersionUID = -2035044468L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QSessionReport sessionReport = new QSessionReport("sessionReport");

    public final com.ssafy.damdam.global.audit.QBaseTimeEntity _super = new com.ssafy.damdam.global.audit.QBaseTimeEntity(this);

    public final StringPath analyse = createString("analyse");

    public final QCounseling counseling;

    //inherited
    public final DateTimePath<java.time.LocalDateTime> createdAt = _super.createdAt;

    public final EnumPath<Feeling> feeling = createEnum("feeling", Feeling.class);

    public final NumberPath<Long> sReportId = createNumber("sReportId", Long.class);

    public final StringPath summary = createString("summary");

    public QSessionReport(String variable) {
        this(SessionReport.class, forVariable(variable), INITS);
    }

    public QSessionReport(Path<? extends SessionReport> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QSessionReport(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QSessionReport(PathMetadata metadata, PathInits inits) {
        this(SessionReport.class, metadata, inits);
    }

    public QSessionReport(Class<? extends SessionReport> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.counseling = inits.isInitialized("counseling") ? new QCounseling(forProperty("counseling"), inits.get("counseling")) : null;
    }

}

