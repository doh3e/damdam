package com.ssafy.damdam.domain.reports.exception;

import com.ssafy.damdam.global.exception.ExceptionCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

import static org.springframework.http.HttpStatus.*;

@Getter
@RequiredArgsConstructor
public enum ReportExceptionCode implements ExceptionCode {

	REPORT_NOT_FOUND(NOT_FOUND, "RP-C-001", "레포트정보를 찾을 수 없습니다."),
	REPORT_ALREADY_EXIST(BAD_REQUEST, "RP-C-002", "이미 레포트가 존재하는 상담입니다."),
	NOT_YOUR_REPORT(FORBIDDEN, "RP-C-003", "본인의 레포트내역이 아닙니다."),
	CATEGORY_DOES_NOT_EXIST(BAD_REQUEST, "RP-C-004", "존재하지 않는 카테고리입니다.");

	private final HttpStatus httpStatus;
	private final String code;
	private final String message;
}
