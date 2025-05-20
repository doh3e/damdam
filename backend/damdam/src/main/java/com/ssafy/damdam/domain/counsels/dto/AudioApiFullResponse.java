package com.ssafy.damdam.domain.counsels.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

// 감정분석 api에 음성분석 요청 시 풀로 받아오는 정보
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class AudioApiFullResponse {
    private String message;
    private String filename;
    private Result result;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Result {
        private String emotion;
        private EmotionScores emotion_scores;
        private String language;
        private String event;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmotionScores {
        private double other;
        private double happiness;
        private double sadness;
        private double angry;
        private double neutral;
    }
}
