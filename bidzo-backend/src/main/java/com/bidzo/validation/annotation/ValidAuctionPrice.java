package com.bidzo.validation.annotation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.lang.annotation.ElementType;

@Documented
@Constraint(validatedBy = com.bidzo.validation.validator.ValidAuctionPriceValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidAuctionPrice {
    String message() default "Invalid auction price";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
