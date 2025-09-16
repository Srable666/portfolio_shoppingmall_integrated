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
        KAKAOPAY,
        NAVERPAY,
        TOSSPAY,
        POINT,
        CARD
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
