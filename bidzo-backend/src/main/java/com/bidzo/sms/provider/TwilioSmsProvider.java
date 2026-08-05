package com.bidzo.sms.provider;

import org.springframework.stereotype.Component;
import com.bidzo.sms.dto.SmsRequest;
import com.bidzo.sms.dto.SmsResponse;
import com.bidzo.sms.config.SmsProperties;

@Component
public class TwilioSmsProvider implements SmsProvider {

    private final SmsProperties properties;

    public TwilioSmsProvider(SmsProperties properties) {
        this.properties = properties;
    }

    @Override
    public SmsResponse sendSms(SmsRequest request) {
        // TODO: implement Twilio SMS sending
        return new SmsResponse(null, "NOT_IMPLEMENTED", "Twilio provider is a placeholder");
    }
}
