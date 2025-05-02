package com.ssafy.damdam.global.util.jwt;

import static com.ssafy.damdam.domain.users.exception.auth.AuthExceptionCode.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import com.ssafy.damdam.domain.users.exception.auth.AuthExceptionCode;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {
	@Override
	public void commence(HttpServletRequest request, HttpServletResponse response,
		AuthenticationException authException) throws IOException, ServletException {
		String exception = (String)request.getAttribute("exception");

		if (exception == null) {
			log.info("잘못된 요청");
			setResponse(response, UNTRUSTED_CREDENTIAL);
			return;
		}

		if (exception.equals(REQUEST_TOKEN_NOT_FOUND.getCode())) {
			log.info("AccessToken이 없음");
			setResponse(response, INVALID_TOKEN);
			return;
		}

		if (exception.equals(EXPIRED_TOKEN.getCode())) {
			log.info("토큰 만료됨, 401 Unauthorized 반환");
			setResponse(response, EXPIRED_TOKEN);  //
			return;
		}

		if (exception.equals(INVALID_TOKEN.getCode())) {
			setResponse(response, INVALID_TOKEN);
		}
	}

	private void setResponse(HttpServletResponse response, AuthExceptionCode errorCode) throws IOException {
		String timestamp = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);

		response.setContentType("application/json;charset=UTF-8");
		response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // ✅ 401 Unauthorized 강제 반환
		response.getWriter().println(
			"{ " +
				"\"statusCode\" : \"" + HttpServletResponse.SC_UNAUTHORIZED + "\", " + // ✅ 401 상태 코드 고정
				"\"code\" : \"" + errorCode.getCode() + "\", " +
				"\"message\" : \"" + errorCode.getMessage() + "\", " +
				"\"timestamp\" : \"" + timestamp + "\"" +
				"}"
		);
	}
}
