package com.my.gyp_portfolio_shoppingmall.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;

import com.my.gyp_portfolio_shoppingmall.enums.OrderEnums.DeliveryStatus;
import com.my.gyp_portfolio_shoppingmall.enums.OrderEnums.DeliveryType;
import com.my.gyp_portfolio_shoppingmall.enums.OrderEnums.OrderProductStatus;
import com.my.gyp_portfolio_shoppingmall.enums.OrderEnums.PaymentMethod;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

public class OrderDto {
    // 주문 접수
    @Getter @Setter
    public static class NewOrderDTO {
        private Integer deliveryFee;
        private String recipientName;
        private String recipientPhone;
        private String recipientPostcode;
        private String recipientAddress;
        private String deliveryRequest;
        private PaymentMethod paymentMethod;
        private List<OrderProductDTO> orderProductDTOList;
    }

    // order 기본 정보
    @Getter @Setter
    public static class OrderDTO {
        private Integer orderId;
        private String merchantUid;
        private Integer userId;
        private BigDecimal deliveryFee;
        private BigDecimal originalTotalPrice;
        private BigDecimal currentTotalPrice;
        private String recipientName;
        private String recipientPhone;  
        private String recipientPostcode;
        private String recipientAddress;
        private String deliveryRequest;
        private PaymentMethod paymentMethod;
        private LocalDateTime createdAt;
    }

    // orderProduct 기본 정보
    @Getter @Setter
    public static class OrderProductDTO {
        private Integer orderProductId;
        private Integer orderId;
        private String merchantUid;
        private Integer productItemId;
        private Integer originalQuantity;
        private Integer changedQuantity;
        private Integer requestQuantity;
        private BigDecimal price;
        private BigDecimal discountRate;
        private BigDecimal finalPrice;
        private String productName;
        private String size;
        private String color;
        private OrderProductStatus status;
        private String requestReason;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private Integer version;
        private List<OrderProductHistoryDTO> orderProductHistoryDTOList;
    }

    // deliveryHistory 기본 정보
    @Getter @Setter
    public static class DeliveryHistoryDTO {
        private Integer deliveryHistoryId;
        private Integer orderProductId;
        private DeliveryType deliveryType;
        private String invoiceNumber;
        private String deliveryCompany;
        private DeliveryStatus deliveryStatus;
        private LocalDateTime deliveryStartDate;
        private LocalDateTime deliveryCompleteDate;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    // orderProductHistory 기본 정보
    @Getter @Setter
    public static class OrderProductHistoryDTO {
        private Integer orderProductHistoryId;
        private Integer orderProductId;
        private Integer requestQuantityRecord;
        private OrderProductStatus statusFrom;
        private OrderProductStatus statusTo;
        private String reason;
        private LocalDateTime createdAt;
    }

    // 배송 정보
    @Getter @Setter
    public static class DeliveryInfoDTO {
        private Integer orderProductId;
        private Integer version;
        private String invoiceNumber;
        private String deliveryCompany;
        private LocalDateTime deliveryStartDate;
        private LocalDateTime deliveryCompleteDate;
        private List<String> barcodes;
    }

    // 회원 본인 주문 내역 조회
    @Getter @Setter
    @ToString
    public static class UserOrderHistoryDTO {
        private Integer orderId;
        private String merchantUid;
        private Integer userId;
        private String email;
        private BigDecimal deliveryFee;
        private BigDecimal originalTotalPrice;
        private BigDecimal currentTotalPrice;
        private String recipientName;
        private String recipientPhone;
        private String recipientPostcode;
        private String recipientAddress;
        private String deliveryRequest;
        private PaymentMethod paymentMethod;
        private LocalDateTime createdAt;
        private List<OrderProductDTO> orderProductDTOList;
    }

    // 주문 상품 관련 정보 업데이트
    @Getter @Setter
    public static class UpdateOrderProductDTO {
        private List<String> barcodeList;
        private Integer orderProductId;
        private String invoiceNumber;
        private String shippingCompany;
        private LocalDateTime deliveryStartDate;
        private LocalDateTime deliveryCompleteDate;
    }

    // 관리자용 전체 주문 목록 조회
    @Getter @Setter
    public static class OrderListForAdminDTO {
        private Integer orderId;
        private String merchantUid;
        private String userEmail;
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        private LocalDateTime startDate;
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        private LocalDateTime endDate;
        private int page;
        private int size;
        private String sortField;
        private String sortOrder;
    }
}
