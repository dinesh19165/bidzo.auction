package com.bidzo.validation.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import com.bidzo.validation.annotation.ValidPaymentStatus;

public class ValidPaymentStatusValidator implements ConstraintValidator<ValidPaymentStatus, String> {

    @Override
    public void initialize(ValidPaymentStatus constraintAnnotation) {
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        // TODO: validate allowed payment statuses
        return true;
    }
}
