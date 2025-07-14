package com.my.gyp_portfolio_shoppingmall.service;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicReference;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import com.my.gyp_portfolio_shoppingmall.exception.PortOneException;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class PortOneApiService {

    @Value("${portone.api.api-secret}")
    private String apiSecret;

    @Value("${portone.api.pg.store-id}")
    private String storeId;

    @Value("${portone.api.pg.client-key}")
    private String clientKey;

    @Value("${portone.api.pg.secret-key}")
    private String secretKey;

    @Value("${portone.api.base-url}")
    private String baseUrl;

    private static final String TOKEN_PATH = "/login/api-key";
    private final RestTemplate restTemplate;
    private String accessToken;
    private long tokenExpiryTime;

    // 생성자
    public PortOneApiService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String getBaseUrl() {
        return baseUrl;
    }
    
    public String getStoreId() {
        return storeId;
    }
    
    public String getClientKey() {
        return clientKey;
    }

    // 토큰 정보를 저장하는 클래스
    private static class TokenHolder {
        final String token;
        final long expiryTime;
        
        TokenHolder(String token, long expiryTime) {
            this.token = token;
            this.expiryTime = expiryTime;
        }
    }

    // 토큰 정보를 저장하는 AtomicReference
    private final AtomicReference<TokenHolder> tokenReference = new AtomicReference<>();
    
    // 포트원 API 액세스 토큰 조회(AtomicReference 사용)
    public String getAccessToken() {
        TokenHolder holder = tokenReference.get();
        long currentTime = System.currentTimeMillis();
        
        if (holder == null || currentTime >= holder.expiryTime) {
            synchronized (this) {
                holder = tokenReference.get();
                if (holder == null || currentTime >= holder.expiryTime) {
                    log.info("포트원 API 토큰 갱신 시작");
                    obtainNewAccessToken();
                    log.info("포트원 API 토큰 갱신 완료, 유효기간: {}", new Date(tokenExpiryTime));
                    tokenReference.set(new TokenHolder(accessToken, tokenExpiryTime));
                    return accessToken;
                }
            }
        } else if (currentTime >= holder.expiryTime - 300000L) {
            // 만료 5분 전 백그라운드 갱신
            final TokenHolder currentHolder = holder;
            CompletableFuture.runAsync(() -> {
                synchronized (this) {
                    if (tokenReference.get() == currentHolder &&
                        System.currentTimeMillis() >= currentHolder.expiryTime - 300000L &&
                        System.currentTimeMillis() < currentHolder.expiryTime) {
                        
                        obtainNewAccessToken();
                        tokenReference.set(new TokenHolder(accessToken, tokenExpiryTime));
                    }
                }
            });
        }
        
        return holder.token;
    }

    // 응답 데이터를 위한 클래스 정의
    private static class TokenResponse {
        private Map<String, Object> response;
        
        public Map<String, Object> getResponse() {
            return response;
        }
        
        // 경고 밑줄이 있지만 JSON 파서가 응답 데이터를 매핑할 때 자동 적용되므로 무시 가능
        public void setResponse(Map<String, Object> response) {
            this.response = response;
        }
    }

    // 포트원 API 액세스 토큰 신규 발급
    private void obtainNewAccessToken() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("api_key", apiSecret);

        HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<TokenResponse> response = restTemplate.postForEntity(
                baseUrl + TOKEN_PATH, 
                request, 
                TokenResponse.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                TokenResponse tokenResponse = response.getBody();
                if (tokenResponse != null) {
                    Map<String, Object> responseData = tokenResponse.getResponse();                
                
                    // 응답 데이터가 없는 경우
                    if (responseData == null) {
                        throw new PortOneException.ResponseParsingException("응답 데이터가 없습니다.");
                    }

                    // 엑세스 토큰이 없는 경우
                    this.accessToken = (String) responseData.get("access_token");
                    if (this.accessToken == null) {
                        throw new PortOneException.TokenAcquisitionException("엑세스 토큰 획득에 실패했습니다.");
                    }

                    // 만료 시간 설정(토큰의 만료 시간에서 1분을 뺌)
                    long expiredAt = ((Number) responseData.get("expired_at")).longValue();
                    this.tokenExpiryTime = (expiredAt * 1000L) - 60000L;
                } else {
                    throw new PortOneException.ResponseParsingException("응답 본문이 없습니다.");
                }
            } else {
                throw new PortOneException.TokenAcquisitionException(
                    "응답 코드: " + response.getStatusCodeValue() + 
                    ", 응답 본문: " + response.getBody());
            }
        } catch (HttpClientErrorException e) {
            log.error("클라이언트 오류 발생으로 포트원 API 토큰 획득 실패", e);
            throw new PortOneException.NetworkException("클라이언트 오류: " + e.getMessage());
        } catch (HttpServerErrorException e) {
            log.error("서버 오류 발생으로 포트원 API 토큰 획득 실패", e);
            throw new PortOneException.ServerException("서버 오류: " + e.getMessage());
        } catch (ResourceAccessException e) {
            log.error("네트워크 오류 발생으로 포트원 API 토큰 획득 실패", e);
            throw new PortOneException.NetworkException("네트워크 오류: " + e.getMessage());
        } catch (Exception e) {
            log.error("포트원 API 토큰 획득 중 알 수 없는 오류가 발생했습니다.", e);
            throw new PortOneException.TokenAcquisitionException("토큰 획득 중 오류: " + e.getMessage());
        }
    }

    // API 요청을 위한 인증 헤더 생성
    public HttpHeaders createAuthHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + getAccessToken());
        return headers;
    }
}