package com.ssafy.damdam.domain.users.dto.auth;

import java.util.Map;

import com.ssafy.damdam.domain.users.entity.Provider;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class NaverResponse implements OAuth2Response {

    private final Map<String, Object> attributes;

    @Override
    public Provider getProvider() {
        return Provider.NAVER;
    }

    @Override
    public String getProviderId() {
        Map<String, Object> response = (Map<String, Object>) attributes.get("response");
        return response.get("id").toString();
    }

    @Override
    public String getEmail() {
        Map<String, Object> response = (Map<String, Object>) attributes.get("response");
        return response.get("email").toString();
    }
}
