package com.my.gyp_portfolio_shoppingmall.security.jwt;

import java.util.Date;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class JwtSupport {

    @Value("${jwt.access-token.expiration}")
    private long ACCESS_TOKEN_EXPIRATION;
    @Value("${jwt.refresh-token.expiration}")
    private long REFRESH_TOKEN_EXPIRATION;
    @Value("${jwt.access-token.secret}")
    private String ACCESS_TOKEN_SECRET;
    @Value("${jwt.refresh-token.secret}")
    private String REFRESH_TOKEN_SECRET;

    // Access Token 생성
    public String generateAccessToken(String userEmail, boolean isAdmin) {
        return Jwts.builder()
                .setSubject(userEmail)
                .claim("role", isAdmin ? "ROLE_ADMIN" : "ROLE_USER")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_EXPIRATION))
                .signWith(Keys.hmacShaKeyFor(ACCESS_TOKEN_SECRET.getBytes()))
                .compact();
    }

    // Refresh Token 생성
    public String generateRefreshToken(String userEmail) {
        return Jwts.builder()
                .setSubject(userEmail)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + REFRESH_TOKEN_EXPIRATION))
                .signWith(Keys.hmacShaKeyFor(REFRESH_TOKEN_SECRET.getBytes()))
                .compact();
    }

    // 토큰 추출(엑세스 토큰)
    public String extractAccessToken(String header) {
        // 헤더가 null이거나 토큰 프리픽스로 시작하지 않으면 null 반환
        if (header == null || !header.startsWith(JwtConstants.TOKEN_PREFIX)) {
            return null;
        }

        // 토큰 프리픽스 제거 후 토큰 반환
        return header.substring(JwtConstants.TOKEN_PREFIX.length());
    }

    // 토큰 추출(리프레시 토큰)
    public String extractRefreshToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (JwtConstants.REFRESH_TOKEN_COOKIE_NAME.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    // Token 검증 및 사용자 이름 추출
    public String validateAndGetUsername(String token, boolean isAccessToken) {
        try {
            String secretKey = isAccessToken ? ACCESS_TOKEN_SECRET : REFRESH_TOKEN_SECRET;
            
            // JWT 파서 빌더 생성   
            JwtParser parser = Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor(secretKey.getBytes()))
                    .build();
            
            // 토큰 검증 및 본문 추출
            return parser.parseClaimsJws(token)
                    .getBody()
                    .getSubject();
        } catch (ExpiredJwtException e) {
            log.error("Token expired");
            throw e;
        } catch (JwtException e) {
            log.error("Token validation failed: {}", e.getMessage());
            throw e;
        }
    }

    // 토큰 권한 추출
    public String getRole(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(ACCESS_TOKEN_SECRET.getBytes()))
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("role", String.class);
    }

    // Token 만료 시간 반환
    public long getTokenRemainingTime(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(REFRESH_TOKEN_SECRET.getBytes()))
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getExpiration()
                .getTime()
                - System.currentTimeMillis();
    }

    // Token 만료 여부 확인
    public boolean isTokenExpired(String token, boolean isAccessToken) {
        try {
            String secretKey = isAccessToken ? ACCESS_TOKEN_SECRET : REFRESH_TOKEN_SECRET;
            
            // JWT 파서 빌더 생성
            JwtParser parser = Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor(secretKey.getBytes()))
                    .build();
            
            // 토큰 만료 시간 추출
            Date expiration = parser.parseClaimsJws(token)
                    .getBody()
                    .getExpiration();

            // 토큰 만료 여부 반환
            return expiration.before(new Date());
        } catch (Exception e) {
            return true;
        }
    }

    // 토큰 세트 갱신
    public TokenPair rotateTokens(String userEmail, boolean isAdmin) {
        // 새로운 토큰 생성
        String newAccessToken = generateAccessToken(userEmail, isAdmin);
        String newRefreshToken = generateRefreshToken(userEmail);
        
        // 새로운 토큰 세트 반환
        return new TokenPair(newAccessToken, newRefreshToken);
    }

    // 토큰 헤더 설정(엑세스 토큰)
    public void setTokenHeaders(HttpServletResponse response, TokenPair tokenPair) {
        response.setHeader(JwtConstants.ACCESS_TOKEN_HEADER,
                JwtConstants.TOKEN_PREFIX + tokenPair.getAccessToken());
        setRefreshTokenCookie(response, tokenPair.getRefreshToken());
    }

    // 토큰 쿠키 설정(리프레시 토큰)
    public void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        ResponseCookie cookie = ResponseCookie.from(JwtConstants.REFRESH_TOKEN_COOKIE_NAME, refreshToken)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge((int) REFRESH_TOKEN_EXPIRATION / 1000)
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

    }

    // 토큰 헤더 제거
    public void removeTokenHeaders(HttpServletResponse response) {
        response.setHeader(JwtConstants.ACCESS_TOKEN_HEADER, null);
        response.setHeader(JwtConstants.REFRESH_TOKEN_COOKIE_NAME, null);
    }
} 