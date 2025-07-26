package com.my.gyp_portfolio_shoppingmall.enums;

public class OrderEnums {
    public enum OrderProductStatus {
        PAYMENT_PENDING,
        PAYMENT_COMPLETED,
        PREPARING,
        DELIVERING,
        DELIVERED,
        DELIVERY_CONFIRMED,
        CANCEL_REQUESTED,
        CANCELED,
        RETURN_REQUESTED,
        RETURNING,
        RETURNED,
        EXCHANGE_REQUESTED,
        EXCHANGE_RETURNING,
        EXCHANGE_PREPARING,
        EXCHANGE_DELIVERING,
        EXCHANGE_DELIVERED
    }

    public enum PaymentMethod {
        // 포트원 API V1 표준 코드
        card,           // 신용카드 (기존 CREDIT_CARD)
        trans,          // 계좌이체 (기존 BANK_TRANSFER)  
        vbank,          // 가상계좌 (기존 VIRTUAL_ACCOUNT)
        phone,          // 휴대폰 소액결제 (기존 MOBILE_PAYMENT)
        kakaopay,       // 카카오페이 (기존 KAKAO_PAY)
        naverpay,       // 네이버페이 (기존 NAVER_PAY)
        tosspay         // 토스페이 (기존 TOSS_PAY)
    }

    public enum DeliveryType {
        ORDER_OUT,
        RETURN_IN,
        EXCHANGE_IN,
        EXCHANGE_OUT
    }

    public enum DeliveryStatus {
        PREPARING,
        DELIVERING,
        DELIVERED,
        CONFIRMED,
        CANCELED,
        RETURN,
        EXCHANGE
    }

    public enum SortBy {
        ORDER_ID,
        USER_ID,
        STATUS,
        CREATED_AT,
        DELIVERY_START_DATE,
        DELIVERY_COMPLETE_DATE
    }

    public enum SortDirection {
        ASC,
        DESC
    }
}
