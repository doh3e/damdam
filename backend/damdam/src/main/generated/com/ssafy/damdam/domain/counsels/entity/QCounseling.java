package com.ssafy.damdam.domain.counsels.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QCounseling is a Querydsl query type for Counseling
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QCounseling extends EntityPathBase<Counseling> {

    private static final long serialVersionUID = -1576817493L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QCounseling counseling = new QCounseling("counseling");

    public final com.ssafy.damdam.global.audit.QBaseTimeEntityWithUpdatedAt _super = new com.ssafy.damdam.global.audit.QBaseTimeEntityWithUpdatedAt(this);

    public final NumberPath<Long> counsId = createNumber("counsId", Long.class);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> updatedAt = _super.updatedAt;

    public final com.ssafy.damdam.domain.users.entity.QUsers users;

    public QCounseling(String variable) {
        this(Counseling.class, forVariable(variable), INITS);
    }

    public QCounseling(Path<? extends Counseling> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QCounseling(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QCounseling(PathMetadata metadata, PathInits inits) {
        this(Counseling.class, metadata, inits);
    }

    public QCounseling(Class<? extends Counseling> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.users = inits.isInitialized("users") ? new com.ssafy.damdam.domain.users.entity.QUsers(forProperty("users")) : null;
    }

}

