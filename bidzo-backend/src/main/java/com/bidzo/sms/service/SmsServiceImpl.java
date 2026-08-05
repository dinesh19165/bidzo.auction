package com.bidzo.sms.service;

import org.springframework.stereotype.Service;
import com.bidzo.sms.provider.SmsProvider;
import com.bidzo.sms.config.SmsProperties;
import com.bidzo.sms.dto.SmsRequest;
import com.bidzo.sms.dto.SmsResponse;
import com.bidzo.sms.dto.OtpRequest;
import com.bidzo.sms.dto.OtpResponse;
import com.bidzo.sms.util.OtpGenerator;

@Service
public class SmsServiceImpl implements SmsService {

    private final SmsProvider provider;
    private final SmsProperties properties;
    private final OtpGenerator otpGenerator;

    public SmsServiceImpl(SmsProvider provider, SmsProperties properties, OtpGenerator otpGenerator) {
        this.provider = provider;
        this.properties = properties;
        this.otpGenerator = otpGenerator;
    }

    @Override
    public SmsResponse sendSms(SmsRequest request) {
        // TODO: validate and delegate to provider
        return provider.sendSms(request);
    }

    @Override
    public OtpResponse generateAndSendOtp(OtpRequest request) {
        // TODO: generate OTP, send via provider, store/return response (no storage here)
        String otp = otpGenerator.generate(request.getLength());
        OtpResponse resp = new OtpResponse();
        resp.setOtp(otp);
        // TODO: send OTP via provider
        return resp;
    }
}
