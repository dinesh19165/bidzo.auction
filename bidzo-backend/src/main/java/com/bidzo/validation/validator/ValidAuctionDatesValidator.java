package com.bidzo.validation.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import com.bidzo.validation.annotation.ValidAuctionDates;

public class ValidAuctionDatesValidator implements ConstraintValidator<ValidAuctionDates, Object> {

    @Override
    public void initialize(ValidAuctionDates constraintAnnotation) {
    }

    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        // TODO: implement cross-field validation for auction start/end dates
        // Placeholder: always valid
        return true;
    }
}
