package com.ssafy.damdam.global.webclient.exception;

import com.ssafy.damdam.global.exception.ExceptionCode;
import lombok.Getter;

@Getter
public class WebClientException extends RuntimeException {

	private final ExceptionCode exceptionCode;

	public WebClientException(ExceptionCode exceptionCode) {
		super(exceptionCode.getMessage());
		this.exceptionCode = exceptionCode;
	}
}
