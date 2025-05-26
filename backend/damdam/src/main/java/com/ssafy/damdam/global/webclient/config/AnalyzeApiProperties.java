package com.ssafy.damdam.global.webclient.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "fastapi.analyze")
public class AnalyzeApiProperties {
    private String audioUrl;
    private String textUrl;
}
