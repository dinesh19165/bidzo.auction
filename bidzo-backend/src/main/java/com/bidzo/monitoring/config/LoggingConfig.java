package com.bidzo.monitoring.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;
import com.bidzo.monitoring.logging.RequestLoggingFilter;
import com.bidzo.monitoring.logging.ResponseLoggingFilter;
import com.bidzo.monitoring.logging.CorrelationIdFilter;
import com.bidzo.monitoring.logging.LoggingInterceptor;

@Configuration
public class LoggingConfig {

    @Bean
    public RequestLoggingFilter requestLoggingFilter() {
        return new RequestLoggingFilter();
    }

    @Bean
    public ResponseLoggingFilter responseLoggingFilter() {
        return new ResponseLoggingFilter();
    }

    @Bean
    public CorrelationIdFilter correlationIdFilter() {
        return new CorrelationIdFilter();
    }

    @Bean
    public LoggingInterceptor loggingInterceptor() {
        return new LoggingInterceptor();
    }
}
