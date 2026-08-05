package com.bidzo.sms.provider;

import com.bidzo.sms.dto.SmsRequest;
import com.bidzo.sms.dto.SmsResponse;

public interface SmsProvider {
    SmsResponse sendSms(SmsRequest request);
}
