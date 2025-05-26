package com.ssafy.damdam.global.redis;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
@RedisHash(value = "counsel:session")
public class CounselSession {
	@Id
	private Long counsId;

	// 유저 아이디
	private Long userId;

	// 남은 토큰 횟수 최초 20개, 유저 대화 발송시 1회 차감, 0개 도달 시 AI답변 발송 후 상담 종료
	private int tokenCount;

	// 발화자
	private String sender;

	// 타임스탬프
	private LocalDateTime timestamp;

	// 음성대화 여부
	private Boolean isVoice;

	// 상담 내용
	private String message;

	// 각 감정별 수치 0~100
	private int happiness;

	private int angry;

	private int neutral;

	private int sadness;

	private int other;

	private int messageOrder;

	public void decrementToken() {
		if (tokenCount > 0) tokenCount--;
	}

}
