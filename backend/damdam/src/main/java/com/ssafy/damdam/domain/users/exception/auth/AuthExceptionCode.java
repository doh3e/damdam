package com.ssafy.damdam.domain.users.exception.auth;

import static org.springframework.http.HttpStatus.*;

import org.springframework.http.HttpStatus;

import com.ssafy.damdam.global.exception.ExceptionCode;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum AuthExceptionCode implements ExceptionCode {

	/**
	 * JWT
	 * 001 ~ 099
	 */
	INVALID_TOKEN(UNAUTHORIZED, "AT-C-001", "유효하지 않은 토큰입니다."),
	EXPIRED_TOKEN(UNAUTHORIZED, "AT-C-002", "만료된 토큰입니다."),
	REQUEST_TOKEN_NOT_FOUND(BAD_REQUEST, "AT-C-003", "요청에 토큰이 존재하지 않습니다."),
	INVALID_ACCESS_TOKEN(BAD_REQUEST, "AT-C-004", "해당 액세스 토큰을 가지는 멤버가 없습니다."),
	UNTRUSTED_CREDENTIAL(UNAUTHORIZED, "AT-C-005", "신뢰할 수 없는 자격증명 입니다."),

	/**
	 * MEMBER
	 * 100 ~ 199
	 */
	LOGIN_PROVIDER_MISMATCH(BAD_REQUEST, "AT-C-100", "잘못된 OAuth2 인증입니다."),
	INVALID_LOGIN_PROVIDER(BAD_REQUEST, "AT-C-101", "유효하지 않은 로그인 제공자입니다."),
	INVALID_MEMBER_ROLE(FORBIDDEN, "AT-C-102", "유효하지 않은 사용자 권한입니다."),
	NOT_AUTHORIZATION_USER(UNAUTHORIZED, "AT-C-103", "인가된 사용자가 아닙니다."),
	INVALID_REDIRECT_URI(UNAUTHORIZED, "AT-C-104", "허용되지 않은 리다이렉션 URI 입니다."),
	AUTH_MEMBER_NOT_FOUND(NOT_FOUND, "AT-C-105", "존재하지 않는 회원입니다."),

	/**
	 * Common Exception
	 * 200 ~
	 */
	AUTHENTICATION_ERROR(UNAUTHORIZED, "AT-C-200", "Authentication exception."),

	/**
	 * Exception
	 * 400 ~
	 */
	BAD_REQUEST_EXCEPTION(BAD_REQUEST, "AT-S-400", "Bad Request"),

	INVALID_AUTHORIZATION_CODE(BAD_REQUEST, "KA-C-001", "유효하지 않은 허가 코드입니다.");

	private final HttpStatus httpStatus;
	private final String code;
	private final String message;
}
