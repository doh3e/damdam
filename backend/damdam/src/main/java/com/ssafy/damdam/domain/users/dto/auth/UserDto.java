package com.ssafy.damdam.domain.users.dto.auth;

import com.ssafy.damdam.domain.users.entity.Provider;
import com.ssafy.damdam.domain.users.entity.Users;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * OAuth2 인증과 사용자 정보를 담는 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {

	private Long userId;
	private Provider provider;
	private String personalId;
	private String email;
	private String nickname;
	private String role;

	/**
	 * 신규 사용자 생성용 DTO 빌더
	 */
	public static UserDto createUserDto(OAuth2Response oAuth2Response) {
		String providerId = oAuth2Response.getProviderId();
		Provider provider = oAuth2Response.getProvider();
		String personalId = provider + "_" + providerId;

		return UserDto.builder()
				.provider(provider)
				.personalId(personalId)
				.email(oAuth2Response.getEmail())
				.nickname("내담이")
				.role("ROLE_USER")
				.build();
	}

	/**
	 * Entity -> DTO 변환
	 */
	public static UserDto fromEntity(Users user) {
		return UserDto.builder()
				.userId(user.getUserId())
				.provider(user.getProvider())
				.personalId(user.getPersonalId())
				.email(user.getEmail())
				.nickname(user.getNickname())
				.role(user.getRole().name())
				.build();
	}

	/**
	 * DTO -> Entity 변환
	 */
	public Users toEntity() {
		return Users.createUser(this);
	}
}
