package com.bidzo.email.provider;

import org.springframework.stereotype.Component;
import com.bidzo.email.dto.EmailRequest;
import com.bidzo.email.dto.EmailResponse;
import com.bidzo.email.config.EmailProperties;

@Component
public class SesEmailProvider implements EmailProvider {

    private final EmailProperties properties;

    public SesEmailProvider(EmailProperties properties) {
        this.properties = properties;
    }

    @Override
    public EmailResponse sendEmail(EmailRequest request) {
        // TODO: implement AWS SES sending
        return new EmailResponse(null, "NOT_IMPLEMENTED", "SES provider is a placeholder");
    }
}
