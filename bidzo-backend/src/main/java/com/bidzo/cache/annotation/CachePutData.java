package com.bidzo.cache.annotation;

import org.springframework.cache.annotation.CachePut;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.lang.annotation.ElementType;

@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.TYPE})
@CachePut
public @interface CachePutData {
    String[] value() default {};
}
