package com.ssafy.damdam.global.config;

import java.util.List;

import org.springframework.boot.autoconfigure.security.oauth2.client.OAuth2ClientProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.registration.*;
import org.springframework.security.oauth2.core.AuthorizationGrantType;

@Configuration
public class OAuth2ClientConfig {

    private final OAuth2ClientProperties properties;

    public OAuth2ClientConfig(OAuth2ClientProperties properties) {
        this.properties = properties;
    }

    @Bean
    public ClientRegistrationRepository clientRegistrationRepository() {
        List<ClientRegistration> registrations = this.properties.getRegistration().entrySet().stream()
            .map(entry -> {
                String registrationId = entry.getKey();
                OAuth2ClientProperties.Registration reg = entry.getValue();
                OAuth2ClientProperties.Provider prov = this.properties.getProvider().get(registrationId);

                return ClientRegistration.withRegistrationId(registrationId)
                    .clientName(reg.getClientName())
                    .clientId(reg.getClientId())
                    .clientSecret(reg.getClientSecret())
                    .redirectUri(reg.getRedirectUri())
                    .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                    .scope(reg.getScope().toArray(new String[0]))
                    .authorizationUri(prov.getAuthorizationUri())
                    .tokenUri(prov.getTokenUri())
                    .userInfoUri(prov.getUserInfoUri())
                    // ← 여기만 변경
                    .userNameAttributeName(prov.getUserNameAttribute())
                    .build();
            })
            .toList();  // collect(Collectors.toList()) 대신 toList()

        return new InMemoryClientRegistrationRepository(registrations);
    }
}
