package com.bidzo.validation.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.math.BigDecimal;
import com.bidzo.validation.annotation.ValidAuctionPrice;

public class ValidAuctionPriceValidator implements ConstraintValidator<ValidAuctionPrice, BigDecimal> {

    @Override
    public void initialize(ValidAuctionPrice constraintAnnotation) {
    }

    @Override
    public boolean isValid(BigDecimal value, ConstraintValidatorContext context) {
        // TODO: implement price validation rules (e.g., non-negative, within limits)
        return value == null || value.signum() >= 0;
    }
}
