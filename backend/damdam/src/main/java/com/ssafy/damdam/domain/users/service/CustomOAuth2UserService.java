package com.ssafy.damdam.domain.users.service;

import com.ssafy.damdam.domain.users.dto.auth.*;
import com.ssafy.damdam.domain.users.entity.Users;
import com.ssafy.damdam.domain.users.entity.UserInfo;
import com.ssafy.damdam.domain.users.entity.UserSetting;
import com.ssafy.damdam.domain.users.repository.UsersRepository;
import com.ssafy.damdam.domain.users.repository.UserInfoRepository;
import com.ssafy.damdam.domain.users.repository.UserSettingRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UsersRepository usersRepository;
    private final UserInfoRepository userInfoRepository;
    private final UserSettingRepository userSettingRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        String provider = userRequest.getClientRegistration().getRegistrationId();

        log.info("[OAuth2UserService] provider: {}", provider);
        log.info("[OAuth2UserService] attributes: {}", oAuth2User.getAttributes());

        OAuth2Response oAuth2Response = getOAuth2Response(provider, oAuth2User);

        String providerId = oAuth2Response.getProviderId();

        // providerId가 6자 미만이면 전체 사용, 이상이면 앞 6자만 사용
        String shortId = providerId.length() >= 6
                ? providerId.substring(0, 6)
                : providerId;

        String randomPart = UUID.randomUUID().toString().substring(0, 6);
        String generatedNickname = provider + "_" + shortId + "_" + randomPart;
        String personalId = provider + "_" + providerId;

        UserDto userDto = UserDto.builder()
                .provider(oAuth2Response.getProvider())
                .personalId(personalId)
                .email(oAuth2Response.getEmail())
                .nickname(generatedNickname)
                .role("ROLE_USER")
                .build();

        Users user = usersRepository.findByEmail(userDto.getEmail())
                .orElseGet(() -> {
                    Users savedUser = usersRepository.save(userDto.toEntity());
                    userInfoRepository.save(UserInfo.createDefaultInfo(savedUser));   // ⭐ 유저정보 기본값 저장
                    userSettingRepository.save(UserSetting.createDefaultSetting(savedUser)); // ⭐ 유저설정 기본값 저장
                    return savedUser;
                });

        UserDto loadedUserDto = new UserDto(user.getUserId(), user.getPersonalId(), user.getRole().name());
        return new CustomOAuth2User(loadedUserDto);
    }

    private static OAuth2Response getOAuth2Response(String provider, OAuth2User oAuth2User) {
        OAuth2Response oAuth2Response;

        if ("kakao".equals(provider)) {
            oAuth2Response = new KakaoResponse(oAuth2User.getAttributes());
        } else if ("google".equals(provider)) {
            oAuth2Response = new GoogleResponse(oAuth2User.getAttributes());
        } else if ("naver".equals(provider)) {
            oAuth2Response = new NaverResponse(oAuth2User.getAttributes());
        } else {
            throw new IllegalArgumentException("지원하지 않는 로그인 제공자입니다: " + provider);
        }
        return oAuth2Response;
    }
}
