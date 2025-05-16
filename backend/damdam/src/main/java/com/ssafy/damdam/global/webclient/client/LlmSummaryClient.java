package com.ssafy.damdam.global.webclient.client;

import com.ssafy.damdam.domain.counsels.dto.LlmSummaryRequestDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class LlmSummaryClient {

    private final WebClient summaryWebClient;

    public String requestSummary(LlmSummaryRequestDto dto) {
        return summaryWebClient.post()
                .bodyValue(Map.of("data", dto))
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }
}
