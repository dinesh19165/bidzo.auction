package com.bidzo.email.provider;

import org.springframework.stereotype.Component;
import com.bidzo.email.dto.EmailRequest;
import com.bidzo.email.dto.EmailResponse;
import com.bidzo.email.config.EmailProperties;

@Component
public class SendGridEmailProvider implements EmailProvider {

    private final EmailProperties properties;

    public SendGridEmailProvider(EmailProperties properties) {
        this.properties = properties;
    }

    @Override
    public EmailResponse sendEmail(EmailRequest request) {
        // TODO: implement SendGrid sending
        return new EmailResponse(null, "NOT_IMPLEMENTED", "SendGrid provider is a placeholder");
    }
}
