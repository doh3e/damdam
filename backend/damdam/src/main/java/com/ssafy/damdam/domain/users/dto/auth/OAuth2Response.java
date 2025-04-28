package com.ssafy.damdam.domain.users.dto.auth;

import com.ssafy.damdam.domain.users.entity.Provider;

public interface OAuth2Response {
	Provider getProvider();

	String getProviderId();

	String getEmail();

	String getName();
}
