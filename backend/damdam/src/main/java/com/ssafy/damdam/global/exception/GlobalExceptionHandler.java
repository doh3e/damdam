package com.ssafy.damdam.global.exception;

import static org.springframework.http.HttpStatus.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.support.MethodArgumentNotValidException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.BindException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.ssafy.damdam.global.mail.exception.MailException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity handleMethodArgumentNotValid(MethodArgumentNotValidException exception) {
		List<String> errors = exception.getBindingResult()
			.getFieldErrors()
			.stream()
			.map(error -> error.getField() + " " + error.getDefaultMessage())
			.collect(Collectors.toList());

		ExceptionResponse response = new ExceptionResponse(
			400,
			"G-M-001",
			errors.get(0),
			LocalDateTime.now());
		return ResponseEntity.badRequest().body(response);
	}

	@ExceptionHandler(BindException.class)
	public ResponseEntity handleBindException(BindException exception) {
		List<String> errors = exception.getBindingResult()
			.getFieldErrors()
			.stream()
			.map(error -> error.getField() + " " + error.getDefaultMessage())
			.collect(Collectors.toList());

		ExceptionResponse response = new ExceptionResponse(
			400,
			"G-M-001",
			errors.get(0),
			LocalDateTime.now());

		return ResponseEntity.badRequest().body(response);
	}

	@ExceptionHandler(DataIntegrityViolationException.class)
	public ResponseEntity alreadyExistsValueInDataBase(
		DataIntegrityViolationException exception
	) {
		log.error("{}", exception.getMessage());

		return new ResponseEntity<>(
			exception.getMessage(),
			BAD_REQUEST
		);
	}

	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity resourceNotFoundException(
		ResourceNotFoundException exception
	) {
		log.error("{}", exception.getMessage());

		ExceptionResponse response = new ExceptionResponse(
			400,
			"G-RN-001",
			"해당 데이터를 찾을 수 없습니다.",
			LocalDateTime.now());

		return ResponseEntity.badRequest().body(response);
	}

	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity accessDeniedException(
		AccessDeniedException exception
	) {
		log.error("{}", exception.getMessage());

		ExceptionResponse response = new ExceptionResponse(
			400,
			"G-AC-001",
			"접근할 수 없는 권한입니다.",
			LocalDateTime.now());

		return ResponseEntity.badRequest().body(response);
	}

	@ExceptionHandler(MailException.class)
	public ResponseEntity handleMailException(MailException e) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
			new ExceptionResponse(e.getExceptionCode())
		);
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity globalException(Exception e) {
		log.error("{}", e);

		ExceptionResponse response = new ExceptionResponse(
			500,
			"G-001",
			"서버에 접속할 수 없습니다.",
			LocalDateTime.now());

		return ResponseEntity.status(INTERNAL_SERVER_ERROR).body(response);
	}
}
