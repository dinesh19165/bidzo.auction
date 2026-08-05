package com.bidzo.sms.provider;

import org.springframework.stereotype.Component;
import com.bidzo.sms.dto.SmsRequest;
import com.bidzo.sms.dto.SmsResponse;
import com.bidzo.sms.config.SmsProperties;

@Component
public class AwsSnsSmsProvider implements SmsProvider {

    private final SmsProperties properties;

    public AwsSnsSmsProvider(SmsProperties properties) {
        this.properties = properties;
    }

    @Override
    public SmsResponse sendSms(SmsRequest request) {
        // TODO: implement AWS SNS SMS sending
        return new SmsResponse(null, "NOT_IMPLEMENTED", "AWS SNS provider is a placeholder");
    }
}
