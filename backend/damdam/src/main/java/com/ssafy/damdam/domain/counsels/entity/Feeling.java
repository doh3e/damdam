package com.ssafy.damdam.domain.counsels.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Feeling {
    HAPPINESS("행복"),
    ANGRY("분노"),
    NEUTRAL("중립"),
    SADNESS("슬픔"),
    OTHER("기타");

    private final String displayName;
}

