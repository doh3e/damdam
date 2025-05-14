package com.ssafy.damdam.domain.helps.exception;

import com.ssafy.damdam.global.exception.ExceptionCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

import static org.springframework.http.HttpStatus.*;

@Getter
@RequiredArgsConstructor
public enum HelpExceptionCode implements ExceptionCode {

	NOTICE_NOT_FOUND(NOT_FOUND, "H-C-001", "공지를 찾을 수 없습니다."),
	NOTICE_ALREADY_EXIST(BAD_REQUEST, "H-C-002", "이미 생성된 공지입니다.");

	private final HttpStatus httpStatus;
	private final String code;
	private final String message;
}
