package com.bidzo.validation.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import com.bidzo.validation.annotation.ValidAadhaar;

public class ValidAadhaarValidator implements ConstraintValidator<ValidAadhaar, String> {

    @Override
    public void initialize(ValidAadhaar constraintAnnotation) {
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        // TODO: implement Aadhaar validation; placeholder basic numeric check
        return value == null || value.isBlank() || value.matches("\\d{12}");
    }
}
