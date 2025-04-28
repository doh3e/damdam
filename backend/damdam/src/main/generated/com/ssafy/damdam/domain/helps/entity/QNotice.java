package com.ssafy.damdam.domain.helps.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;


/**
 * QNotice is a Querydsl query type for Notice
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QNotice extends EntityPathBase<Notice> {

    private static final long serialVersionUID = 64201732L;

    public static final QNotice notice = new QNotice("notice");

    public final com.ssafy.damdam.global.audit.QBaseTimeEntityWithUpdatedAt _super = new com.ssafy.damdam.global.audit.QBaseTimeEntityWithUpdatedAt(this);

    public final EnumPath<NoticeCategory> category = createEnum("category", NoticeCategory.class);

    public final StringPath content = createString("content");

    public final NumberPath<Long> noticeId = createNumber("noticeId", Long.class);

    public final StringPath title = createString("title");

    //inherited
    public final DateTimePath<java.time.LocalDateTime> updatedAt = _super.updatedAt;

    public QNotice(String variable) {
        super(Notice.class, forVariable(variable));
    }

    public QNotice(Path<? extends Notice> path) {
        super(path.getType(), path.getMetadata());
    }

    public QNotice(PathMetadata metadata) {
        super(Notice.class, metadata);
    }

}

