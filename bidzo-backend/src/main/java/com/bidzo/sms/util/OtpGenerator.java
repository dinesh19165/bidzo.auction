package com.bidzo.sms.util;

import java.security.SecureRandom;

public final class OtpGenerator {
    private static final SecureRandom RANDOM = new SecureRandom();

    public OtpGenerator() {}

    public String generate(int length) {
        // TODO: implement secure OTP generation logic
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < Math.max(4, length); i++) {
            sb.append(RANDOM.nextInt(10));
        }
        return sb.toString();
    }
}
