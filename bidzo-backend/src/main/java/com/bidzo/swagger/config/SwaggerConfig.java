package com.bidzo.swagger.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springdoc.core.GroupedOpenApi;

@Configuration
public class SwaggerConfig {

    private final SwaggerProperties properties;

    public SwaggerConfig(SwaggerProperties properties) {
        this.properties = properties;
    }

    @Bean
    public GroupedOpenApi publicApi() {
        // TODO: tune packages and paths to match project
        return GroupedOpenApi.builder()
                .group("bidzo-public")
                .pathsToMatch("/**")
                .build();
    }
}
