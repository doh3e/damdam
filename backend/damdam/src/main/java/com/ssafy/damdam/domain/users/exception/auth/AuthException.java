package com.ssafy.damdam.domain.users.exception.auth;

import com.ssafy.damdam.global.exception.ExceptionCode;

import lombok.Getter;

@Getter
public class AuthException extends RuntimeException {

	private final ExceptionCode exceptionCode;

	public AuthException(ExceptionCode exceptionCode) {
		super(exceptionCode.getMessage());
		this.exceptionCode = exceptionCode;
	}
}
