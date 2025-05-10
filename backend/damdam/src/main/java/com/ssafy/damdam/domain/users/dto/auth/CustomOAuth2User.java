package com.ssafy.damdam.domain.users.dto.auth;

import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

/**
 * OAuth2 인증 후 사용자 정보를 담는 Custom OAuth2User
 */
public class CustomOAuth2User implements OAuth2User {
	private final UserDto userDto;
	private final Map<String, Object> attributes;
	private final String nameAttributeKey;

	/**
	 * @param userDto         사용자 DTO
	 * @param attributes      OAuth2 공급자가 반환한 유저 속성
	 * @param nameAttributeKey principalName 으로 사용할 속성 키
	 */
	public CustomOAuth2User(
		UserDto userDto,
		Map<String, Object> attributes,
		String nameAttributeKey
	) {
		this.userDto = userDto;
		this.attributes = attributes;
		this.nameAttributeKey = nameAttributeKey;
	}

	@Override
	public Map<String, Object> getAttributes() {
		return attributes;
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		// 단일 ROLE_USER 권한만 부여
		return List.of((GrantedAuthority)userDto::getRole);
	}

	@Override
	public String getName() {
		// personalId를 principalName으로 사용
		return userDto.getPersonalId();
	}

	// 추가 정보 접근용 메서드
	public Long getUserId() {
		return userDto.getUserId();
	}

	public String getEmail() {
		return userDto.getEmail();
	}

	public String getRole() {
		return userDto.getRole();
	}

	public String getNickname() {
		return userDto.getNickname();
	}

	public String getPersonalId() {
		return userDto.getPersonalId();
	}
}
