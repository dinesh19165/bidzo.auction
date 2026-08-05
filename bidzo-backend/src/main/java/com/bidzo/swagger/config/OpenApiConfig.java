package com.bidzo.swagger.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;

import java.util.List;

@Configuration
public class OpenApiConfig {

    private final SwaggerProperties properties;

    public OpenApiConfig(SwaggerProperties properties) {
        this.properties = properties;
    }

    @Bean
    public OpenAPI openAPI() {
        Info info = new Info()
                .title(properties.getTitle())
                .description(properties.getDescription())
                .version(properties.getVersion())
                .contact(new Contact()
                        .name(properties.getContactName())
                        .email(properties.getContactEmail())
                        .url(properties.getContactUrl()))
                .license(new License()
                        .name(properties.getLicenseName())
                        .url(properties.getLicenseUrl()));

        Server server = new Server().url(properties.getServerUrl()).description("Primary server");

        Components components = new Components();
        // Configure JWT Bearer security scheme placeholder
        components.addSecuritySchemes(properties.getJwtSchemeName(),
                new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
        );

        OpenAPI openAPI = new OpenAPI()
                .info(info)
                .servers(List.of(server))
                .components(components);

        // Attach a global security requirement using the configured scheme
        openAPI.addSecurityItem(new SecurityRequirement().addList(properties.getJwtSchemeName()));

        // Configure tags placeholder
        if (properties.getTags() != null) {
            for (String t : properties.getTags()) {
                openAPI.addTagsItem(new Tag().name(t).description("Tag: " + t));
            }
        }

        // TODO: Configure global API responses and examples

        return openAPI;
    }
}
