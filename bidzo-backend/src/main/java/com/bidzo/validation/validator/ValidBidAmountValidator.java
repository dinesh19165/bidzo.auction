package com.bidzo.validation.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.math.BigDecimal;
import com.bidzo.validation.annotation.ValidBidAmount;

public class ValidBidAmountValidator implements ConstraintValidator<ValidBidAmount, BigDecimal> {

    @Override
    public void initialize(ValidBidAmount constraintAnnotation) {
    }

    @Override
    public boolean isValid(BigDecimal value, ConstraintValidatorContext context) {
        // TODO: implement actual auction bid amount checks (e.g., min increment)
        return value == null || value.signum() >= 0;
    }
}
