package com.bidzo.security.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Basic Security configuration skeleton. Placeholder SecurityFilterChain bean provided
 * for later customization (JWT, roles, CSRF, CORS, etc.).
 */
@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Placeholder configuration - real configuration (authentication, authorization, filters)
        // will be added later.
        http.csrf().disable();
        http.authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }
}
