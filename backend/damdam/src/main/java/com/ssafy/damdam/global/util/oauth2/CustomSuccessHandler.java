package com.ssafy.damdam.global.util.oauth2;

import static com.ssafy.damdam.domain.users.exception.user.UserExceptionCode.*;

import java.io.IOException;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.ssafy.damdam.domain.users.dto.auth.CustomOAuth2User;
import com.ssafy.damdam.domain.users.entity.Users;
import com.ssafy.damdam.domain.users.exception.user.UserException;
import com.ssafy.damdam.domain.users.repository.UsersRepository;
import com.ssafy.damdam.global.util.jwt.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
@Transactional
public class CustomSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

	private final JwtUtil jwtUtil;
	private final UsersRepository usersRepository;
	private static final long TOKEN_EXPIRATION = 60L * 60L * 24L * 365L;

	@Override
	public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
		Authentication authentication) throws IOException {

		CustomOAuth2User userDetails = (CustomOAuth2User)authentication.getPrincipal();

		// ② 로그인 성공 시점에 lastLogin 갱신
		Users user = usersRepository.findById(userDetails.getUserId())
			.orElseThrow(() -> new UserException(USER_NOT_FOUND));
		user.updateLastLogin();

		String personalId = userDetails.getPersonalId();
		Long userId = userDetails.getUserId();
		log.info("받아온 userId: {}", userId);

		String role = authentication.getAuthorities().stream()
			.findFirst()
			.map(GrantedAuthority::getAuthority)
			.orElse("ROLE_USER");

		String token = jwtUtil.createJwt(userId, personalId, role, TOKEN_EXPIRATION);
		log.info("Token: " + token);

		// 로컬에 임시로 토큰 전달
		// String redirectUrl = "http://localhost:8080/?token=" + token;

		//프론트엔드 URL로 리디렉트하면서 토큰을 전달
		String redirectUrl = "https://k12s202.p.ssafy.io/callback?token=" + token;
		response.sendRedirect(redirectUrl);
	}

}
