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
	MEMBER_DUPLICATE_ERROR(BAD_REQUEST, "M-C-002", "중복된 닉네임입니다."),
	NICKNAME_DUPLICATE_ERROR(BAD_REQUEST, "M-C-003", "중복된 이메일입니다."),
	USER_INFO_NOT_FOUND(BAD_REQUEST, "M-C-004", "회원 정보를 찾을 수 없습니다.");

	private final HttpStatus httpStatus;
	private final String code;
	private final String message;
}
