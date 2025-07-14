package com.my.gyp_portfolio_shoppingmall.exception;

public abstract class PaymentException extends RuntimeException {
    // 예외 메시지 생성
    protected PaymentException(String message) {
        super(message);
    }
    
    // 결제 요청 관련 예외
    public static class PaymentRequestException extends RuntimeException {
        public PaymentRequestException() {
            super("결제 요청 정보가 없습니다.");
        }

        public PaymentRequestException(String message) {
            super(message);
        }
    }

    // 결제 금액 관련 예외
    public static class InvalidAmountException extends RuntimeException {
        public InvalidAmountException() {
            super("유효하지 않은 결제 금액입니다.");
        }
    }

    // 구매자 정보 관련 예외
    public static class InvalidBuyerInfoException extends RuntimeException {
        public InvalidBuyerInfoException(String field) {
            super(String.format("구매자 %s 정보가 없습니다.", field));
        }
    }

    // 상품 정보 관련 예외
    public static class InvalidProductInfoException extends RuntimeException {
        public InvalidProductInfoException() {
            super("상품 정보가 올바르지 않습니다.");
        }
    }

    // 결제 검증 관련 예외
    public static class PaymentVerificationException extends RuntimeException {
        public PaymentVerificationException() {
            super("결제 검증에 실패했습니다.");
        }

        public PaymentVerificationException(String status) {
            super(String.format("유효하지 않은 결제 상태입니다: %s", status));
        }
    }

    // 포트원 서버 관련 예외
    public static class ServerException extends RuntimeException {
        public ServerException() {
            super("결제 서버와의 통신 중 오류가 발생했습니다.");
        }
    }

    // 포트원 네트워크 관련 예외
    public static class NetworkException extends RuntimeException {
        public NetworkException() {
            super("결제 서버와의 연결이 원활하지 않습니다.");
        }
    }

    // 결제 이력 조회 관련 예외
    public static class PaymentHistoryNotFoundException extends RuntimeException {
        public PaymentHistoryNotFoundException(String message) {
            super(message);
        }
    }

    // 결제 이력 조회 관련 예외
    public static class PaymentHistoryQueryException extends RuntimeException {
        public PaymentHistoryQueryException(String message, Throwable cause) {
            super(message, cause);
        }
    }

    // 결제 이력 조회 관련 예외
    public static class PaymentHistoryException extends RuntimeException {
        public PaymentHistoryException(String message) {
            super(message);
        }
    }
}
