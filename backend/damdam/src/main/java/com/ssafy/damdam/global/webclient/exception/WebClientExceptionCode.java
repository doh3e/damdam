package com.ssafy.damdam.global.webclient.exception;

import static org.springframework.http.HttpStatus.*;

import org.springframework.http.HttpStatus;

import com.ssafy.damdam.global.exception.ExceptionCode;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum WebClientExceptionCode implements ExceptionCode {

	CHATTING_AI_ERROR(BAD_GATEWAY, "WC-S-001", "채팅 FAST API에서 알 수 없는 오류가 발생했습니다."),
	ANALYZE_AI_ERROR(BAD_GATEWAY, "WC-S-002", "감정분석 FAST API에서 알 수 없는 오류가 발생했습니다."),
	SUMMARY_AI_ERROR(BAD_GATEWAY, "WC-S-003", "요약 FAST API에서 알 수 없는 오류가 발생했습니다."),
	LLM_PERIOD_AI_ERROR(BAD_GATEWAY, "WC-S-003", "기간별 레포트 생성 FAST API에서 알 수 없는 오류가 발생했습니다."),
	SPARK_API_ERROR(BAD_GATEWAY, "WC-S-004", "스파크 API에서 알 수 없는 오류가 발생했습니다."),
	SPARK_API_BAD_REQUEST(BAD_REQUEST, "WC-S-005", "스파크 API에서 잘못된 요청이 발생했습니다."),
	SPARK_API_JSON_PARSE_ERROR(BAD_REQUEST, "WC-S-006", "스파크 API에서 JSON 파싱 오류가 발생했습니다.");

	private final HttpStatus httpStatus;
	private final String code;
	private final String message;
}
