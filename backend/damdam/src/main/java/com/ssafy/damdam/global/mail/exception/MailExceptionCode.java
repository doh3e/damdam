package com.ssafy.damdam.global.mail.exception;

import static org.springframework.http.HttpStatus.*;

import org.springframework.http.HttpStatus;

import com.ssafy.damdam.global.exception.ExceptionCode;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum MailExceptionCode implements ExceptionCode {

	MAIL_NOT_SEND(BAD_REQUEST, "M-S-001", "메일을 보낼 수 없습니다."),
	IMAGE_NOT_DOWNLOAD(BAD_REQUEST, "M-S-002", "이미지를 다운로드 할 수 없습니다."),
	MAIL_NOT_FOUND(BAD_REQUEST, "M-S-003", "유효하지 않은 메일입니다.");

	private final HttpStatus httpStatus;
	private final String code;
	private final String message;
}
