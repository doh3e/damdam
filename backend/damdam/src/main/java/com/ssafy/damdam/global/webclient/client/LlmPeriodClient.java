package com.ssafy.damdam.global.webclient.client;

import static com.ssafy.damdam.global.webclient.exception.WebClientExceptionCode.*;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.ssafy.damdam.domain.reports.dto.LlmPeriodReportRequest;
import com.ssafy.damdam.domain.reports.dto.LlmPeriodReportResponse;
import com.ssafy.damdam.global.webclient.exception.WebClientException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class LlmPeriodClient {

	private final WebClient periodWebClient;

	public LlmPeriodReportResponse requestPeriodReport(LlmPeriodReportRequest dto) {
		try {
			return periodWebClient.post()
				.bodyValue(dto)
				.retrieve()
				.bodyToMono(LlmPeriodReportResponse.class)
				.block();
		} catch (Exception e) {
			log.error("[AI] 기간별 레포트 생성 오류 : {}", e.getMessage(), e);
			throw new WebClientException(LLM_PERIOD_AI_ERROR);
		}
	}
}
