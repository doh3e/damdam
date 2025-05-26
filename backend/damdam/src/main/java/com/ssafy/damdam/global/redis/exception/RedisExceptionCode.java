package com.ssafy.damdam.global.redis.exception;

import static org.springframework.http.HttpStatus.*;

import org.springframework.http.HttpStatus;

import com.ssafy.damdam.global.exception.ExceptionCode;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum RedisExceptionCode implements ExceptionCode {

	REDIS_SESSION_NOT_FOUND(NOT_FOUND, "RD-S-001", "존재하지 않는 REDIS 세션입니다."),
	REDIS_SESSION_EXPIRED(NOT_FOUND, "RD-S-002", "Redis 세션이 만료되었습니다."),
	MESSAGE_ORDER_NOT_FOUND(NOT_FOUND, "RD-S-003", "Redis에 존재하지 않는 메시지순서입니다.");

	private final HttpStatus httpStatus;
	private final String code;
	private final String message;
}
