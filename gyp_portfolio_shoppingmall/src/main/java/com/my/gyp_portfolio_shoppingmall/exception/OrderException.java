package com.my.gyp_portfolio_shoppingmall.exception;

public class OrderException {
    // 주문 내역 존재 여부
    public static class OrderNotFoundException extends RuntimeException {
        public OrderNotFoundException() {
            super("주문 내역이 존재하지 않습니다.");
        }
    }

    // 주문 상품 존재 여부
    public static class OrderProductNotFoundException extends RuntimeException {
        public OrderProductNotFoundException() {
            super("주문 상품이 존재하지 않습니다.");
        }
    }

    // 주문 상품 취소/반품/교환 요청 불가능
    public static class OrderProductRequestException extends RuntimeException {
        public OrderProductRequestException() {
            super("불가능한 요청입니다.");
        }
    }

    // 주문 상품 재고 부족
    public static class OrderProductStockException extends RuntimeException {
        public OrderProductStockException() {
            super("재고가 부족합니다.");
        }
    }

    // 관리자용 주문 내역 조회 조건 비어있음
    public static class OrderListForAdminException extends RuntimeException {
        public OrderListForAdminException() {
            super("불가능한 주문 내역 조회 요청입니다.");
        }
    }

    // 구매 확정 가능 여부 체크
    public static class ConfirmationNotAllowedException extends RuntimeException {
        public ConfirmationNotAllowedException() {
            super("구매 확정 조건이 충족되지 않았습니다.");
        }
    }
} 