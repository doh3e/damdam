package com.ssafy.damdam.domain.users.exception.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.ssafy.damdam.global.exception.ExceptionResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@ControllerAdvice
@RequiredArgsConstructor
public class AuthExceptionHandler {

	@ExceptionHandler(AuthException.class)
	public ResponseEntity authException(AuthException exception) {
		log.error("{}", exception.getMessage());

		return new ResponseEntity<>(
			new ExceptionResponse(exception.getExceptionCode()),
			exception.getExceptionCode().getHttpStatus()
		);
	}

}
