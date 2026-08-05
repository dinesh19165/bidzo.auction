package com.bidzo.monitoring.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.boot.actuate.autoconfigure.security.servlet.EndpointRequest;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.context.annotation.Bean;

@Configuration
public class ActuatorConfig {

    // Placeholder security configuration for actuator endpoints if needed
    @Bean
    public SecurityFilterChain actuatorSecurity(HttpSecurity http) throws Exception {
        // TODO: configure actuator endpoint security; return http.build() as placeholder
        http.authorizeHttpRequests().requestMatchers(EndpointRequest.toAnyEndpoint()).permitAll();
        return http.csrf().disable().build();
    }
}
