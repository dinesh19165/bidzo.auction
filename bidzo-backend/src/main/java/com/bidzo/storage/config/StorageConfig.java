package com.bidzo.storage.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(StorageProperties.class)
public class StorageConfig {

    @Bean
    public StorageProperties storageProperties() {
        return new StorageProperties();
    }
}
package com.bidzo.storage.config;

import org.springframework.context.annotation.Configuration;

@Configuration
public class StorageConfig {
    // Storage-related beans and configuration can be added here.
}
