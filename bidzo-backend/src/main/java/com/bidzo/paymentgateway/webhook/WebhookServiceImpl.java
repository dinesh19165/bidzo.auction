package com.bidzo.paymentgateway.webhook;

import org.springframework.stereotype.Service;
import com.bidzo.paymentgateway.dto.WebhookRequest;
import com.bidzo.paymentgateway.dto.WebhookResponse;
import com.bidzo.paymentgateway.webhook.WebhookSignatureValidator;

@Service
public class WebhookServiceImpl implements WebhookService {

    private final WebhookSignatureValidator validator;

    public WebhookServiceImpl(WebhookSignatureValidator validator) {
        this.validator = validator;
    }

    @Override
    public WebhookResponse handleWebhook(WebhookRequest request) {
        // TODO: validate signature, parse event, delegate handling
        boolean ok = validator.validate(request.getPayload(), request.getSignature());
        if (!ok) {
            return new WebhookResponse("INVALID_SIGNATURE", "Signature validation failed");
        }
        return new WebhookResponse("RECEIVED", "Not implemented");
    }
}
