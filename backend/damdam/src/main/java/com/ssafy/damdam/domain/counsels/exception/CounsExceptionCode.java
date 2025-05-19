package com.ssafy.damdam.domain.counsels.exception;

import static org.springframework.http.HttpStatus.*;

import org.springframework.http.HttpStatus;

import com.ssafy.damdam.global.exception.ExceptionCode;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum CounsExceptionCode implements ExceptionCode {

	COUNSEL_NOT_FOUND(NOT_FOUND, "C-C-001", "상담정보를 찾을 수 없습니다."),
	COUNSEL_ALREADY_EXIST(BAD_REQUEST, "C-C-002", "이미 생성된 상담내역입니다."),
	NOT_YOUR_COUNSEL(FORBIDDEN, "C-C-003", "본인의 상담내역이 아닙니다."),;

	private final HttpStatus httpStatus;
	private final String code;
	private final String message;
}
