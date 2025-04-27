package com.ssafy.damdam.global.exception;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ExceptionResponse {
	private Integer statusCode;
	private String code;
	private String message;
	private LocalDateTime timestamp;

	public ExceptionResponse(final ExceptionCode exceptionCode) {
		this.statusCode = exceptionCode.getHttpStatus().value();
		this.code = exceptionCode.getCode();
		this.message = exceptionCode.getMessage();
		this.timestamp = LocalDateTime.now();
	}
}
