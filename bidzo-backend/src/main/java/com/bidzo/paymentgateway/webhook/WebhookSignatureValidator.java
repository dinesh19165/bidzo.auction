package com.bidzo.paymentgateway.webhook;

import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class WebhookSignatureValidator {

    public WebhookSignatureValidator() {}

    public boolean validate(Map<String, Object> payload, String signature) {
        // TODO: implement signature validation logic
        return false;
    }
}
