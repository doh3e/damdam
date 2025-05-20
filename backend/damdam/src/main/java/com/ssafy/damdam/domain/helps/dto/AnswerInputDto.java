package com.ssafy.damdam.domain.helps.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnswerInputDto {

	@NotNull(message = "내용은 필수 입력 값입니다.")
	@Size(max = 2000, message = "내용은 2000자를 넘을 수 없습니다.")
	String content;
}
