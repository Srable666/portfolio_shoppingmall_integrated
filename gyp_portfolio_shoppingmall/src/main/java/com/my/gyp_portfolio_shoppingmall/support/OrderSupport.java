package com.my.gyp_portfolio_shoppingmall.support;

public class OrderSupport {
    private static final String INVOICE_NUMBER_PATTERN = "^[0-9]{13}$";
    
    public static boolean isValidInvoiceNumber(String invoiceNumber) {
        return invoiceNumber != null && invoiceNumber.matches(INVOICE_NUMBER_PATTERN);
    }
} 