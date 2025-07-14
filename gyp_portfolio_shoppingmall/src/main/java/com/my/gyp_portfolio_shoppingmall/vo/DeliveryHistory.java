package com.my.gyp_portfolio_shoppingmall.vo;

import java.time.LocalDateTime;

import com.my.gyp_portfolio_shoppingmall.enums.OrderEnums.DeliveryStatus;
import com.my.gyp_portfolio_shoppingmall.enums.OrderEnums.DeliveryType;

public class DeliveryHistory {
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

    public Integer getDeliveryHistoryId() {
        return deliveryHistoryId;
    }

    public void setDeliveryHistoryId(Integer deliveryHistoryId) {
        this.deliveryHistoryId = deliveryHistoryId;
    }

    public Integer getOrderProductId() {
        return orderProductId;
    }   

    public void setOrderProductId(Integer orderProductId) {
        this.orderProductId = orderProductId;
    }
    
    public DeliveryType getDeliveryType() {
        return deliveryType;
    }

    public void setDeliveryType(DeliveryType deliveryType) {
        this.deliveryType = deliveryType;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public String getDeliveryCompany() {
        return deliveryCompany;
    }

    public void setDeliveryCompany(String deliveryCompany) {
        this.deliveryCompany = deliveryCompany;
    }

    public DeliveryStatus getDeliveryStatus() {
        return deliveryStatus;
    }

    public void setDeliveryStatus(DeliveryStatus deliveryStatus) {
        this.deliveryStatus = deliveryStatus;
    }

    public LocalDateTime getDeliveryStartDate() {
        return deliveryStartDate;
    }

    public void setDeliveryStartDate(LocalDateTime deliveryStartDate) {
        this.deliveryStartDate = deliveryStartDate;
    }

    public LocalDateTime getDeliveryCompleteDate() {
        return deliveryCompleteDate;
    }

    public void setDeliveryCompleteDate(LocalDateTime deliveryCompleteDate) {
        this.deliveryCompleteDate = deliveryCompleteDate;
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
