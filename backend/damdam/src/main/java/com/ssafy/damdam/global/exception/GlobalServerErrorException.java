package com.ssafy.damdam.global.exception;

import static com.ssafy.damdam.global.exception.GlobalErrorCode.*;

public class GlobalServerErrorException extends RuntimeException {

	private final ExceptionCode exceptionCode;

	public GlobalServerErrorException() {

		super(SERVER_ERROR.getMessage());
		this.exceptionCode = SERVER_ERROR;
	}

	public ExceptionCode getExceptionCode() {

		return exceptionCode;
	}
}
