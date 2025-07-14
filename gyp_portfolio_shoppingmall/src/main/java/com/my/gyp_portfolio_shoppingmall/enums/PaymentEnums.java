package com.my.gyp_portfolio_shoppingmall.enums;

public class PaymentEnums {
    public enum PaymentStatus {
        READY,          // 결제 준비
        PAID,           // 결제 완료
        FAILED,         // 결제 실패
        CANCELLED,      // 결제 취소
        PARTIAL_CANCELLED // 부분 취소
    }    
}
