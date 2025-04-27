package com.ssafy.damdam.domain.users.exception.user;

import com.ssafy.damdam.global.exception.ExceptionCode;

import lombok.Getter;

@Getter
public class UserException extends RuntimeException {

	private final ExceptionCode exceptionCode;

	public UserException(ExceptionCode exceptionCode) {
		super(exceptionCode.getMessage());
		this.exceptionCode = exceptionCode;
	}
}
