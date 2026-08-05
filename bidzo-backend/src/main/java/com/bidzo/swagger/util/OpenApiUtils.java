package com.bidzo.swagger.util;

import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;

public final class OpenApiUtils {
    private OpenApiUtils() {}

    public static Contact buildContact(String name, String email, String url) {
        Contact c = new Contact();
        c.setName(name);
        c.setEmail(email);
        c.setUrl(url);
        return c;
    }

    public static License buildLicense(String name, String url) {
        License l = new License();
        l.setName(name);
        l.setUrl(url);
        return l;
    }

    // TODO: add helpers to build servers, security requirements, and examples
}
