package com.bidzo.validation.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import com.bidzo.validation.annotation.ValidPanNumber;

public class ValidPanNumberValidator implements ConstraintValidator<ValidPanNumber, String> {

    @Override
    public void initialize(ValidPanNumber constraintAnnotation) {
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        // TODO: implement PAN format validation
        return value == null || value.isBlank() || value.matches("[A-Z]{5}[0-9]{4}[A-Z]");
    }
}
