package com.ssafy.damdam.global.webclient.client;

import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.ssafy.damdam.domain.counsels.dto.LlmAiChatRequest;
import com.ssafy.damdam.domain.counsels.dto.LlmAiChatResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class LlmChatClient {

	private final WebClient chatWebClient;

	public LlmAiChatResponse requestChatResponse(LlmAiChatRequest request) {
		try {
			return chatWebClient.post()
					.bodyValue(request)
					.retrieve()
					.onStatus(HttpStatusCode::isError, resp ->
							resp.bodyToMono(String.class)
									.flatMap(body -> {
										log.error("[LLM] status={} body={}", resp.statusCode(), body);
										return Mono.error(new RuntimeException("LLM 호출 실패: " + resp.statusCode()));
									})
					)
					.bodyToMono(LlmAiChatResponse.class)
					.block();
		} catch (RuntimeException e) {
			log.error("[LLM] 호출 실패: {}", e.getMessage());
			throw e;
		}
	}
}

