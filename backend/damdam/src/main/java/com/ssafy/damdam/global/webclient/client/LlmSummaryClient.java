package com.ssafy.damdam.global.webclient.client;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.ssafy.damdam.domain.counsels.dto.LlmSummaryRequest;
import com.ssafy.damdam.domain.counsels.dto.LlmSummaryResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LlmSummaryClient {

	private final WebClient summaryWebClient;

	public LlmSummaryResponse requestSummary(LlmSummaryRequest dto) {
		return summaryWebClient.post()
			.bodyValue(dto)
			.retrieve()
			.bodyToMono(LlmSummaryResponse.class)
			.block();
	}
}
