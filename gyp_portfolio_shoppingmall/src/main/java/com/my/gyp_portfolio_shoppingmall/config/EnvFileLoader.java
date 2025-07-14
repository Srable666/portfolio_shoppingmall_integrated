package com.my.gyp_portfolio_shoppingmall.config;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.PropertiesPropertySource;
import org.springframework.stereotype.Component;

@Component
public class EnvFileLoader implements EnvironmentPostProcessor{
    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        try {
            Properties props = new Properties();
            props.load(new FileInputStream(".env"));
            
            PropertiesPropertySource propertySource = 
                new PropertiesPropertySource("envVars", props);
            
            environment.getPropertySources().addFirst(propertySource);
            
        } catch (IOException e) {
            throw new RuntimeException("Failed to load .env file", e);
        }
    }
}