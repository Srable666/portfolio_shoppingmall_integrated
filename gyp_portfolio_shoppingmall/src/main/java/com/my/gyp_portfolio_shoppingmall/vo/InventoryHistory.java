package com.my.gyp_portfolio_shoppingmall.vo;

import java.time.LocalDateTime;

import com.my.gyp_portfolio_shoppingmall.enums.ProductEnums.ProductInventoryStatus;

public class InventoryHistory {
    private Integer inventoryHistoryId;
    private Integer productInventoryId;
    private Integer orderProductId;
    private ProductInventoryStatus statusFrom;
    private ProductInventoryStatus statusTo;
    private LocalDateTime createdAt;
    private String note;

    public Integer getInventoryHistoryId() {
        return inventoryHistoryId;
    }

    public void setInventoryHistoryId(Integer inventoryHistoryId) {
        this.inventoryHistoryId = inventoryHistoryId;
    }

    public Integer getProductInventoryId() {
        return productInventoryId;
    }

    public void setProductInventoryId(Integer productInventoryId) {
        this.productInventoryId = productInventoryId;
    }

    public Integer getOrderProductId() {
        return orderProductId;
    }

    public void setOrderProductId(Integer orderProductId) {
        this.orderProductId = orderProductId;
    }

    public ProductInventoryStatus getStatusFrom() {
        return statusFrom;
    }
    
    public void setStatusFrom(ProductInventoryStatus statusFrom) {
        this.statusFrom = statusFrom;
    }

    public ProductInventoryStatus getStatusTo() {
        return statusTo;
    }

    public void setStatusTo(ProductInventoryStatus statusTo) {
        this.statusTo = statusTo;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
