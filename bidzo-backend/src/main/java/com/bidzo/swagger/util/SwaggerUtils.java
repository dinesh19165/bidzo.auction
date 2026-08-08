package com.bidzo.swagger.util;

import io.swagger.v3.oas.models.media.Schema;

public final class SwaggerUtils {

    private SwaggerUtils() {
    }

    public static <T> Schema<T> exampleSchema(Class<T> clazz) {
        Schema<T> schema = new Schema<>();
        schema.set$ref(clazz.getSimpleName());
        return schema;
    }
}