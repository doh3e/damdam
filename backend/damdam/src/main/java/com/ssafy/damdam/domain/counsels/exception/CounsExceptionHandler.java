package com.ssafy.damdam.domain.counsels.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.ssafy.damdam.global.exception.ExceptionResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@ControllerAdvice
@RequiredArgsConstructor
public class CounsExceptionHandler {

	@ExceptionHandler(CounsException.class)
	public ResponseEntity userException(
		CounsException exception
	) {
		log.error("{}", exception.getMessage());

		return new ResponseEntity<>(
			new ExceptionResponse(exception.getExceptionCode()),
			exception.getExceptionCode().getHttpStatus()
		);
	}
}
