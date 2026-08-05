package com.bidzo.validation.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import com.bidzo.validation.annotation.UniquePhone;

public class UniquePhoneValidator implements ConstraintValidator<UniquePhone, String> {

    @Override
    public void initialize(UniquePhone constraintAnnotation) {
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        // TODO: implement uniqueness check
        return true;
    }
}
