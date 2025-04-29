package com.ssafy.damdam.global.util.jwt;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import com.ssafy.damdam.domain.users.dto.auth.CustomOAuth2User;
import com.ssafy.damdam.domain.users.dto.auth.UserDto;
import com.ssafy.damdam.domain.users.repository.UsersRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

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
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
									FilterChain filterChain) throws ServletException, IOException {

		String path = request.getRequestURI();

		if (NO_CHECK_URLS.stream().anyMatch(pattern -> pathMatcher.match(pattern, path))) {
			filterChain.doFilter(request, response);
			return;
		}

		String authorizationHeader = request.getHeader("Authorization");
		log.info("Authorization Header: " + authorizationHeader);

		if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
			filterChain.doFilter(request, response);
			return;
		}

		String token = authorizationHeader.substring(7);

		if (jwtUtil.isExpired(token)) {
			log.info("Token expired");
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			response.sendRedirect("http:localhost:5173/");
			return;
		}

		String personalId = jwtUtil.getPersonalId(token);
		String role = jwtUtil.getRole(token);
		Long userId = jwtUtil.getUserId(token);

		UserDto userDto = new UserDto(userId, personalId, role);
		CustomOAuth2User customOAuth2User = new CustomOAuth2User(userDto);

		Authentication authToken = new UsernamePasswordAuthenticationToken(
				customOAuth2User, null, customOAuth2User.getAuthorities()
		);

		SecurityContextHolder.getContext().setAuthentication(authToken);
		filterChain.doFilter(request, response);
	}



}

