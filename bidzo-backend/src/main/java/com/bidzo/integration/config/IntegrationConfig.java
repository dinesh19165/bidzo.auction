package com.bidzo.integration.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(IntegrationProperties.class)
public class IntegrationConfig {

    @Bean
    public IntegrationProperties integrationProperties() {
        return new IntegrationProperties();
    }
}
