package com.bidzo.validation.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import com.bidzo.validation.annotation.ValidLocation;

public class ValidLocationValidator implements ConstraintValidator<ValidLocation, String> {

    @Override
    public void initialize(ValidLocation constraintAnnotation) {
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        // TODO: validate location identifiers or codes
        return true;
    }
}
