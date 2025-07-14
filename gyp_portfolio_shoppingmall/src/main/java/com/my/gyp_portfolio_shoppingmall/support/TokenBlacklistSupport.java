package com.my.gyp_portfolio_shoppingmall.support;

import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class TokenBlacklistSupport {
    private final RedisTemplate<String, String> redisTemplate;
    
    // 리프레시 토큰을 블랙리스트에 추가
    public void addToBlacklist(String refreshToken, long expirationTime) {
        try {
            // 키 생성 및 현재 시간 저장
            String key = "blacklist:" + refreshToken;
            String value = String.valueOf(System.currentTimeMillis());  // 현재 시간 저장

            // 먼저 키 존재 여부 확인
            if (redisTemplate.hasKey(key)) {
                log.info("Token is already in blacklist: {}", key);
                return;
            }
            
            // 키가 없으면 추가
            Boolean result = redisTemplate.opsForValue()
                .setIfAbsent(key, value, expirationTime, TimeUnit.MILLISECONDS);
            
            // 저장 성공 여부 확인
            if (Boolean.TRUE.equals(result)) {
                log.info("Successfully added new token to blacklist");
            } else {
                log.warn("Unexpected failure adding token to blacklist");
            }
            
        } catch (Exception e) {
            log.error("Failed to add token to blacklist", e);
            throw e;
        }
    }
    
    // 리프레시 토큰이 블랙리스트에 있는지 확인
    public boolean isBlacklisted(String refreshToken) {
        String key = "blacklist:" + refreshToken;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }
} 