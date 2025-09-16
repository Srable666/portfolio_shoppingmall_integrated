package com.my.gyp_portfolio_shoppingmall.vo;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.my.gyp_portfolio_shoppingmall.enums.OrderEnums.PaymentMethod;
import com.my.gyp_portfolio_shoppingmall.enums.PaymentEnums.PaymentStatus;

public class PaymentHistory {
    private Integer paymentHistoryId;
    private String impUid;             // 포트원 결제 고유번호
    private String merchantUid;         // 주문번호
    private String pgTid;               // PG 거래 고유번호
    private Integer orderId;            // 주문 ID
    private String name;               // 결제 이름
    private PaymentStatus status;       // 결제 상태
    private PaymentMethod payMethod;  // 결제 수단
    private String pgProvider;            // PG 제공자
    private String embPgProvider;         // 결제 수단
    private BigDecimal paidAmount;          // 결제 금액
    private String buyerName;        // 고객 이름
    private String buyerEmail;       // 고객 이메일
    private String buyerTel;       // 고객 전화번호
    private String buyerAddr;       // 고객 주소
    private String buyerPostcode;       // 고객 우편번호
    private LocalDateTime paidAt;        // 결제 완료 시간
    private String customData;       // 커스텀 데이터
    private String receiptUrl;       // 영수증 URL
    private String errorCode;           // 오류 코드
    private String errorMsg;        // 오류 메시지
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

    public String getPgTid() {
        return pgTid;
    }   

    public void setPgTid(String pgTid) {
        this.pgTid = pgTid;
    }   

    public Integer getOrderId() {
        return orderId;
    }   

    public void setOrderId(Integer orderId) {
        this.orderId = orderId;
    }   

    public String getName() {
        return name;
    }   

    public void setName(String name) {
        this.name = name;
    }   

    public PaymentStatus getStatus() {
        return status;
    }   

    public void setStatus(PaymentStatus status) {
        this.status = status;
    }   

    public PaymentMethod getPayMethod() {
        return payMethod;
    }   
    
    public void setPayMethod(PaymentMethod payMethod) {
        this.payMethod = payMethod;
    }   

    public String getPgProvider() {
        return pgProvider;
    }   

    public void setPgProvider(String pgProvider) {
        this.pgProvider = pgProvider;
    }   

    public String getEmbPgProvider() {
        return embPgProvider;
    }   

    public void setEmbPgProvider(String embPgProvider) {
        this.embPgProvider = embPgProvider;
    }   

    public BigDecimal getPaidAmount() {
        return paidAmount;
    }   

    public void setPaidAmount(BigDecimal paidAmount) {
        this.paidAmount = paidAmount;
    }   

    public String getBuyerName() {
        return buyerName;
    }   

    public void setBuyerName(String buyerName) {
        this.buyerName = buyerName;
    }   

    public String getBuyerEmail() {
        return buyerEmail;
    }   

    public void setBuyerEmail(String buyerEmail) {
        this.buyerEmail = buyerEmail;
    }   

    public String getBuyerTel() {
        return buyerTel;
    }   

    public void setBuyerTel(String buyerTel) {
        this.buyerTel = buyerTel;
    }   

    public String getBuyerAddr() {
        return buyerAddr;
    }   

    public void setBuyerAddr(String buyerAddr) {
        this.buyerAddr = buyerAddr;
    }   

    public String getBuyerPostcode() {
        return buyerPostcode;
    }   

    public void setBuyerPostcode(String buyerPostcode) {
        this.buyerPostcode = buyerPostcode;
    }   

    public LocalDateTime getPaidAt() {
        return paidAt;
    }   

    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }   

    public String getCustomData() {
        return customData;
    }   

    public void setCustomData(String customData) {
        this.customData = customData;
    }   

    public String getReceiptUrl() {
        return receiptUrl;
    }   

    public void setReceiptUrl(String receiptUrl) {
        this.receiptUrl = receiptUrl;
    }   

    public String getErrorCode() {
        return errorCode;
    }   

    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }   

    public String getErrorMsg() {
        return errorMsg;
    }   

    public void setErrorMsg(String errorMsg) {
        this.errorMsg = errorMsg;
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