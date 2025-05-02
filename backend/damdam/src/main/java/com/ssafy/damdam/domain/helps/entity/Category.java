package com.ssafy.damdam.domain.helps.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Category {

    ETC("기타"),
    MEMBER("회원관련"),
    COUNSELING("상담관련"),
    ERROR_REPORT("오류제보");

    private final String displayName;
}
