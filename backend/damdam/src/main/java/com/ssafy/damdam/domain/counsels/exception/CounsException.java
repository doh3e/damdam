package com.ssafy.damdam.domain.counsels.exception;

import com.ssafy.damdam.global.exception.ExceptionCode;

import lombok.Getter;

@Getter
public class CounsException extends RuntimeException {

	private final ExceptionCode exceptionCode;

	public CounsException(ExceptionCode exceptionCode) {
		super(exceptionCode.getMessage());
		this.exceptionCode = exceptionCode;
	}
}
