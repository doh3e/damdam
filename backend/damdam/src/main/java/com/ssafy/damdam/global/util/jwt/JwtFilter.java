package com.ssafy.damdam.global.util.jwt;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import com.ssafy.damdam.domain.users.dto.auth.CustomOAuth2User;
import com.ssafy.damdam.domain.users.dto.auth.UserDto;
import com.ssafy.damdam.domain.users.entity.Users;
import com.ssafy.damdam.domain.users.repository.UsersRepository;
import com.ssafy.damdam.global.util.jwt.JwtUtil;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * JWT 토큰을 검증하고 인증 정보를 설정하는 필터
 */
@Slf4j
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

	private final JwtUtil jwtUtil;
	private final UsersRepository usersRepository;
	private final AntPathMatcher pathMatcher = new AntPathMatcher();

	private static final List<String> NO_CHECK_URLS = Arrays.asList(
			"/", "/ws/**", "/wss/**",
			"/login", "/login/**",
			"/oauth2/**", "/oauth2/authorization/**",
			"/login/oauth2/**", "/error"
	);

	@Override
	protected void doFilterInternal(HttpServletRequest request,
									HttpServletResponse response,
									FilterChain filterChain) throws ServletException, IOException {

		String path = request.getRequestURI();

		// 인증이 필요 없는 URL 패턴
		if (NO_CHECK_URLS.stream().anyMatch(pattern -> pathMatcher.match(pattern, path))) {
			filterChain.doFilter(request, response);
			return;
		}

		String authorizationHeader = request.getHeader("Authorization");
		log.info("Authorization Header: {}", authorizationHeader);

		if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
			filterChain.doFilter(request, response);
			return;
		}

		String token = authorizationHeader.substring(7);

		if (jwtUtil.isExpired(token)) {
			log.info("Token expired");
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			response.sendRedirect("http://localhost:5173/");
			return;
		}

		// 토큰에서 사용자 정보 추출
		Long userId = jwtUtil.getUserId(token);
		String role = jwtUtil.getRole(token);

		// DB에서 사용자 조회
		Users userEntity = usersRepository.findById(userId)
				.orElseThrow(() -> new UsernameNotFoundException("User not found: " + userId));

		// DTO로 변환
		UserDto userDto = UserDto.fromEntity(userEntity);

		// CustomOAuth2User 생성
		CustomOAuth2User principal = new CustomOAuth2User(
				userDto,
				Collections.emptyMap(),
				"personalId"
		);

		Authentication authToken = new UsernamePasswordAuthenticationToken(
				principal, null, principal.getAuthorities()
		);
		SecurityContextHolder.getContext().setAuthentication(authToken);

		filterChain.doFilter(request, response);
	}
}
