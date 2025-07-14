package com.my.gyp_portfolio_shoppingmall.exception;

public class ProductException {
    
    // 부모 카테고리 없음
    public static class ParentCategoryNotFoundException extends RuntimeException {
        public ParentCategoryNotFoundException() {
            super("존재하지 않는 부모 카테고리입니다.");
        }
    }

    // 카테고리 없음
    public static class CategoryNotFoundException extends RuntimeException {
        public CategoryNotFoundException() {
            super("존재하지 않는 카테고리입니다.");
        }
    }

    // 상품 없음
    public static class ProductNotFoundException extends RuntimeException {
        public ProductNotFoundException() {
            super("존재하지 않는 상품입니다.");
        }
    }

    // 상품 품목 없음
    public static class ProductItemNotFoundException extends RuntimeException {
        public ProductItemNotFoundException() {
            super("존재하지 않는 상품 품목입니다.");
        }
    }

    // 상품 재고 없음
    public static class ProductInventoryNotFoundException extends RuntimeException {
        public ProductInventoryNotFoundException() {
            super("존재하지 않는 상품 재고입니다.");
        }
    }

    // 상품 품목 재고 부족
    public static class ProductItemQuantityException extends RuntimeException {
        public ProductItemQuantityException() {
            super("상품 품목 재고가 부족합니다.");
        }
    }

    // 구매 불가 상품
    public static class ProductItemNotSaleException extends RuntimeException {
        public ProductItemNotSaleException() {
            super("구매 불가능한 상품입니다.");
        }
    }

    // 중복 바코드
    public static class DuplicateBarcodeException extends RuntimeException {
        public DuplicateBarcodeException() {
            super("이미 존재하는 바코드입니다.");
        }
    }

    // 출고 요청 불가
    public static class ProductInventoryRequestException extends RuntimeException {
        public ProductInventoryRequestException() {
            super("출고 요청 불가능한 상품입니다.");
        }
    }

    // 이미지 삭제 실패
    public static class ImageDeleteException extends RuntimeException {
        public ImageDeleteException() {
            super("이미지 파일 삭제에 실패했습니다.");
        }
    }
}
