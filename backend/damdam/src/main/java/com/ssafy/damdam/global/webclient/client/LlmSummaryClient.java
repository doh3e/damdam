package com.ssafy.damdam.global.webclient.client;

import com.ssafy.damdam.global.webclient.exception.WebClientException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.ssafy.damdam.domain.counsels.dto.LlmSummaryRequest;
import com.ssafy.damdam.domain.counsels.dto.LlmSummaryResponse;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

import static com.ssafy.damdam.global.webclient.exception.WebClientExceptionCode.SUMMARY_AI_ERROR;

@Service
@RequiredArgsConstructor
@Slf4j
public class LlmSummaryClient {

	private final WebClient summaryWebClient;

	public LlmSummaryResponse requestSummary(LlmSummaryRequest dto) {
		log.info("[LLM 요약 요청 시작] payload={}", dto);
		try {
			return summaryWebClient.post()
					.bodyValue(dto)
					.retrieve()
					.onStatus(
							status -> status.isError(),
							response -> response.bodyToMono(String.class)
									.flatMap(body -> {
										log.error("[LLM 요약 에러] status={} body={}", response.statusCode(), body);
										return Mono.error(new RuntimeException("LLM 요약 호출 실패: " + response.statusCode()));
									})
					)
					.bodyToMono(LlmSummaryResponse.class)
					.block();
		} catch (Exception e) {
			log.error("[LLM 요약 예외] {}", e.getMessage(), e);
			throw new RuntimeException("LLM 요약 처리 중 오류: " + e.getMessage());
		} finally {
			log.info("[LLM 요약 요청 종료]");
		}
	}
}

