package com.ssafy.damdam.domain.users.dto.auth;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Map;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class CustomOAuth2User implements OAuth2User {
	private final UserDto userDto;

	@Override
	public Map<String, Object> getAttributes() {
		return Map.of();
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		Collection<GrantedAuthority> collection = new ArrayList<>();
		collection.add((GrantedAuthority)userDto::getRole);

		return collection;
	}

	@Override
	public String getName() {
		return userDto.getEmail();
	}

	public Long getUserId() {
		return userDto.getUserId();
	}

	public String getRole() {
		return userDto.getRole();
	}

	public String getUsername() {
		return userDto.getNickname();
	}

	public String getPersonalId() {
		return userDto.getPersonalId();
	}
}
