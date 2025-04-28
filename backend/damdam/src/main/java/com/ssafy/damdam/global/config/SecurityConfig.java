package com.ssafy.damdam.global.config;

import java.util.Arrays;
import java.util.Collections;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.ssafy.damdam.domain.users.repository.UsersRepository;
import com.ssafy.damdam.domain.users.service.UserAuthServiceImpl;
import com.ssafy.damdam.global.util.jwt.JwtAuthenticationEntryPoint;
import com.ssafy.damdam.global.util.jwt.JwtFilter;
import com.ssafy.damdam.global.util.jwt.JwtUtil;
import com.ssafy.damdam.global.util.oauth2.CustomSuccessHandler;
import com.ssafy.damdam.global.util.oauth2.OAuth2AuthenticationFailureHandler;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

	private final OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler;
	private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
	private final CustomSuccessHandler customSuccessHandler;
	private final UserAuthServiceImpl userAuthServiceImpl;
	private final JwtUtil jwtUtil;

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http, UsersRepository usersRepository) throws Exception {
		http
			.cors(cors -> cors.configurationSource(corsConfigurationSource()))
			.csrf(csrf -> csrf.disable())
			.formLogin(form -> form.disable())  // 기본 로그인 폼 비활성화
			.httpBasic(basic -> basic.disable())
			.addFilterBefore(new JwtFilter(jwtUtil, usersRepository), UsernamePasswordAuthenticationFilter.class)
			// .oauth2Login(oauth2 -> oauth2
			// 	.authorizationEndpoint(endpoint -> endpoint
			// 		.baseUri("/oauth2/authorization")
			// 		.authorizationRequestRepository(new HttpSessionOAuth2AuthorizationRequestRepository()) // 추가
			// 	)
			// 	.userInfoEndpoint(userInfo -> userInfo.userService(userAuthServiceImpl))
			// 	.successHandler(customSuccessHandler)
			// 	.failureHandler(oAuth2AuthenticationFailureHandler)
			// ) // Oauth2 로그인 관련 설정 주석 처리
			.authorizeHttpRequests(auth -> auth
				.requestMatchers("/login")
				.denyAll()  // 기본 로그인 경로 차단
				.requestMatchers("/oauth2/**", "/login/oauth2/**", "/ws-connect", "/ws-connect/**")
				.permitAll() // OAuth2 로그인만 허용
				.requestMatchers(
					"/api/v1/damdam/"
				)
				.permitAll()
				.anyRequest()
				.authenticated())
			.sessionManagement(session -> session
				.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
			.exceptionHandling(ex -> ex.authenticationEntryPoint(jwtAuthenticationEntryPoint));

		return http.build();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOrigins(Arrays.asList(
			"http://localhost:5173",
			"https://localhost:5173",
			"http://k12s202.p.ssafy.io",
			"https://k12s202.p.ssafy.io"
		));
		configuration.setAllowedMethods(Collections.singletonList("*"));
		configuration.setAllowedHeaders(Collections.singletonList("*"));
		configuration.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}

}
