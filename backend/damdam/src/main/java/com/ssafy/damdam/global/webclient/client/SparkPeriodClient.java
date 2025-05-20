package com.ssafy.damdam.global.webclient.client;

import static com.ssafy.damdam.global.webclient.exception.WebClientExceptionCode.*;

import java.time.LocalDate;
import java.util.Collections;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.ssafy.damdam.domain.reports.dto.SparkResponseDto;
import com.ssafy.damdam.global.webclient.exception.WebClientException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class SparkPeriodClient {
	private final WebClient sparkWebClient;

	public SparkResponseDto getRawResults(
		Long userId,
		LocalDate startDate,
		LocalDate endDate
	) {
		try {
			return sparkWebClient.get()
				.uri("/{userId}/{start}/{end}", userId, startDate, endDate)
				.retrieve()
				.bodyToMono(SparkResponseDto.class)
				.blockOptional()
				.orElse(new SparkResponseDto(0, Collections.emptyList()));
		} catch (Exception e) {
			log.error("Spark API 호출 중 오류: userId={}, start={}, end={}", userId, startDate, endDate, e);
			throw new WebClientException(SPARK_API_ERROR);
		}
	}
}
