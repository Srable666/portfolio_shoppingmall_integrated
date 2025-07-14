package com.my.gyp_portfolio_shoppingmall.security.jwt;

public class JwtConstants {    
    // 토큰 접두사
    public static final String TOKEN_PREFIX = "Bearer ";
    
    // 헤더 이름
    public static final String ACCESS_TOKEN_HEADER = "X-Auth-Token";

    // 리프레시 토큰 쿠키 이름
    public static final String REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
} 