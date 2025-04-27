package com.ssafy.damdam.domain.users.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Age {

	UNDER_TEN(0, "10세 미만"),
	TEENS(10, "10대"),
	TWENTIES(20, "20대"),
	THIRTIES(30, "30대"),
	FORTIES(40, "40대"),
	FIFTIES(50, "50대"),
	SIXTIES(60, "60대"),
	SEVENTIES(70, "70대"),
	EIGHTIES(80, "80대"),
	NINETIES(90, "90대"),
	HUNDRED_UP(100, "100세 이상");

	private final int code;
	private final String displayName;
}
