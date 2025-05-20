package com.ssafy.damdam.global.redis.exception;

import static org.springframework.http.HttpStatus.*;

import org.springframework.http.HttpStatus;

import com.ssafy.damdam.global.exception.ExceptionCode;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum RedisExceptionCode implements ExceptionCode {

	REDIS_SESSION_NOT_FOUND(NOT_FOUND, "RD-S-001", "존재하지 않는 Redis 세션입니다.");

	private final HttpStatus httpStatus;
	private final String code;
	private final String message;
}
