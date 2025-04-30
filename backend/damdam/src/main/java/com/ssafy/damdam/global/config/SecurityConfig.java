package com.ssafy.damdam.global.config;

import java.util.Arrays;
import java.util.Collections;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.FormHttpMessageConverter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.endpoint.DefaultAuthorizationCodeTokenResponseClient;
import org.springframework.security.oauth2.client.endpoint.OAuth2AccessTokenResponseClient;
import org.springframework.security.oauth2.client.endpoint.OAuth2AuthorizationCodeGrantRequest;
import org.springframework.security.oauth2.client.http.OAuth2ErrorResponseErrorHandler;
import org.springframework.security.oauth2.client.web.HttpSessionOAuth2AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AccessTokenResponse;
import org.springframework.security.oauth2.core.http.converter.OAuth2AccessTokenResponseHttpMessageConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.ssafy.damdam.domain.users.repository.UsersRepository;
import com.ssafy.damdam.domain.users.service.CustomOAuth2UserService;
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
	private final CustomOAuth2UserService customOAuth2UserService;
	private final JwtUtil jwtUtil;

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http, UsersRepository usersRepository) throws Exception {
		http
			.cors(cors -> cors.configurationSource(corsConfigurationSource()))
			.csrf(csrf -> csrf.disable())
			.formLogin(form -> form.disable())
			.httpBasic(basic -> basic.disable())
			.addFilterBefore(new JwtFilter(jwtUtil, usersRepository), UsernamePasswordAuthenticationFilter.class)
			.oauth2Login(oauth2 -> oauth2
				.authorizationEndpoint(endpoint -> endpoint
					.baseUri("/oauth2/authorization")
					.authorizationRequestRepository(new HttpSessionOAuth2AuthorizationRequestRepository())
				)
				.tokenEndpoint(token -> token
					.accessTokenResponseClient(oAuth2AccessTokenResponseClient())
				)
				.userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
				.successHandler(customSuccessHandler)
				.failureHandler(oAuth2AuthenticationFailureHandler)
			)
			.authorizeHttpRequests(auth -> auth
				.requestMatchers(
					"/", "/error", "/favicon.ico",
					"/oauth2/**", "/login/oauth2/**",
					"/ws-connect", "/ws-connect/**",
					"/css/**", "/js/**", "/images/**", "/assets/**",
					"/dist/**", "/plugins/**", "/resources/**"
				).permitAll()
				.anyRequest().authenticated()
			)
			.sessionManagement(session -> session
				.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
			.exceptionHandling(ex -> ex.authenticationEntryPoint(jwtAuthenticationEntryPoint));

		return http.build();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOrigins(Arrays.asList(
			"http://localhost:8080",
			"https://localhost:8080",
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

	@Bean
	public OAuth2AccessTokenResponseClient<OAuth2AuthorizationCodeGrantRequest> oAuth2AccessTokenResponseClient() {
		return new OAuth2AccessTokenResponseClient<>() {

			private final DefaultAuthorizationCodeTokenResponseClient defaultClient = new DefaultAuthorizationCodeTokenResponseClient();
			private final DefaultAuthorizationCodeTokenResponseClient kakaoClient = createKakaoClient();
			private final DefaultAuthorizationCodeTokenResponseClient googleClient = defaultClient; // 기본
			private final DefaultAuthorizationCodeTokenResponseClient naverClient = defaultClient; // 기본

			@Override
			public OAuth2AccessTokenResponse getTokenResponse(
				OAuth2AuthorizationCodeGrantRequest authorizationGrantRequest) {
				String registrationId = authorizationGrantRequest.getClientRegistration().getRegistrationId();

				if ("kakao".equalsIgnoreCase(registrationId)) {
					return kakaoClient.getTokenResponse(authorizationGrantRequest);
				} else if ("google".equalsIgnoreCase(registrationId)) {
					return googleClient.getTokenResponse(authorizationGrantRequest);
				} else if ("naver".equalsIgnoreCase(registrationId)) {
					return naverClient.getTokenResponse(authorizationGrantRequest);
				} else {
					throw new IllegalArgumentException("Unsupported OAuth2 Provider: " + registrationId);
				}
			}

			private DefaultAuthorizationCodeTokenResponseClient createKakaoClient() {
				DefaultAuthorizationCodeTokenResponseClient client = new DefaultAuthorizationCodeTokenResponseClient();

				RestTemplate restTemplate = new RestTemplate(
					Arrays.asList(
						new FormHttpMessageConverter(), // form-urlencoded
						new OAuth2AccessTokenResponseHttpMessageConverter() // token 변환기
					)
				);
				restTemplate.setErrorHandler(new OAuth2ErrorResponseErrorHandler());

				restTemplate.getInterceptors().add((request, body, execution) -> {
					request.getHeaders()
						.setAccept(Collections.singletonList(org.springframework.http.MediaType.APPLICATION_JSON));
					return execution.execute(request, body);
				});

				client.setRestOperations(restTemplate);
				return client;
			}
		};
	}

}
