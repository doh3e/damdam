package com.ssafy.damdam.domain.users.repository;

import org.springframework.stereotype.Repository;

import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class UsersRepositoryCustomImpl implements UsersRepositoryCustom {

	private final JPAQueryFactory queryFactory;

}
