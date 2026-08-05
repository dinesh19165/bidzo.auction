package com.bidzo.email.service;

import org.springframework.stereotype.Service;
import com.bidzo.email.provider.EmailProvider;
import com.bidzo.email.config.EmailProperties;
import com.bidzo.email.dto.EmailRequest;
import com.bidzo.email.dto.EmailResponse;
import com.bidzo.email.dto.EmailTemplate;
import com.bidzo.email.template.EmailTemplateService;

@Service
public class EmailServiceImpl implements EmailService {

    private final EmailProvider provider;
    private final EmailProperties properties;
    private final EmailTemplateService templateService;

    public EmailServiceImpl(EmailProvider provider, EmailProperties properties, EmailTemplateService templateService) {
        this.provider = provider;
        this.properties = properties;
        this.templateService = templateService;
    }

    @Override
    public EmailResponse send(EmailRequest request) {
        // TODO: validate request, choose provider, delegate
        return provider.sendEmail(request);
    }

    @Override
    public EmailResponse sendTemplate(String templateName, EmailTemplate template, Object model) {
        // TODO: render template using templateService then send
        String body = templateService.renderTemplate(template, model);
        EmailRequest req = new EmailRequest();
        req.setSubject(template.getSubjectTemplate());
        req.setBody(body);
        // TODO: set recipients
        return provider.sendEmail(req);
    }
}
