package com.bidzo.validation.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import com.bidzo.validation.annotation.ValidGstNumber;

public class ValidGstNumberValidator implements ConstraintValidator<ValidGstNumber, String> {

    @Override
    public void initialize(ValidGstNumber constraintAnnotation) {
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        // TODO: implement GST number format validation
        return value == null || value.isBlank() || value.matches("[0-9A-Z]{15}");
    }
}
