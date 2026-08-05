package com.bidzo.paymentgateway.webhook;

import com.bidzo.paymentgateway.dto.WebhookRequest;
import com.bidzo.paymentgateway.dto.WebhookResponse;

public interface WebhookService {
    WebhookResponse handleWebhook(WebhookRequest request);
}
