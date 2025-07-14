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
        CANCELLED,
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
        CREDIT_CARD,
        BANK_TRANSFER,
        VIRTUAL_ACCOUNT,
        MOBILE_PAYMENT,
        TOSS_PAY,
        KAKAO_PAY,
        NAVER_PAY
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
        CANCELLED,
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
