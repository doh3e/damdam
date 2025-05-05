package com.ssafy.damdam.domain.users.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Age {
	UNKNOWN("연령불상"),
	UNDER_TEN("10세 미만"),
	TEENS("10대"),
	TWENTIES("20대"),
	THIRTIES("30대"),
	FORTIES("40대"),
	FIFTIES("50대"),
	SIXTIES("60대"),
	SEVENTIES("70대"),
	EIGHTIES("80대"),
	NINETIES("90대"),
	HUNDRED_UP("100세 이상");

	private final String displayName;
}
