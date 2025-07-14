package com.my.gyp_portfolio_shoppingmall.vo;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.my.gyp_portfolio_shoppingmall.enums.OrderEnums.PaymentMethod;
import com.my.gyp_portfolio_shoppingmall.enums.PaymentEnums.PaymentStatus;

public class PaymentHistory {
    private Integer paymentHistoryId;
    private String impUid;             // 포트원 결제 고유번호
    private String merchantUid;         // 주문번호
    private Integer orderId;            // 주문 ID
    private PaymentStatus status;       // 결제 상태
    private PaymentMethod paymentMethod;  // 결제 수단
    private BigDecimal amount;          // 결제 금액
    private String customerName;        // 고객 이름
    private String customerEmail;       // 고객 이메일
    private String customerPhone;       // 고객 전화번호
    private LocalDateTime requestedAt;  // 결제 요청 시간
    private String paymentData;         // 결제 상세 데이터(JSON)
    private String errorCode;           // 오류 코드
    private String errorMessage;        // 오류 메시지
    private LocalDateTime createdAt;    // 생성 시간
    private LocalDateTime updatedAt;    // 수정 시간

    public Integer getPaymentHistoryId() {
        return paymentHistoryId;
    }

    public void setPaymentHistoryId(Integer paymentHistoryId) {
        this.paymentHistoryId = paymentHistoryId;
    }   

    public String getImpUid() {
        return impUid;
    }   

    public void setImpUid(String impUid) {
        this.impUid = impUid;
    }       

    public String getMerchantUid() {
        return merchantUid;
    }   

    public void setMerchantUid(String merchantUid) {
        this.merchantUid = merchantUid;
    }   

    public Integer getOrderId() {
        return orderId;
    }   

    public void setOrderId(Integer orderId) {
        this.orderId = orderId;
    }   

    public PaymentStatus getStatus() {
        return status;
    }   

    public void setStatus(PaymentStatus status) {
        this.status = status;
    }   

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }   
    
    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }   

    public BigDecimal getAmount() {
        return amount;
    }   

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }   
    
    public String getCustomerName() {
        return customerName;
    }   

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }   

    public String getCustomerEmail() {
        return customerEmail;
    }   

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }   

    public String getCustomerPhone() {
        return customerPhone;
    }   

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }   

    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }   

    public void setRequestedAt(LocalDateTime requestedAt) {
        this.requestedAt = requestedAt;
    }   

    public String getPaymentData() {
        return paymentData;
    }   

    public void setPaymentData(String paymentData) {
        this.paymentData = paymentData;
    }   

    public String getErrorCode() {
        return errorCode;
    }   

    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }   

    public String getErrorMessage() {
        return errorMessage;
    }   

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }       

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }              

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }   

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }   

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }   
    
}       