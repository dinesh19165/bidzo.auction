package com.bidzo.paymentgateway.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(PaymentGatewayProperties.class)
public class PaymentGatewayConfig {

    @Bean
    public PaymentGatewayProperties paymentGatewayProperties() {
        return new PaymentGatewayProperties();
    }
}
