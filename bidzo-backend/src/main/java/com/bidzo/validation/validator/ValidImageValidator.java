package com.bidzo.validation.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import com.bidzo.validation.annotation.ValidImage;

public class ValidImageValidator implements ConstraintValidator<ValidImage, String> {

    @Override
    public void initialize(ValidImage constraintAnnotation) {
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        // TODO: implement image validation (e.g., content type, size checks)
        return value == null || value.isBlank() || value.matches(".*\\.(jpg|jpeg|png|gif)$");
    }
}
