package com.bidzo.email.template;

import com.bidzo.email.dto.EmailTemplate;

public interface EmailTemplateService {
    String renderTemplate(EmailTemplate template, Object model);
}
