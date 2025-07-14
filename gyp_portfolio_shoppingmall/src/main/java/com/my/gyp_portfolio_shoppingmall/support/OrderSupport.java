package com.my.gyp_portfolio_shoppingmall.support;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

public class OrderSupport {
    private static final String CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String INVOICE_NUMBER_PATTERN = "^[0-9]{13}$";
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyMMdd");
    
    public static boolean isValidInvoiceNumber(String invoiceNumber) {
        return invoiceNumber != null && invoiceNumber.matches(INVOICE_NUMBER_PATTERN);
    }

    public static String generateMerchantUid() {
        LocalDateTime now = LocalDateTime.now();
        String datePart = now.format(DATE_FORMAT);
        
        StringBuilder randomPart = new StringBuilder();
        Random random = new Random();
        for (int i = 0; i < 4; i++) {
            randomPart.append(CHARS.charAt(random.nextInt(CHARS.length())));
        }
        
        return datePart + randomPart.toString();
    }
} 