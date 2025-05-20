package com.ssafy.damdam.global.webclient.client;

import com.ssafy.damdam.domain.counsels.dto.AudioApiFullResponse;
import com.ssafy.damdam.domain.counsels.dto.EmotionDto;
import com.ssafy.damdam.domain.counsels.dto.TextApiFullResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyzeTextClient {

    private final WebClient textWebClient;

    public EmotionDto analyzeText(String text) {

        try {
            TextApiFullResponse full = textWebClient.post()
                    .bodyValue(Map.of("text", text))
                    .retrieve()
                    .bodyToMono(TextApiFullResponse.class)
                    .block();

            return EmotionDto.builder()
                    .happiness((int) (full.getResult().getEmotion_scores().getHappiness()))
                    .angry((int) (full.getResult().getEmotion_scores().getAngry()))
                    .sadness((int) (full.getResult().getEmotion_scores().getSadness()))
                    .neutral((int) (full.getResult().getEmotion_scores().getNeutral()))
                    .other((int) (full.getResult().getEmotion_scores().getOther()))
                    .build();

        } catch (WebClientResponseException e) {
            log.error("[AudioClient] FastAPI 오류 응답: status={}, body={}",
                    e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("감성 분석 API(텍스트) 오류", e);

        } catch (Exception e) {
            log.error("[AudioClient] FastAPI 호출 중 예외 발생", e);
            throw new RuntimeException("서버 내부 오류", e);
        }

    }
}
