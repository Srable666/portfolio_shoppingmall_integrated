package com.my.gyp_portfolio_shoppingmall.support;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.my.gyp_portfolio_shoppingmall.security.jwt.TokenPair;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class LoginHistorySupport {

    public String determineDeviceType(String userAgent) {
        if (!StringUtils.hasText(userAgent)) {
            return "UNKNOWN";
        }
        userAgent = userAgent.toLowerCase();
        if (userAgent.contains("mobile")) {
            return "MOBILE";
        } else if (userAgent.contains("tablet")) {
            return "TABLET";
        } else {
            return "DESKTOP";
        }
    }

    @Getter
    public static class LoginResult {
        private final boolean success;
        private final String message;
        private final TokenPair tokenPair;

        private LoginResult(boolean success, String message, TokenPair tokenPair) {
            this.success = success;
            this.message = message;
            this.tokenPair = tokenPair;
        }
        
        public static LoginResult success(TokenPair tokenPair) {
            return new LoginResult(true, "login successful", tokenPair);
        }

        public static LoginResult failure(String message) {
            return new LoginResult(false, message, null);
        }
    }
}