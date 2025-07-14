package com.my.gyp_portfolio_shoppingmall.vo;

import java.time.LocalDateTime;

import com.my.gyp_portfolio_shoppingmall.enums.ProductEnums.ProductInventoryStatus;

public class ProductInventory {
    private Integer productInventoryId;
    private Integer productItemId;
    private String barcode;
    private ProductInventoryStatus status;
    private Integer orderProductId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public Integer getProductInventoryId() {
        return productInventoryId;
    }

    public void setProductInventoryId(Integer productInventoryId) {
        this.productInventoryId = productInventoryId;
    }

    public Integer getProductItemId() {
        return productItemId;
    }

    public void setProductItemId(Integer productItemId) {
        this.productItemId = productItemId;
    }

    public String getBarcode() {
        return barcode;
    }

    public void setBarcode(String barcode) {
        this.barcode = barcode;
    }

    public ProductInventoryStatus getStatus() {
        return status;
    }

    public void setStatus(ProductInventoryStatus status) {
        this.status = status;
    }

    public Integer getOrderProductId() {
        return orderProductId;
    }

    public void setOrderProductId(Integer orderProductId) {
        this.orderProductId = orderProductId;
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
