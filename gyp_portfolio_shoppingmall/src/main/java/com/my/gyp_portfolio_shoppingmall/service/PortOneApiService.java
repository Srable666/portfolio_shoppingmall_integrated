package com.my.gyp_portfolio_shoppingmall.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.my.gyp_portfolio_shoppingmall.exception.PortOneException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class PortOneApiService {

    @Value("${iamport.imp.code}")
    private String impCode;

    @Value("${iamport.api.key}")
    private String impKey;

    @Value("${iamport.api.secret}")
    private String impSecret;

    @Value("${iamport.api.base-url}")
    private String baseUrl;

    private final RestTemplate restTemplate;
    private String accessToken;
    private long tokenExpiryTime;

    public String getBaseUrl() {
        return baseUrl;
    }
    
    public String getImpCode() {
        return impCode;
    }
    
    public String getClientKey() {
        return impCode;
    }

    // 아임포트 V1 토큰 발급
    public String getAccessToken() {
        if (accessToken == null || System.currentTimeMillis() >= tokenExpiryTime) {
            obtainNewAccessToken();
        }
        return accessToken;
    }

    private void obtainNewAccessToken() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("imp_key", impKey);
        requestBody.put("imp_secret", impSecret);

        HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);
    
        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                baseUrl + "/users/getToken", 
                HttpMethod.POST,
                request, 
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );
    
            if (response.getStatusCode().is2xxSuccessful()) {
                Map<String, Object> responseBody = response.getBody();
                
                // null 체크 추가
                if (responseBody == null) {
                    throw new PortOneException.TokenAcquisitionException("응답 본문이 없습니다.");
                }
                
                @SuppressWarnings("unchecked")
                Map<String, Object> responseData = (Map<String, Object>) responseBody.get("response");
                
                if (responseData == null) {
                    throw new PortOneException.TokenAcquisitionException("응답 데이터가 없습니다.");
                }
                
                this.accessToken = (String) responseData.get("access_token");
                if (this.accessToken == null) {
                    throw new PortOneException.TokenAcquisitionException("액세스 토큰이 없습니다.");
                }
                
                this.tokenExpiryTime = System.currentTimeMillis() + (3600 * 1000);
                log.info("아임포트 V1 토큰 발급 성공");
            } else {
                throw new PortOneException.TokenAcquisitionException("토큰 발급 실패");
            }
        } catch (Exception e) {
            log.error("아임포트 V1 토큰 발급 실패", e);
            throw new PortOneException.TokenAcquisitionException("토큰 발급 실패: " + e.getMessage());
        }
    }

    // API 요청을 위한 인증 헤더 생성
    public HttpHeaders createAuthHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", getAccessToken()); // V1은 Bearer 없이 토큰만
        return headers;
    }
}