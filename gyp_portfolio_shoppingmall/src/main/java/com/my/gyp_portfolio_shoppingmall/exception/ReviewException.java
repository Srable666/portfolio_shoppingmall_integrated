package com.my.gyp_portfolio_shoppingmall.exception;

public class ReviewException {
    
    // 리뷰 없음
    public static class ReviewNotFoundException extends RuntimeException {
        public ReviewNotFoundException() {
            super("존재하지 않는 리뷰입니다.");
        }
    }

    // 리뷰 수정 권한 없음
    public static class ReviewNotAuthorizedException extends RuntimeException {
        public ReviewNotAuthorizedException() {
            super("해당 리뷰에 대한 권한이 없습니다.");
        }
    }

    // 주문 상품 정보 유효성 검증 실패
    public static class InvalidOrderProductException extends RuntimeException {
        public InvalidOrderProductException() {
            super("주문 상품 정보가 유효하지 않습니다.");
        }
    }

    // 이미 작성된 리뷰가 있음
    public static class ReviewAlreadyExistsException extends RuntimeException {
        public ReviewAlreadyExistsException() {
            super("이미 작성된 리뷰가 있습니다.");
        }
    }
}
