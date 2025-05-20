package com.ssafy.damdam.global.webclient.exception;

import com.ssafy.damdam.global.exception.ExceptionCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

import static org.springframework.http.HttpStatus.BAD_GATEWAY;
import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Getter
@RequiredArgsConstructor
public enum WebClientExceptionCode implements ExceptionCode {

	CHATTING_AI_ERROR(BAD_GATEWAY, "WC-S-001", "채팅 FAST API에서 알 수 없는 오류가 발생했습니다."),
	ANALYZE_AI_ERROR(BAD_GATEWAY, "WC-S-002", "감정분석 FAST API에서 알 수 없는 오류가 발생했습니다."),
	SUMMARY_AI_ERROR(BAD_GATEWAY, "WC-S-003", "요약 FAST API에서 알 수 없는 오류가 발생했습니다.");


	private final HttpStatus httpStatus;
	private final String code;
	private final String message;
}
