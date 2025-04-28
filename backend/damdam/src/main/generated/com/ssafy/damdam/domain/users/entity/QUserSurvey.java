package com.ssafy.damdam.domain.users.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QUserSurvey is a Querydsl query type for UserSurvey
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QUserSurvey extends EntityPathBase<UserSurvey> {

    private static final long serialVersionUID = 726123879L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QUserSurvey userSurvey = new QUserSurvey("userSurvey");

    public final com.ssafy.damdam.global.audit.QBaseTimeEntity _super = new com.ssafy.damdam.global.audit.QBaseTimeEntity(this);

    public final NumberPath<Integer> anxiety = createNumber("anxiety", Integer.class);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> createdAt = _super.createdAt;

    public final NumberPath<Integer> depression = createNumber("depression", Integer.class);

    public final NumberPath<Integer> stress = createNumber("stress", Integer.class);

    public final StringPath stressReason = createString("stressReason");

    public final BooleanPath suicide = createBoolean("suicide");

    public final NumberPath<Long> surveyId = createNumber("surveyId", Long.class);

    public final QUsers users;

    public QUserSurvey(String variable) {
        this(UserSurvey.class, forVariable(variable), INITS);
    }

    public QUserSurvey(Path<? extends UserSurvey> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QUserSurvey(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QUserSurvey(PathMetadata metadata, PathInits inits) {
        this(UserSurvey.class, metadata, inits);
    }

    public QUserSurvey(Class<? extends UserSurvey> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.users = inits.isInitialized("users") ? new QUsers(forProperty("users")) : null;
    }

}

