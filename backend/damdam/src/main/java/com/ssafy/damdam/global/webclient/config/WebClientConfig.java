package com.ssafy.damdam.global.webclient.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
@EnableConfigurationProperties({LlmApiProperties.class, AnalyzeApiProperties.class, SparkProperties.class})
public class WebClientConfig {

	@Bean
	public WebClient chatWebClient(LlmApiProperties props) {
		return WebClient.builder()
			.baseUrl(props.getChatUrl())
			.defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
			.build();
	}

	@Bean
	public WebClient summaryWebClient(LlmApiProperties props) {
		return WebClient.builder()
			.baseUrl(props.getSummaryUrl())
			.defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
			.build();
	}

	@Bean
	public WebClient audioWebClient(AnalyzeApiProperties props) {
		return WebClient.builder()
			.baseUrl(props.getAudioUrl())
			.defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
			.build();
	}

	@Bean
	public WebClient textWebClient(AnalyzeApiProperties props) {
		return WebClient.builder()
			.baseUrl(props.getTextUrl())
			.defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
			.build();
	}

	@Bean
	public WebClient sparkWebClient(SparkProperties props) {
		return WebClient.builder()
			.baseUrl(props.getSparkUrl())
			.defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
			.build();
	}

	@Bean
	public WebClient periodWebClient(LlmApiProperties props) {
		return WebClient.builder()
			.baseUrl(props.getPeriodUrl())
			.defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
			.build();
	}

}

