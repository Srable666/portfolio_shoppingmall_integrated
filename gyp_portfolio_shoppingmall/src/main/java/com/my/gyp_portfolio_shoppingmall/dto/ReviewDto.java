package com.my.gyp_portfolio_shoppingmall.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

public class ReviewDto {
    // 리뷰 
    @Getter @Setter
    public static class ReviewDTO {
        private Integer reviewId;
        private Integer orderProductId;
        private Integer productItemId;
        private Integer userId;
        private String rating;
        private String comment;
        private String createdAt;
        private String updatedAt;
        private Integer isDeleted;
        private Integer version;
    }

    // 리뷰 조회(검색 조건 포함, 페이징 처리)
    @Getter @Setter
    public static class ReviewSearchDTO {
        private Integer reviewId;
        private Integer orderProductId;
        private String productCode;
        private Integer productItemId;
        private List<Integer> productItemIds;
        private String productName;
        private String productItemSize;
        private String productItemColor;
        private Integer userId;
        private String userEmail;
        private String userName;
        private String rating;
        private String comment;
        private String createdAt;
        private String updatedAt;
        private Integer isDeleted;
        private Integer offset;
        private Integer size;
    }
}
