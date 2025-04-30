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
        // 1. 기본 유저 정보 로드
        OAuth2User defaultUser = super.loadUser(userRequest);
        String provider = userRequest.getClientRegistration().getRegistrationId();
        log.info("[OAuth2UserService] provider: {}", provider);
        log.info("[OAuth2UserService] attributes: {}", defaultUser.getAttributes());

        // 2. OAuth2Response 추출
        OAuth2Response oAuth2Response = getOAuth2Response(provider, defaultUser);

        // 3. 신규 사용자 DTO 생성
        UserDto newUserDto = UserDto.createUserDto(oAuth2Response);

        // 4. Users 엔티티 조회 또는 생성
        Users user = usersRepository.findByEmail(newUserDto.getEmail())
                .orElseGet(() -> {
                    Users saved = usersRepository.save(newUserDto.toEntity());
                    userInfoRepository.save(UserInfo.createDefaultInfo(saved));
                    userSettingRepository.save(UserSetting.createDefaultSetting(saved));
                    return saved;
                });

        // 5. nameAttributeKey 가져오기
        String nameAttributeKey = userRequest.getClientRegistration()
                .getProviderDetails()
                .getUserInfoEndpoint()
                .getUserNameAttributeName();

        // 6. 로그인 사용자 DTO 생성 via entity factory
        // UserDto에 아래 정적 메서드 추가 필요:
        // public static UserDto fromEntity(Users user) { ... }
        UserDto loadedDto = UserDto.fromEntity(user);

        // 7. CustomOAuth2User 생성 CustomOAuth2User 생성
        return new CustomOAuth2User(
                loadedDto,
                defaultUser.getAttributes(),
                nameAttributeKey
        );
    }

    private static OAuth2Response getOAuth2Response(String provider, OAuth2User oAuth2User) {
        if ("kakao".equals(provider)) {
            return new KakaoResponse(oAuth2User.getAttributes());
        } else if ("google".equals(provider)) {
            return new GoogleResponse(oAuth2User.getAttributes());
        } else if ("naver".equals(provider)) {
            return new NaverResponse(oAuth2User.getAttributes());
        }
        throw new IllegalArgumentException("지원하지 않는 로그인 제공자입니다: " + provider);
    }
}
