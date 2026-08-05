package com.bidzo.swagger.util;

import io.swagger.v3.oas.models.media.Schema;

public final class SwaggerUtils {
    private SwaggerUtils() {}

    public static <T> Schema<T> exampleSchema(Class<T> clazz) {
        // TODO: implement a reflection-based example schema builder or use explicit examples
        return new Schema<>().$ref(clazz.getSimpleName());
    }
}
