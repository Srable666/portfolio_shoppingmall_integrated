package com.my.gyp_portfolio_shoppingmall.security.jwt;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class TokenPair {
    private final String accessToken;
    private final String refreshToken;
} 