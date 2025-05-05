package com.ssafy.damdam.global.redis;

import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Getter
@RedisHash(value = "counsel:session")
public class CounselSession {
	@Id
	private Long counsId;

	// 유저 아이디
	private Long userId;

	// 남은 토큰 횟수 최초 20개, 유저 대화 발송시 1회 차감, 0개 도달 시 AI답변 발송 후 상담 종료
	private int tokenCount;

	// 발화자
	private String talker;

	// 타임스탬프
	private String timestamp;

	// 음성대화 여부
	private boolean isVoice;

	// 상담 내용
	private String content;

	// 각 감정별 수치 0~100
	private String happiness;

	private String angry;

	private String disgust;

	private String fear;

	private String neutral;

	private String sadness;

	private String surprise;

	public void decrementToken() {
		if (this.tokenCount > 0) {
			this.tokenCount--;
		}
	}

}
