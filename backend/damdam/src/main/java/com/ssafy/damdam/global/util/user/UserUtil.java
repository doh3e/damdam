package com.ssafy.damdam.global.util.user;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.ssafy.damdam.domain.users.dto.auth.CustomOAuth2User;
import com.ssafy.damdam.domain.users.entity.Role;
import com.ssafy.damdam.domain.users.entity.Users;
import com.ssafy.damdam.domain.users.repository.UsersRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserUtil {

	private final UsersRepository usersRepository;

	@Transactional(readOnly = true)
	public Users getUser() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		if (authentication == null || authentication.getPrincipal() == "anonymousUser") {
			log.warn("SecurityContext에 Authentication이 없습니다. 사용자가 로그인하지 않았을 가능성이 큽니다.");
			return null;
		}

		Object principal = authentication.getPrincipal();

		if (!(principal instanceof CustomOAuth2User customUser)) {
			log.error("Principal이 CustomOAuth2User 타입이 아닙니다. 현재 타입: {}", principal.getClass().getName());
			return null;
		}

		String personalId = customUser.getPersonalId();
		log.info("Personal ID: {}", personalId);

		Users users = (Users)usersRepository.findByPersonalId(personalId)
			.orElseGet(null);

		log.info("personlId: {}", users.getPersonalId());

		return users;
	}

	@Transactional(readOnly = true)
	public boolean isAdmin(Users user) {
		if (user == null || user.getRole() != Role.ROLE_ADMIN) {
			log.info("is Not Admin");
			return false;
		}

		log.info("is Admin");
		return true;
	}

	@Transactional(readOnly = true)
	public boolean isMine(Long userId, Users user) {
		if (user == null || !user.getUserId().equals(userId)) {
			log.info("is Not Mine");
			return false;
		}

		log.info("is Mine");
		return true;
	}

}
