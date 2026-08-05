package com.bidzo.email.dto;

public class EmailTemplate {
    private String name;
    private String subjectTemplate;
    private String bodyTemplate;

    public EmailTemplate() {}

    public EmailTemplate(String name, String subjectTemplate, String bodyTemplate) {
        this.name = name;
        this.subjectTemplate = subjectTemplate;
        this.bodyTemplate = bodyTemplate;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSubjectTemplate() {
        return subjectTemplate;
    }

    public void setSubjectTemplate(String subjectTemplate) {
        this.subjectTemplate = subjectTemplate;
    }

    public String getBodyTemplate() {
        return bodyTemplate;
    }

    public void setBodyTemplate(String bodyTemplate) {
        this.bodyTemplate = bodyTemplate;
    }
}
