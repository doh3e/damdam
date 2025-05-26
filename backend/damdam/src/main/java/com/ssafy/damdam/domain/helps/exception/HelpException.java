package com.ssafy.damdam.domain.helps.exception;

import com.ssafy.damdam.global.exception.ExceptionCode;
import lombok.Getter;

@Getter
public class HelpException extends RuntimeException {

	private final ExceptionCode exceptionCode;

	public HelpException(ExceptionCode exceptionCode) {
		super(exceptionCode.getMessage());
		this.exceptionCode = exceptionCode;
	}
}
