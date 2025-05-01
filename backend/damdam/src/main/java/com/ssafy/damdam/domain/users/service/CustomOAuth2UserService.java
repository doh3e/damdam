package com.ssafy.damdam.domain.users.service;

import static com.ssafy.damdam.domain.users.exception.auth.AuthExceptionCode.*;

import java.util.Optional;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ssafy.damdam.domain.users.dto.auth.CustomOAuth2User;
import com.ssafy.damdam.domain.users.dto.auth.GoogleResponse;
import com.ssafy.damdam.domain.users.dto.auth.KakaoResponse;
import com.ssafy.damdam.domain.users.dto.auth.NaverResponse;
import com.ssafy.damdam.domain.users.dto.auth.OAuth2Response;
import com.ssafy.damdam.domain.users.dto.auth.UserDto;
import com.ssafy.damdam.domain.users.entity.UserInfo;
import com.ssafy.damdam.domain.users.entity.UserSetting;
import com.ssafy.damdam.domain.users.entity.Users;
import com.ssafy.damdam.domain.users.exception.auth.AuthException;
import com.ssafy.damdam.domain.users.repository.UserInfoRepository;
import com.ssafy.damdam.domain.users.repository.UserSettingRepository;
import com.ssafy.damdam.domain.users.repository.UsersRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

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

		// 2. provider, OAuth2Response, UserDto 준비
		String provider = userRequest.getClientRegistration().getRegistrationId();
		OAuth2Response oAuth2Response = getOAuth2Response(provider, defaultUser);
		UserDto newUserDto = UserDto.createUserDto(oAuth2Response);

		// 3. personalId 생성 (provider + "_" + socialId)
		String socialId = oAuth2Response.getProviderId();
		String personalId = provider + "_" + socialId;

		// 4. personalId로 기존 회원 조회
		Optional<Users> byPersonal = usersRepository.findByPersonalId(personalId);
		if (byPersonal.isPresent()) {
			Users existing = byPersonal.get();
			String nameAttrKey = userRequest.getClientRegistration()
				.getProviderDetails()
				.getUserInfoEndpoint()
				.getUserNameAttributeName();
			UserDto dto = UserDto.fromEntity(existing);
			return new CustomOAuth2User(dto, defaultUser.getAttributes(), nameAttrKey);
		}

		// 5. personalId 불일치 → 이메일 중복 체크
		String email = newUserDto.getEmail();
		if (usersRepository.findByEmail(email).isPresent()) {
			throw new AuthException(AUTH_EMAIL_ALREADY_EXISTS);
		}

		// 6. 신규 회원 가입 처리
		Users saved = usersRepository.save(newUserDto.toEntity());
		userInfoRepository.save(UserInfo.createDefaultInfo(saved));
		userSettingRepository.save(UserSetting.createDefaultSetting(saved));

		String nameAttrKey = userRequest.getClientRegistration()
			.getProviderDetails()
			.getUserInfoEndpoint()
			.getUserNameAttributeName();
		UserDto savedDto = UserDto.fromEntity(saved);
		return new CustomOAuth2User(savedDto, defaultUser.getAttributes(), nameAttrKey);
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
