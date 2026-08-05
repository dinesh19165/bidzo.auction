package com.bidzo.email.service;

import com.bidzo.email.dto.EmailRequest;
import com.bidzo.email.dto.EmailResponse;
import com.bidzo.email.dto.EmailTemplate;

public interface EmailService {
    EmailResponse send(EmailRequest request);
    EmailResponse sendTemplate(String templateName, EmailTemplate template, Object model);
}
