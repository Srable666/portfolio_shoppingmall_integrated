package com.my.gyp_portfolio_shoppingmall.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.NestedConfigurationProperty;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "portone.api")
public class PortOneProperties {
    private String apiSecret;
    
    @NestedConfigurationProperty
    private PgProperties pg;
    
    private String baseUrl;
    
    @Getter
    @Setter
    public static class PgProperties {
        private String storeId;
        private String secretKey;
        private String clientKey;
    }
}
