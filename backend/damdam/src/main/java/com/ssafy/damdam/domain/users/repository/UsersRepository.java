package com.ssafy.damdam.domain.users.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.ssafy.damdam.domain.users.entity.Provider;
import com.ssafy.damdam.domain.users.entity.Users;

@Repository
public interface UsersRepository extends JpaRepository<Users, Long>, UsersRepositoryCustom {

	Optional<Users> findByProviderAndPersonalId(Provider provider, String personalId);

	Optional<com.ssafy.damdam.domain.users.entity.Users> findByPersonalId(String personalId);

	boolean existsByNickname(String nickName);

	@Query("SELECT u.userId FROM Users u WHERE u.personalId = :personalId")
	Optional<Long> findUserIdByPersonalId(String personalId);
}
