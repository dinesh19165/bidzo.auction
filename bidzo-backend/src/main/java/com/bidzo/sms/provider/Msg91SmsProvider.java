package com.bidzo.sms.provider;

import org.springframework.stereotype.Component;
import com.bidzo.sms.dto.SmsRequest;
import com.bidzo.sms.dto.SmsResponse;
import com.bidzo.sms.config.SmsProperties;

@Component
public class Msg91SmsProvider implements SmsProvider {

    private final SmsProperties properties;

    public Msg91SmsProvider(SmsProperties properties) {
        this.properties = properties;
    }

    @Override
    public SmsResponse sendSms(SmsRequest request) {
        // TODO: implement MSG91 SMS sending
        return new SmsResponse(null, "NOT_IMPLEMENTED", "MSG91 provider is a placeholder");
    }
}
