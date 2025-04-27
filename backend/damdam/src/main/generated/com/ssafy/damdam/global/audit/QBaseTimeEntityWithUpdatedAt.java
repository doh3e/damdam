package com.ssafy.damdam.global.audit;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;


/**
 * QBaseTimeEntityWithUpdatedAt is a Querydsl query type for BaseTimeEntityWithUpdatedAt
 */
@Generated("com.querydsl.codegen.DefaultSupertypeSerializer")
public class QBaseTimeEntityWithUpdatedAt extends EntityPathBase<BaseTimeEntityWithUpdatedAt> {

    private static final long serialVersionUID = 585846736L;

    public static final QBaseTimeEntityWithUpdatedAt baseTimeEntityWithUpdatedAt = new QBaseTimeEntityWithUpdatedAt("baseTimeEntityWithUpdatedAt");

    public final DateTimePath<java.time.LocalDateTime> updatedAt = createDateTime("updatedAt", java.time.LocalDateTime.class);

    public QBaseTimeEntityWithUpdatedAt(String variable) {
        super(BaseTimeEntityWithUpdatedAt.class, forVariable(variable));
    }

    public QBaseTimeEntityWithUpdatedAt(Path<? extends BaseTimeEntityWithUpdatedAt> path) {
        super(path.getType(), path.getMetadata());
    }

    public QBaseTimeEntityWithUpdatedAt(PathMetadata metadata) {
        super(BaseTimeEntityWithUpdatedAt.class, metadata);
    }

}

