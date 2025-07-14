package com.my.gyp_portfolio_shoppingmall.support;

import java.util.UUID;

public class ProductCodeGenerator {
    public static String generateCode() {
        UUID uuid = UUID.randomUUID();
        return encodeBase62(uuid.getMostSignificantBits()).substring(0, 8);
    }
    
    private static String encodeBase62(long value) {
        final String CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        StringBuilder sb = new StringBuilder();
        do {
            sb.append(CHARS.charAt((int) (value % 62)));
            value /= 62;
        } while (value > 0);
        return sb.reverse().toString();
    }
}
