package com.ssafy.damdam.domain.helps.exception;

import static org.springframework.http.HttpStatus.*;

import org.springframework.http.HttpStatus;

import com.ssafy.damdam.global.exception.ExceptionCode;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum HelpExceptionCode implements ExceptionCode {

	NOTICE_NOT_FOUND(NOT_FOUND, "H-C-001", "공지를 찾을 수 없습니다."),
	NOTICE_ALREADY_EXIST(BAD_REQUEST, "H-C-002", "이미 생성된 공지입니다."),
	INQUIRY_NOT_FOUND(NOT_FOUND, "H-C-003", "문의내역을 찾을 수 없습니다.");

	private final HttpStatus httpStatus;
	private final String code;
	private final String message;
}
