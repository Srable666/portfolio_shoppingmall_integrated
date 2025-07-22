package com.my.gyp_portfolio_shoppingmall.dto;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;

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
    public class PortOneResponseDTO<T> {
        private int code;
        private String message;
        private T response;  // 제네릭 타입 T를 사용
    }

    // 포트원 응답 DTO
    @Getter @Setter
    public static class PaymentDataDTO {
        private String id;                     // 결제 ID
        private String transactionKey;         // 거래 키
        private String status;                 // 결제 상태
        private String method;                 // 결제 수단
        private String orderRef;               // 주문 번호 (merchantUid)
        private String orderName;              // 주문명
        private OffsetDateTime requestedAt;    // 요청 시점
        
        // 결제 금액 정보 - 필수 정보만 포함
        @Getter @Setter
        public static class PaymentAmountDTO {
            private long total;          // 총 결제 금액
            private long balanceDue;     // 결제 잔액
        }
        private PaymentAmountDTO amount;
        
        // 구매자 정보 - 필수 정보만 포함
        @Getter @Setter
        public static class CustomerDTO {
            private String name;               // 이름
            private String phoneNumber;        // 전화번호
            private String email;              // 이메일
        }
        private CustomerDTO customer;
        
        // 결제 수단별 정보 - 가상계좌 예시
        @Getter @Setter
        public static class VirtualAccountInfoDTO {
            private String accountNumber;      // 계좌번호
            private String bankCode;           // 은행 코드
            private String bankName;           // 은행명
            private String holderName;         // 예금주
        }
        private VirtualAccountInfoDTO virtualAccountInfo;
    }

    // 결제 취소 요청 DTO
    @Getter @Setter
    public static class CancelRequestDTO {
        private String reason;
    }
    
    // 가상계좌 요청 DTO
    @Getter @Setter
    public static class VirtualAccountRequestDTO {
        @JsonProperty("customer_name")
        private String customerName;
        @JsonProperty("bank_code")
        private String bankCode;
    }

    // 가상계좌 응답 DTO
    @Getter @Setter
    public static class VirtualAccountDTO {
        @JsonProperty("account_number")
        private String accountNumber;
        @JsonProperty("bank_code")
        private String bankCode;
        @JsonProperty("bank_name")
        private String bankName;
        @JsonProperty("customer_name")
        private String customerName;
        private String status;
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
        private String customerEmail;
        private Integer orderId;
        private PaymentStatus status;
        private PaymentMethod paymentMethod;
        private long amount;
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        private LocalDateTime startDate;
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        private LocalDateTime endDate;
    }
}
