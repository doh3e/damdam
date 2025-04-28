package com.ssafy.damdam.global.util.oauth2;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class OAuth2AuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {

	@Override
	public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
		AuthenticationException exception) throws IOException, ServletException {

		String errorCode = "UNKNOWN_ERROR";
		if (exception instanceof OAuth2AuthenticationException) {
			errorCode = ((OAuth2AuthenticationException)exception).getError().getErrorCode();
		}

		String redirectUrl;
		log.info("exception {}", exception.toString());
		log.info("errorCode {}", errorCode);

		if ("USER_BANNED".equals(errorCode)) {
			redirectUrl = "https://k12s202.p.ssafy.io/error?status=403&message=" + URLEncoder.encode("계정이 정지되었습니다.",
				StandardCharsets.UTF_8);
		} else if ("USER_WITHDRAW".equals(errorCode)) {
			redirectUrl = "https://k12s202.p.ssafy.io/error?status=410&message=" + URLEncoder.encode("탈퇴한 계정입니다.",
				StandardCharsets.UTF_8);
		} else {
			redirectUrl = "https://k12s202.p.ssafy.io/";
		}

		getRedirectStrategy().sendRedirect(request, response, redirectUrl);
	}

}

