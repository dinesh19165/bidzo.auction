package com.bidzo.validation.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import com.bidzo.validation.annotation.ValidBankAccount;

public class ValidBankAccountValidator implements ConstraintValidator<ValidBankAccount, String> {

    @Override
    public void initialize(ValidBankAccount constraintAnnotation) {
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        // TODO: implement bank account validation rules
        return value == null || value.isBlank() || value.matches("[0-9A-Za-z\\-]{5,34}");
    }
}
