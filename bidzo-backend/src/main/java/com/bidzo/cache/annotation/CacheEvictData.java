package com.bidzo.cache.annotation;

import org.springframework.cache.annotation.CacheEvict;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.lang.annotation.ElementType;

@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.TYPE})
@CacheEvict
public @interface CacheEvictData {
    String[] value() default {};
    boolean allEntries() default false;
}
