package com.ssafy.damdam.domain.users.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QUserSetting is a Querydsl query type for UserSetting
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QUserSetting extends EntityPathBase<UserSetting> {

    private static final long serialVersionUID = 578728419L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QUserSetting userSetting = new QUserSetting("userSetting");

    public final com.ssafy.damdam.global.audit.QBaseTimeEntityWithUpdatedAt _super = new com.ssafy.damdam.global.audit.QBaseTimeEntityWithUpdatedAt(this);

    public final StringPath botCustom = createString("botCustom");

    public final StringPath botImage = createString("botImage");

    public final BooleanPath isAlarm = createBoolean("isAlarm");

    public final BooleanPath isDarkmode = createBoolean("isDarkmode");

    public final NumberPath<Long> settingId = createNumber("settingId", Long.class);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> updatedAt = _super.updatedAt;

    public final QUsers users;

    public QUserSetting(String variable) {
        this(UserSetting.class, forVariable(variable), INITS);
    }

    public QUserSetting(Path<? extends UserSetting> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QUserSetting(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QUserSetting(PathMetadata metadata, PathInits inits) {
        this(UserSetting.class, metadata, inits);
    }

    public QUserSetting(Class<? extends UserSetting> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.users = inits.isInitialized("users") ? new QUsers(forProperty("users")) : null;
    }

}

