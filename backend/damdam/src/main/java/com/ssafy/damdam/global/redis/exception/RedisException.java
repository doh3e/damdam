package com.ssafy.damdam.global.redis.exception;

import com.ssafy.damdam.global.exception.ExceptionCode;

import lombok.Getter;

@Getter
public class RedisException extends RuntimeException {

	private final ExceptionCode exceptionCode;

	public RedisException(ExceptionCode exceptionCode) {
		super(exceptionCode.getMessage());
		this.exceptionCode = exceptionCode;
	}
}
