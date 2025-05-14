package com.ssafy.damdam.global.webclient.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "fastapi.llm")
public class LlmApiProperties {
    private String baseUrl;
    private String summaryUrl;
}
