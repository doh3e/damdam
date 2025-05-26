package com.ssafy.damdam.domain.counsels.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatchCounselTitleRequest {

	@Schema(description = "수정할 상담 제목", example = "새로운 제목으로 변경합니다", required = true)
	@NotBlank(message = "counsTitle은 공백일 수 없습니다.")
	private String counsTitle;
}
