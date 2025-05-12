package com.ssafy.damdam.global.aws.s3.exception;

import com.ssafy.damdam.global.exception.ExceptionResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@Slf4j
@ControllerAdvice
@RequiredArgsConstructor
public class S3ExceptionHandler {

	@ExceptionHandler(S3Exception.class)
	public ResponseEntity S3Exception(
		S3Exception exception
	) {
		log.error("{}", exception.getMessage());

		return new ResponseEntity<>(
			new ExceptionResponse(exception.getExceptionCode()),
			exception.getExceptionCode().getHttpStatus()
		);
	}
}
