package com.ssafy.damdam.domain.users.exception.user;

import static org.springframework.http.HttpStatus.*;

import org.springframework.http.HttpStatus;

import com.ssafy.damdam.global.exception.ExceptionCode;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum UserExceptionCode implements ExceptionCode {

	USER_NOT_FOUND(NOT_FOUND, "M-C-001", "회원을 찾을 수 없습니다."),
	USER_INFO_NOT_FOUND(NOT_FOUND, "M-C-002", "회원 정보를 찾을 수 없습니다."),
	USER_SETTING_NOT_FOUND(NOT_FOUND, "M-C-003", "회원 설정 정보를 찾을 수 없습니다."),
	USER_SURVEY_NOT_FOUND(NOT_FOUND, "M-C-004", "회원 설문 정보를 찾을 수 없습니다.");

	private final HttpStatus httpStatus;
	private final String code;
	private final String message;
}
