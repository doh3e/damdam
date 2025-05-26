package com.ssafy.damdam.global.webclient.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@ConfigurationProperties(prefix = "fastapi.llm")
public class LlmApiProperties {
	private String chatUrl;
	private String summaryUrl;
	private String periodUrl;
}
