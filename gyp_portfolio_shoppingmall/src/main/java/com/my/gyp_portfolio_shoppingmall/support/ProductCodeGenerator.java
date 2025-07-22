package com.my.gyp_portfolio_shoppingmall.support;

import java.util.UUID;

public class ProductCodeGenerator {
    public static String generateCode() {
        String code;

        // 8자리 이상의 코드 생성
        do {
            UUID uuid = UUID.randomUUID();
            code = encodeBase62(uuid.getMostSignificantBits());
        } while (code.length() < 8);
        
        // 8자리 코드 반환
        return code.substring(0, 8);
    }
    
    private static String encodeBase62(long value) {
        final String CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        StringBuilder sb = new StringBuilder();
        
        // 음수 처리
        boolean negative = value < 0;
        if (negative) {
            value = -value;
        }

        // 62진법으로 변환
        do {
            sb.append(CHARS.charAt((int) (value % 62)));
            value /= 62;
        } while (value > 0);

        // 역순으로 변환
        return sb.reverse().toString();
    }
}
