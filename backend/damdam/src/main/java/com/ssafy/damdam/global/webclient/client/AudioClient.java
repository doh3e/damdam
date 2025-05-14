package com.ssafy.damdam.global.webclient.client;

import com.ssafy.damdam.domain.counsels.dto.AudioAiResponse;
import com.ssafy.damdam.domain.counsels.dto.AudioApiFullResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AudioClient {

    private final WebClient audioWebClient;

    public AudioAiResponse analyzeAudio(String audioUrl) {
        try {
            AudioApiFullResponse full = audioWebClient.post()
                    .bodyValue(Map.of("audio_url", audioUrl))
                    .retrieve()
                    .bodyToMono(AudioApiFullResponse.class)
                    .block();

            return AudioAiResponse.builder()
                    .emotion(full.getResult().getEmotion())
                    .language(full.getResult().getLanguage())
                    .happiness((int)(full.getResult().getEmotion_scores().getHappiness()))
                    .angry((int)(full.getResult().getEmotion_scores().getAngry()))
                    .sadness((int)(full.getResult().getEmotion_scores().getSadness()))
                    .neutral((int)(full.getResult().getEmotion_scores().getNeutral()))
                    .other((int)(full.getResult().getEmotion_scores().getOther()))
                    .build();

        } catch (WebClientResponseException e) {
            log.error("[AudioClient] FastAPI 오류 응답: status={}, body={}",
                    e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("감정 분석 API 오류", e);

        } catch (Exception e) {
            log.error("[AudioClient] FastAPI 호출 중 예외 발생", e);
            throw new RuntimeException("서버 내부 오류", e);
        }
    }
}
