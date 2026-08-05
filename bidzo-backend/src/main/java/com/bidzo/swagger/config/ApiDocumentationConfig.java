package com.bidzo.swagger.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springdoc.core.customizers.OpenApiCustomiser;
import io.swagger.v3.oas.models.responses.ApiResponses;
import io.swagger.v3.oas.models.responses.ApiResponse;

@Configuration
public class ApiDocumentationConfig {

    private final SwaggerProperties properties;

    public ApiDocumentationConfig(SwaggerProperties properties) {
        this.properties = properties;
    }

    @Bean
    public OpenApiCustomiser globalResponsesCustomizer() {
        return openApi -> {
            // TODO: add standard global ApiResponses (401, 403, 500, 400 etc.)
            // Example skeleton (no-op placeholders to avoid heavy logic):
            ApiResponses responses = new ApiResponses();
            responses.addApiResponse("400", new ApiResponse().description("Bad Request"));
            responses.addApiResponse("401", new ApiResponse().description("Unauthorized"));
            responses.addApiResponse("403", new ApiResponse().description("Forbidden"));
            responses.addApiResponse("500", new ApiResponse().description("Internal Server Error"));
            // TODO: attach these responses to operations as needed
        };
    }
}
