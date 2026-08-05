package com.bidzo.validation.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import com.bidzo.validation.annotation.ValidFileType;

public class ValidFileTypeValidator implements ConstraintValidator<ValidFileType, String> {

    private String[] allowed;

    @Override
    public void initialize(ValidFileType constraintAnnotation) {
        this.allowed = constraintAnnotation.allowed();
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        // TODO: implement file type validation (e.g., check file extension or content-type)
        if (value == null || value.isBlank()) return true;
        if (allowed == null || allowed.length == 0) return true;
        for (String a : allowed) {
            if (value.endsWith(a)) return true;
        }
        return false;
    }
}
