package com.ssafy.damdam.domain.users.service;

import com.ssafy.damdam.domain.users.entity.Users;
import com.ssafy.damdam.domain.users.exception.auth.AuthException;
import com.ssafy.damdam.domain.users.repository.UserSettingRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ssafy.damdam.domain.users.repository.UserInfoRepository;
import com.ssafy.damdam.domain.users.repository.UsersRepository;
import com.ssafy.damdam.global.util.user.UserUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import static com.ssafy.damdam.domain.users.exception.auth.AuthExceptionCode.AUTH_MEMBER_NOT_FOUND;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class UserAuthServiceImpl extends DefaultOAuth2UserService {

	private final UsersRepository usersRepository;
	private final UserInfoRepository userInfoRepository;
	private final UserSettingRepository userSettingRepository;
	private final UserUtil userUtil;


	public void deleteUser() {
		Users user = userUtil.getUser();
		if (user == null) {
			log.error("사용자를 찾을 수 없습니다.");
			throw new AuthException(AUTH_MEMBER_NOT_FOUND);
		}
		userSettingRepository.deleteById(user.getUserId());
		userInfoRepository.deleteById(user.getUserId());
		usersRepository.deleteById(user.getUserId());
	}
}
