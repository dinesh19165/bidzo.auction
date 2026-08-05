package com.bidzo.email.template;

import org.springframework.stereotype.Service;
import com.bidzo.email.dto.EmailTemplate;

@Service
public class TemplateEngineService implements EmailTemplateService {

    public TemplateEngineService() {
        // TODO: inject and configure a real template engine (Thymeleaf, Freemarker, etc.)
    }

    @Override
    public String renderTemplate(EmailTemplate template, Object model) {
        // TODO: render template using provided model
        return template.getBodyTemplate();
    }
}
