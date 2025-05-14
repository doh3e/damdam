package com.ssafy.damdam.global.aws.s3.exception;

import com.ssafy.damdam.global.exception.ExceptionCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Getter
@RequiredArgsConstructor
public enum S3ExceptionCode implements ExceptionCode {

	IMAGE_TRNAS_BAD_REQUEST(BAD_REQUEST, "S-S-001", "이미지를 변환할 수 없습니다."),
	IMAGE_UPLOAD_BAD_REQUEST(BAD_REQUEST, "S-S-002", "이미지를 업로드할 수 없습니다."),
	IS_NOT_IMAGE(BAD_REQUEST, "S-S-003", "이미지 형식이 아닙니다."),
	IS_NOT_AUDIO(BAD_REQUEST, "S-S-004", "오디오 형식이 아닙니다.");

	private final HttpStatus httpStatus;
	private final String code;
	private final String message;
}
