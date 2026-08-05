package com.bidzo.sms.service;

import com.bidzo.sms.dto.SmsRequest;
import com.bidzo.sms.dto.SmsResponse;
import com.bidzo.sms.dto.OtpRequest;
import com.bidzo.sms.dto.OtpResponse;

public interface SmsService {
    SmsResponse sendSms(SmsRequest request);
    OtpResponse generateAndSendOtp(OtpRequest request);
}
