package com.ssafy.damdam.domain.helps.dto;

import com.ssafy.damdam.domain.helps.entity.InquiryCategory;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InquiryInputDto {

	@Email(message = "올바른 이메일 형식이 아닙니다.")
	@NotBlank(message = "이메일은 필수 입력 값입니다.")
	@Size(max = 80, message = "이메일은 80자를 넘을 수 없습니다.")
	@Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", message = "이메일에 한글을 포함할 수 없습니다.")
	private String email;       // 문의자 이메일

	@NotNull(message = "제목은 필수 입력 값입니다.")
	@Size(max = 50, message = "제목은 50자를 넘을 수 없습니다.")
	private String title;       // 문의 제목

	@NotBlank
	private String category;  // 문의 카테고리(enum)

	@NotNull(message = "내용은 필수 입력 값입니다.")
	@Size(max = 2000, message = "내용은 2000자를 넘을 수 없습니다.")
	private String content;     // 문의 내용

	public void emailTextGenerator() {
		{
			this.title = title + "문의하신 내용 전송 드립니다.";
			this.content = "<h1>문의 종류 : " + InquiryCategory.valueOf(category).getDisplayName() + "</h1>\n "
				+ content
				+ "\n\n<b>빠른 시일 내에 답변해드리겠습니다. 감사합니다.</b>\n"
				+ "\n\n<b>담담팀 드림</b>\n";

		}
	}
}
