package com.ssafy.damdam.global.validation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

@Documented
@Constraint(validatedBy = EnumValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidEnum {
	Class<? extends Enum<?>> enumClass();

	String message() default "설정된 Enum 내에 없는 유효하지 않은 값입니다.";

	Class<?>[] groups() default {};

	Class<? extends Payload>[] payload() default {};
}
