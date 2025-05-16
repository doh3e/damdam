package com.ssafy.damdam.global.webclient.client;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class LlmSummaryClient {

    private final WebClient summaryWebClient;

    public String requestSummary(String sessionId) {
        return summaryWebClient.post()
                .bodyValue(Map.of("sessionId", sessionId))
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }
}
