package com.bidzo.validation.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.math.BigDecimal;
import com.bidzo.validation.annotation.ValidWalletAmount;

public class ValidWalletAmountValidator implements ConstraintValidator<ValidWalletAmount, BigDecimal> {

    @Override
    public void initialize(ValidWalletAmount constraintAnnotation) {
    }

    @Override
    public boolean isValid(BigDecimal value, ConstraintValidatorContext context) {
        // TODO: implement wallet-specific rules (e.g., transfer limits)
        return value == null || value.signum() >= 0;
    }
}
