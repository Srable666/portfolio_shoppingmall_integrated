package com.my.gyp_portfolio_shoppingmall.dao;

import java.util.List;

import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Repository;

import com.my.gyp_portfolio_shoppingmall.dto.ProductDto.ProductDTO;
import com.my.gyp_portfolio_shoppingmall.dto.ProductDto.ProductSearchDTO;
import com.my.gyp_portfolio_shoppingmall.vo.Category;
import com.my.gyp_portfolio_shoppingmall.vo.InventoryHistory;
import com.my.gyp_portfolio_shoppingmall.vo.OrderProduct;
import com.my.gyp_portfolio_shoppingmall.vo.Product;
import com.my.gyp_portfolio_shoppingmall.vo.ProductInventory;
import com.my.gyp_portfolio_shoppingmall.vo.ProductItem;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class ProductDao {

    private final SqlSession s;

    // 카테고리 추가
    public int insertCategory(Category category) {
        return s.insert("CategoryMapper.insertCategory", category);
    }

    // 카테고리 정보 조회
    public Category getCategory(int categoryId) {
        return s.selectOne("CategoryMapper.getCategory", categoryId);
    }

    // 카테고리 정보 수정
    public int updateCategory(Category category) {
        return s.update("CategoryMapper.updateCategory", category);
    }

    // 카테고리 삭제
    public int deleteCategory(Category category) {
        return s.delete("CategoryMapper.deleteCategory", category);
    }

    // 상품 마스터 추가
    public int insertProduct(Product product) {
        return s.insert("ProductMapper.insertProduct", product);
    }

    // 상품 마스터 정보 수정
    public int updateProduct(Product product) {
        return s.update("ProductMapper.updateProduct", product);
    }

    // 단일 상품 마스터 정보 조회(productId 기준)
    public Product getProductById(int productId) {
        return s.selectOne("ProductMapper.getProductById", productId);
    }

    // 단일 상품 마스터 정보 조회(code 기준)
    public Product getProductByCode(String code) {
        return s.selectOne("ProductMapper.getProductByCode", code);
    }

    // 상품 마스터 목록 조회
    public List<ProductDTO> getProductListBySearch(ProductSearchDTO productSearchDTO) {
        return s.selectList("ProductMapper.getProductListBySearch", productSearchDTO);
    }

    // 상품 품목 정보 등록
    public int insertProductItem(ProductItem productItem) {
        return s.insert("ProductItemMapper.insertProductItem", productItem);
    }

    // 상품 품목 정보 조회
    public ProductItem getProductItemForUpdate(int productItemId) {
        return s.selectOne("ProductItemMapper.getProductItemForUpdate", productItemId);
    }

    // 상품 재고 등록
    public int insertProductInventory(ProductInventory productInventory) {
        return s.insert("ProductInventoryMapper.insertProductInventory", productInventory);
    }

    // 상품 재고 조회
    public ProductInventory getProductInventoryForUpdate(ProductInventory productInventory) {
        return s.selectOne("ProductInventoryMapper.getProductInventoryForUpdate", productInventory);
    }

    // 재고 변동 이력 등록
    public int insertInventoryHistory(InventoryHistory inventoryHistory) {
        return s.insert("InventoryHistoryMapper.insertInventoryHistory", inventoryHistory);
    }

    // 상품 품목 재고 1 증가
    public void increaseOneStock(Integer productItemId) {
        s.update("ProductItemMapper.increaseOneStock", productItemId);
    }

    // 상품 품목 재고 1 감소
    public void decreaseOneStock(Integer productItemId) {
        s.update("ProductItemMapper.decreaseOneStock", productItemId);
    }

    // 상품 품목 예약 수량 1 증가
    public void increaseOneReservedStock(Integer productItemId) {
        s.update("ProductItemMapper.increaseOneReservedStock", productItemId);
    }

    // 상품 품목 예약 수량 1 감소
    public void decreaseOneReservedStock(Integer productItemId) {
        s.update("ProductItemMapper.decreaseOneReservedStock", productItemId);
    }

    // 상품 재고 내역 수정
    public int updateProductInventory(ProductInventory productInventory) {
        return s.update("ProductInventoryMapper.updateProductInventory", productInventory);
    }
    
    // 바코드를 통한 개별 상품 조회
    public ProductItem getProductItemByBarcode(String barcode) {
        return s.selectOne("ProductItemMapper.getProductItemByBarcode", barcode);
    }

    // 개별 상품 정보 수정
    public int updateProductItemWithOptimisticLock(ProductItem productItem) {
        return s.update("ProductItemMapper.updateProductItemWithOptimisticLock", productItem);
    }

    // 주문한 상품 수량만큼 상품 품목 재고 감소 & 예약 수량 증가
    public int ChangeStockByNewOrder(OrderProduct orderProduct) {
        return s.update("ProductItemMapper.ChangeStockByNewOrder", orderProduct);
    }

    // 주문 취소/반품 시 상품 품목 재고 증가 & 예약 수량 감소
    public int StockRecovery(OrderProduct orderProduct) {
        return s.update("ProductItemMapper.StockRecovery", orderProduct);
    }

    // 구매 확정으로 인한 예약 수량 감소 & 판매 수량 증가
    public int ChangeStockByPurchaseConfirmation(OrderProduct orderProduct) {
        return s.update("ProductItemMapper.ChangeStockByPurchaseConfirmation", orderProduct);
    }

    // 결제 실패로 인한 주문 취소 시 상품 품목 재고 증가 & 예약 수량 감소
    public int StockRecoveryForPortOne(OrderProduct orderProduct) {
        return s.update("ProductItemMapper.StockRecoveryForPortOne", orderProduct);
    }

    // 최상위 카테고리 목록 조회
    public List<Category> getTopCategories() {
        return s.selectList("CategoryMapper.getTopCategories");
    }

    // 하위 카테고리 목록 조회
    public List<Category> getSubCategories(Integer categoryId) {
        return s.selectList("CategoryMapper.getSubCategories", categoryId);
    }

    // 모든 상품 목록 조회
    public List<ProductDTO> getAllProducts() {
        return s.selectList("ProductMapper.getAllProducts");
    }

    // 카테고리 목록 조회
    public List<Category> getCategories() {
        return s.selectList("CategoryMapper.getCategories");
    }

    // 상품 품목 목록 조회
    public List<ProductItem> getProductItemsByProductId(Integer productId) {
        return s.selectList("ProductItemMapper.getProductItemsByProductId", productId);
    }

    // 상품 품목 재고 목록 조회
    public List<ProductInventory> getProductInventories(Integer productItemId) {
        return s.selectList("ProductInventoryMapper.getProductInventories", productItemId);
    }

    // 재고 변동 이력 목록 조회
    public List<InventoryHistory> getInventoryHistories(Integer productInventoryId) {
        return s.selectList("InventoryHistoryMapper.getInventoryHistories", productInventoryId);
    }

    // 새로운 상품 목록 조회
    public List<ProductDTO> getNewProducts(Integer limit) {
        return s.selectList("ProductMapper.getNewProducts", limit);
    }

    // 인기 상품 목록 조회
    public List<ProductDTO> getPopularProducts(Integer limit) {
        return s.selectList("ProductMapper.getPopularProducts", limit);
    }

    // 카테고리 경로 조회
    public List<Category> getCategoryPath(Integer categoryId) {
        return s.selectList("CategoryMapper.getCategoryPath", categoryId);
    }

    // 상품 마스터 코드 중복 여부 확인
    public boolean isCodeExists(String code) {
        Integer count = s.selectOne("ProductMapper.isCodeExists", code);
        return count != null && count > 0;
    }
}
