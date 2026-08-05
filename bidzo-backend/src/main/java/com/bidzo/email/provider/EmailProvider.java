package com.bidzo.email.provider;

import com.bidzo.email.dto.EmailRequest;
import com.bidzo.email.dto.EmailResponse;

public interface EmailProvider {
    EmailResponse sendEmail(EmailRequest request);
}
