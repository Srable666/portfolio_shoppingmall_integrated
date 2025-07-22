package com.my.gyp_portfolio_shoppingmall.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.core.io.Resource;

import com.my.gyp_portfolio_shoppingmall.enums.ProductEnums.ProductInventoryStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

public class ProductDto {
    // 카테고리 
    @Getter @Setter
    public static class CategoryDTO {
        private Integer categoryId;
        private String code;
        private String name;
        private Integer parentCategoryId;
    }
    
    // 상품
    @Getter @Setter
    public static class ProductDTO {
        private Integer productId;
        private String name;
        private String code;
        private BigDecimal basePrice;
        private BigDecimal discountRate;
        private BigDecimal finalPrice;
        private Integer categoryId;
        private String categoryName;
        private String imageUrl;
        private String description;
        private Integer viewCount;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private Integer isActive;
        private Integer isDeleted;
    }

    // 상품 옵션
    @Getter @Setter
    public static class ProductItemDTO {
        private Integer productItemId;
        private Integer productId;
        private String code;
        private Integer stockQuantity;
        private Integer reservedQuantity;
        private String size;
        private String color;
        private Integer salesCount;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private Integer isActive;
        private Integer isDeleted;
        private Integer version;
    }

    // 상품 재고
    @Getter @Setter
    public static class ProductInventoryDTO {
        private Integer productInventoryId;
        private Integer productItemId;
        private String barcode;
        private ProductInventoryStatus status;
        private Integer orderProductId;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    // 재고 변동 이력
    @Getter @Setter
    public static class InventoryHistoryDTO {
        private Integer inventoryHistoryId;
        private Integer productInventoryId;
        private Integer orderProductId;
        private ProductInventoryStatus statusFrom;
        private ProductInventoryStatus statusTo;
        private String note;
        private LocalDateTime createdAt;
    }

    // 대량 입고
    @Getter @Setter
    public static class BulkProductInventoryDTO {
        private Integer productItemId;
        private List<String> barcodes;
    }

    // 상품 검색
    @Getter @Setter
    public static class ProductSearchDTO {
        private String keyword;
        private Integer categoryId;
        private Integer isActive;
        
    }

    // 이미지 리소스 응답
    @Getter
    @AllArgsConstructor
    public static class ImageResourceResponse {
        private Resource resource;
        private String contentType;
    }
}
