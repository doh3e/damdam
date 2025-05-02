package com.ssafy.damdam.global.exception;

import static org.springframework.http.HttpStatus.*;

import org.springframework.http.HttpStatus;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum GlobalErrorCode implements ExceptionCode {

	SERVER_ERROR(INTERNAL_SERVER_ERROR, "G-S-001", "Internal Server Error"),
	INVALID_REQUEST_METHOD(METHOD_NOT_ALLOWED, "G-C-001", "유효하지 않는 http 요청입니다."),
	INVALID_REQUEST_DATA(BAD_REQUEST, "G-C-002", "유효하지 않는 데이터입니다."),
	INVALID_RESOURCE_OWNER(FORBIDDEN, "G-C-003", "해당 리소스를 처리할 권한이 없습니다."),
	RESOURCE_NOT_FOUND(NOT_FOUND, "G-C-004", "해당 리소스를 찾을 수 없습니다.");

	private final HttpStatus httpStatus;
	private final String code;
	private final String message;
}
