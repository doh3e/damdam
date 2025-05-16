package com.ssafy.damdam.domain.reports.exception;

import com.ssafy.damdam.global.exception.ExceptionCode;
import lombok.Getter;

@Getter
public class ReportException extends RuntimeException {

	private final ExceptionCode exceptionCode;

	public ReportException(ExceptionCode exceptionCode) {
		super(exceptionCode.getMessage());
		this.exceptionCode = exceptionCode;
	}
}
