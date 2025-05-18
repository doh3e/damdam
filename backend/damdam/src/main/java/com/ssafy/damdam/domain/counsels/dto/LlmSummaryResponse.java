package com.ssafy.damdam.domain.counsels.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Builder
public class LlmSummaryResponse {
	private String summary;
	private String analyse;
	private String arousal;
	private String valence;
}
