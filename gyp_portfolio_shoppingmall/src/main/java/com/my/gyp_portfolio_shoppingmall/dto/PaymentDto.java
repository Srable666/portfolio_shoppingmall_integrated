package com.my.gyp_portfolio_shoppingmall.dto;

import java.time.LocalDateTime;

import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.my.gyp_portfolio_shoppingmall.enums.OrderEnums.PaymentMethod;
import com.my.gyp_portfolio_shoppingmall.enums.PaymentEnums.PaymentStatus;

import lombok.Getter;
import lombok.Setter;

public class PaymentDto {

    // 결제 정보 DTO
    @Getter @Setter
    public static class PaymentInfoDTO {
        private String storeId;
        private String channelKey;
        private String orderCode;
        private long amount;
        private String productName;
        private BuyerInfoDTO buyer;
    }

    // 구매자 정보 DTO
    @Getter @Setter
    public static class BuyerInfoDTO {
        private String name;
        private String email;
        private String tel;
    }

    // 결제 검증 응답 DTO(미완성)
    @Getter @Setter
    public static class PaymentVerificationResponseDTO {
        private String paymentId;
        private String status;
    }

    // 포트원 응답 DTO
    @Getter @Setter
    public static class PaymentDataDTO {
        private String imp_uid;
        private String merchant_uid;
        private String pg_tid;
        private String name;
        private String status;
        private String pay_method;
        private String pg_provider;
        private String emb_pg_provider;
        private Long paid_amount;
        private String buyer_name;
        private String buyer_email;
        private String buyer_tel;
        private String buyer_addr;
        private String buyer_postcode;
        private Long paid_at;
        private String custom_data;
        private String receipt_url;
        private String error_code;
        private String error_msg;
    }

    // 결제 취소 요청 DTO
    @Getter @Setter
    public static class CancelRequestDTO {
        private String reason;
    }
    
    // 결제 준비 요청 DTO
    @Getter @Setter
    public static class PaymentPrepareRequestDTO {
        private String orderCode;
        private long amount;
        private String productName;
        private String buyerName;
        private String buyerEmail;
        private String buyerTel;
    }

    // 포트원 웹훅 DTO
    @Getter @Setter
    public static class PortOneWebhookDTO {
        @JsonProperty("imp_uid")
        private String impUid;          // 포트원 거래 고유번호
        
        @JsonProperty("merchant_uid")
        private String merchantUid;     // 가맹점 주문번호
        
        private String status;          // 결제 상태 (ready, paid, failed, cancelled)
        
        @JsonProperty("payment_status")
        private String paymentStatus;   // 결제 상세 상태
        
        private Long amount;            // 결제 금액
        
        @JsonProperty("cancel_amount")
        private Long cancelAmount;      // 취소 금액
        
        @JsonProperty("paid_at")
        private Long paidAt;           // 결제 시각 (timestamp)
        
        @JsonProperty("failed_at")
        private Long failedAt;         // 실패 시각 (timestamp)
        
        @JsonProperty("cancelled_at")
        private Long cancelledAt;      // 취소 시각 (timestamp)
    }

    // 결제 이력 검색 DTO
    @Getter @Setter
    public static class PaymentHistorySearchDTO {
        private Integer paymentHistoryId;
        private String impUid;
        private String merchantUid;
        private String buyerEmail;
        private Integer orderId;
        private PaymentStatus status;
        private PaymentMethod payMethod;
        private long paidAmount;
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        private LocalDateTime startDate;
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        private LocalDateTime endDate;
    }
    
    // V1 API 응답 래퍼
    @Getter @Setter
    public static class IamportV1ResponseDTO<T> {
        private int code;           // 0: 성공, 그 외: 실패
        private String message;     // 응답 메시지
        private T response;         // 실제 데이터
    }
}
