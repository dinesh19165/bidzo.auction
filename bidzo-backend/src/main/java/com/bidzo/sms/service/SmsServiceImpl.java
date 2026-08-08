package com.bidzo.sms.service;

import java.util.Map;

import org.springframework.stereotype.Service;
import com.bidzo.sms.provider.SmsProvider;
import com.bidzo.sms.config.SmsProperties;
import com.bidzo.sms.dto.SmsRequest;
import com.bidzo.sms.dto.SmsResponse;
import com.bidzo.sms.dto.OtpRequest;
import com.bidzo.sms.dto.OtpResponse;

@Service
public class SmsServiceImpl implements SmsService {

    private final SmsProvider provider;
    private final SmsProperties properties;

    public SmsServiceImpl(Map<String, SmsProvider> providers, SmsProperties properties) {
        this.properties = properties;

        String configured = properties != null ? properties.getProvider() : null;
        SmsProvider selected = null;
        if (configured != null) {
            String beanName = configured + "SmsProvider"; // e.g. "twilio" -> "twilioSmsProvider"
            selected = providers.get(beanName);
        }

        if (selected == null) {
            selected = providers.get("twilioSmsProvider");
        }

        if (selected == null) {
            selected = providers.values().stream().findFirst().orElse(null);
        }

        if (selected == null) {
            throw new IllegalStateException("No SmsProvider beans available");
        }

        this.provider = selected;
    }

    @Override
    public SmsResponse sendSms(SmsRequest request) {
        // TODO: validate and delegate to provider
        return provider.sendSms(request);
    }

    @Override
    public OtpResponse generateAndSendOtp(OtpRequest request) {
        // TODO: generate OTP, send via provider, store/return response (no storage here)
        String otp = new com.bidzo.sms.util.OtpGenerator().generate(request.getLength());
        OtpResponse resp = new OtpResponse();
        resp.setOtp(otp);
        // TODO: send OTP via provider
        return resp;
    }
}
