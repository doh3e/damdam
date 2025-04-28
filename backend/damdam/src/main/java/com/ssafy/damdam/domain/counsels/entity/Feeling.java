package com.ssafy.damdam.domain.counsels.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Feeling {
    HAPPINESS("행복"),
    ANGRY("화남"),
    DISGUST("혐오"),
    FEAR("공포"),
    NEUTRAL("중립"),
    SADNESS("슬픔"),
    SURPRISE("놀람");

    private final String displayName;
}

