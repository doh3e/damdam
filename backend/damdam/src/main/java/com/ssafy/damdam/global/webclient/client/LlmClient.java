package com.ssafy.damdam.global.webclient.client;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class LlmClient {

    private final WebClient llmWebClient;

    public String requestChatResponse(String sessionId) {
        return llmWebClient.post()
                .bodyValue(Map.of("sessionId", sessionId))
                .retrieve()
                .bodyToMono(String.class)
                .block(); // Virtual Thread 환경에선 OK
    }
}
