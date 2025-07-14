package com.my.gyp_portfolio_shoppingmall.vo;

import java.time.LocalDateTime;

import com.my.gyp_portfolio_shoppingmall.enums.OrderEnums.OrderProductStatus;

public class OrderProductHistory {
    private Integer orderProductHistoryId;
    private Integer orderProductId;
    private Integer requestQuantityRecord;
    private OrderProductStatus statusFrom;
    private OrderProductStatus statusTo;
    private String reason;
    private LocalDateTime createdAt;

    public Integer getOrderProductHistoryId() {
        return orderProductHistoryId;
    }

    public void setOrderProductHistoryId(Integer orderProductHistoryId) {
        this.orderProductHistoryId = orderProductHistoryId;
    }

    public Integer getOrderProductId() {
        return orderProductId;
    }

    public void setOrderProductId(Integer orderProductId) {
        this.orderProductId = orderProductId;
    }

    public Integer getRequestQuantityRecord() {
        return requestQuantityRecord;
    }

    public void setRequestQuantityRecord(Integer requestQuantityRecord) {
        this.requestQuantityRecord = requestQuantityRecord;
    }

    public OrderProductStatus getStatusFrom() {
        return statusFrom;
    }

    public void setStatusFrom(OrderProductStatus statusFrom) {
        this.statusFrom = statusFrom;
    }

    public OrderProductStatus getStatusTo() {
        return statusTo;
    }

    public void setStatusTo(OrderProductStatus statusTo) {
        this.statusTo = statusTo;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
