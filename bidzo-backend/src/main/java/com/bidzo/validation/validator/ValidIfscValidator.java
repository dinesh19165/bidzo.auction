package com.bidzo.validation.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import com.bidzo.validation.annotation.ValidIfsc;

public class ValidIfscValidator implements ConstraintValidator<ValidIfsc, String> {

    @Override
    public void initialize(ValidIfsc constraintAnnotation) {
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        // TODO: implement IFSC code format validation
        return value == null || value.isBlank() || value.matches("[A-Z]{4}0[0-9A-Z]{6}");
    }
}
