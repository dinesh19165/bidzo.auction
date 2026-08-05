package com.bidzo.monitoring.logging;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ResponseLoggingFilter implements Filter {
    private static final Logger log = LoggerFactory.getLogger(ResponseLoggingFilter.class);

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        // TODO: log outgoing responses (status, headers) - ensure no sensitive data
        chain.doFilter(request, response);
    }
}
