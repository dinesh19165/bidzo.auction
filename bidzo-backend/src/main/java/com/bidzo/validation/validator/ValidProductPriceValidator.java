package com.bidzo.validation.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.math.BigDecimal;
import com.bidzo.validation.annotation.ValidProductPrice;

public class ValidProductPriceValidator implements ConstraintValidator<ValidProductPrice, BigDecimal> {

    @Override
    public void initialize(ValidProductPrice constraintAnnotation) {
    }

    @Override
    public boolean isValid(BigDecimal value, ConstraintValidatorContext context) {
        // TODO: implement product price rules
        return value == null || value.signum() >= 0;
    }
}
