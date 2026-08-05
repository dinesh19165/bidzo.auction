package com.bidzo.validation.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import com.bidzo.validation.annotation.ValidOrderStatus;

public class ValidOrderStatusValidator implements ConstraintValidator<ValidOrderStatus, String> {

    @Override
    public void initialize(ValidOrderStatus constraintAnnotation) {
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        // TODO: validate against allowed order statuses
        return true;
    }
}
