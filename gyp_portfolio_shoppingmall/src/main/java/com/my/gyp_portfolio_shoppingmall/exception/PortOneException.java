package com.my.gyp_portfolio_shoppingmall.exception;

public class PortOneException {
    
    // 토큰 획득 실패
    public static class TokenAcquisitionException extends RuntimeException {
        public TokenAcquisitionException() {
            super("포트원 API 인증 토큰 발급에 실패했습니다.");
        }
        
        public TokenAcquisitionException(String message) {
            super(message);
        }
    }
    
    // 결제 요청 실패
    public static class PaymentRequestException extends RuntimeException {
        public PaymentRequestException() {
            super("결제 요청 처리에 실패했습니다.");
        }
        
        public PaymentRequestException(String message) {
            super(message);
        }
    }
    
    // 결제 검증 실패
    public static class PaymentVerificationException extends RuntimeException {
        public PaymentVerificationException() {
            super("결제 검증에 실패했습니다.");
        }
        
        public PaymentVerificationException(String message) {
            super(message);
        }
    }
    
    // 결제 취소 실패
    public static class PaymentCancellationException extends RuntimeException {
        public PaymentCancellationException() {
            super("결제 취소에 실패했습니다.");
        }
        
        public PaymentCancellationException(String message) {
            super(message);
        }
    }
    
    // 네트워크 오류
    public static class NetworkException extends RuntimeException {
        public NetworkException() {
            super("포트원 API 연결 중 네트워크 오류가 발생했습니다.");
        }
        
        public NetworkException(String message) {
            super(message);
        }
    }
    
    // API 서버 오류
    public static class ServerException extends RuntimeException {
        public ServerException() {
            super("포트원 API 서버에서 오류가 발생했습니다.");
        }
        
        public ServerException(String message) {
            super(message);
        }
    }
    
    // 응답 파싱 오류
    public static class ResponseParsingException extends RuntimeException {
        public ResponseParsingException() {
            super("포트원 API 응답 파싱 중 오류가 발생했습니다.");
        }
        
        public ResponseParsingException(String message) {
            super(message);
        }
    }
}