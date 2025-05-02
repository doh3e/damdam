package com.ssafy.damdam.domain.helps.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum NoticeCategory {

    GENERAL("일반 공지"),
    EVENT("이벤트"),
    SYSTEM("시스템 점검"),
    POLICY("정책 변경");

    private final String displayName;
}
