package com.ssafy.damdam.global.aws.s3.exception;

import static org.springframework.http.HttpStatus.*;

import org.springframework.http.HttpStatus;

import com.ssafy.damdam.global.exception.ExceptionCode;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum S3ExceptionCode implements ExceptionCode {

	IMAGE_TRNAS_BAD_REQUEST(BAD_REQUEST, "S3-S-001", "이미지를 변환할 수 없습니다."),
	IMAGE_UPLOAD_BAD_REQUEST(BAD_REQUEST, "S3-S-002", "이미지를 업로드할 수 없습니다."),
	IS_NOT_IMAGE(BAD_REQUEST, "S3-S-003", "이미지 형식이 아닙니다."),
	IS_NOT_AUDIO(BAD_REQUEST, "S3-S-004", "오디오 형식이 아닙니다."),
	JSON_SERIALIZATION_FAIL(BAD_REQUEST, "S3-S-005", "JSON 직렬화에 실패했습니다."),
	FILE_DOWNLOAD_FAIL(BAD_REQUEST, "S3-S-006", "파일 다운로드에 실패했습니다.");

	private final HttpStatus httpStatus;
	private final String code;
	private final String message;
}
