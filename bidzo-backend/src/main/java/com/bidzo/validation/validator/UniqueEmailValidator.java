package com.bidzo.validation.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import com.bidzo.validation.annotation.UniqueEmail;

public class UniqueEmailValidator implements ConstraintValidator<UniqueEmail, String> {

    @Override
    public void initialize(UniqueEmail constraintAnnotation) {
        // no-op
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        // TODO: implement uniqueness check (database lookup) when wiring repositories
        return true;
    }
}
