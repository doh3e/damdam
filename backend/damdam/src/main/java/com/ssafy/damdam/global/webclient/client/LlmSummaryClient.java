package com.ssafy.damdam.global.webclient.client;

import static com.ssafy.damdam.global.webclient.exception.WebClientExceptionCode.*;

import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.ssafy.damdam.domain.counsels.dto.LlmSummaryRequest;
import com.ssafy.damdam.domain.counsels.dto.LlmSummaryResponse;
import com.ssafy.damdam.global.webclient.exception.WebClientException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class LlmSummaryClient {

	private final WebClient summaryWebClient;

	public LlmSummaryResponse requestSummary(LlmSummaryRequest dto) {
		try {
			return summaryWebClient.post()
				.bodyValue(dto)
				.retrieve()
				.onStatus(
					HttpStatusCode::isError,
					response -> response.bodyToMono(String.class)
						.flatMap(body -> {
							log.error("[LLM 요약 에러] status={} body={}", response.statusCode(), body);
							return Mono.error(new WebClientException(SUMMARY_AI_ERROR));
						})
				)
				.bodyToMono(LlmSummaryResponse.class)
				.block();
		} catch (Exception e) {
			log.error("[LLM 요약 예외] {}", e.getMessage(), e);
			throw new WebClientException(SUMMARY_AI_ERROR);
		}
	}
}

