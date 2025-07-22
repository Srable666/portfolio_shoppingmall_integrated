package com.my.gyp_portfolio_shoppingmall.support;

public class PaymentLogSupport {
    private static final String MASK_PATTERN = "****";
    
    public static String maskPaymentId(String id) {
        if (id == null || id.length() < 8) return MASK_PATTERN;
        return id.substring(0, 4) + MASK_PATTERN + id.substring(id.length() - 4);
    }
    
    public static String maskErrorMessage(String message) {
        if (message == null) return "";
        // 카드번호, 계좌번호, 주민번호 등 민감정보 패턴 마스킹
        return message.replaceAll("\\d{12,16}", MASK_PATTERN)  // 카드번호
                     .replaceAll("\\d{10,14}", MASK_PATTERN)   // 계좌번호
                     .replaceAll("\\d{6}-?\\d{7}", MASK_PATTERN); // 주민번호
    }    
}
