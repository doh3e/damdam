package com.ssafy.damdam.global.validation;

import java.util.Arrays;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class EnumValidator implements ConstraintValidator<ValidEnum, Enum<?>> {
	private Enum<?>[] validValues;

	@Override
	public void initialize(ValidEnum constraintAnnotation) {
		validValues = constraintAnnotation.enumClass().getEnumConstants();
	}

	@Override
	public boolean isValid(Enum<?> value, ConstraintValidatorContext context) {
		if (value == null)
			return false;
		return Arrays.asList(validValues).contains(value);
	}
}
