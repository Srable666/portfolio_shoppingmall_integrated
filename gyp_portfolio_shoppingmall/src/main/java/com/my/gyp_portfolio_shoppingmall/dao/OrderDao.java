package com.my.gyp_portfolio_shoppingmall.dao;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Repository;

import com.my.gyp_portfolio_shoppingmall.dto.OrderDto.UserOrderHistoryDTO;
import com.my.gyp_portfolio_shoppingmall.dto.ReviewDto.ReviewDTO;
import com.my.gyp_portfolio_shoppingmall.vo.DeliveryHistory;
import com.my.gyp_portfolio_shoppingmall.vo.Order;
import com.my.gyp_portfolio_shoppingmall.vo.OrderProduct;
import com.my.gyp_portfolio_shoppingmall.vo.OrderProductHistory;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Repository
@RequiredArgsConstructor
@Slf4j
public class OrderDao {

    private final SqlSession s;

    // 주문 내역 정보 생성
    public int insertOrder(Order order) {
        return s.insert("OrderMapper.insertOrder", order);
    }

    // order 정보 업데이트
    public int updateOrder(Order order) {
        return s.update("OrderMapper.updateOrder", order);
    }
    
    // 주문 상품 정보 생성
    public int insertOrderProduct(OrderProduct orderProduct) {
        return s.insert("OrderProductMapper.insertOrderProduct", orderProduct);
    }

    // 주문 마스터 리스트 조회(user_id 기준)
    public List<Order> getUserOrderList(Integer userId) {
        return s.selectList("OrderMapper.getUserOrderList", userId);
    }

    // 주문 마스터 정보 조회(order_id 기준)
    public Order getOrderInfo(Integer orderId) {
        return s.selectOne("OrderMapper.getOrderInfo", orderId);
    }

    // 주문 상품 리스트 조회
    public List<OrderProduct> getOrderProductList(OrderProduct orderProduct) {
        return s.selectList("OrderProductMapper.getOrderProduct", orderProduct);
    }

    // 관리자용 전체 주문 상품 목록 조회
    public List<UserOrderHistoryDTO> getOrderListForAdmin(Map<String, Object> orderListForAdmin) {
        return s.selectList("OrderMapper.getOrderListForAdmin", orderListForAdmin);
    }

    // orderProductId로 해당 상품 정보 조회
    public OrderProduct getOrderProduct(OrderProduct orderProduct) {
        return s.selectOne("OrderProductMapper.getOrderProduct", orderProduct);
    }

    // 주문 내역 개별 상품 상태 업데이트
    public int updateOrderProductStatusWithOptimisticLock(OrderProduct orderProduct) {
        return s.update("OrderProductMapper.updateOrderProductStatusWithOptimisticLock", orderProduct);
    }

    // 회원 주문 내역 조회(user_id 기준)
    public List<UserOrderHistoryDTO> getUserOrderHistoryList(Integer userId) {
        List<UserOrderHistoryDTO> result = s.selectList("OrderMapper.getUserOrderHistory", userId);
        return result;
    }

    // 단일 주문 상세 조회(order_id 기준)
    public UserOrderHistoryDTO getOrderDetail(Integer orderId) {
        return s.selectOne("OrderMapper.getOrderDetail", orderId);
    }

    // 자동 구매 확정 조건의 주문 상품 조회
    public List<OrderProduct> findUnconfirmedDeliveries(LocalDateTime cutoffDate) {
        return s.selectList("OrderProductMapper.findUnconfirmedDeliveries", cutoffDate);
    }

    // 배송 이력 정보 생성
    public int insertDeliveryHistory(DeliveryHistory deliveryHistory) {
        return s.insert("DeliveryHistoryMapper.insertDeliveryHistory", deliveryHistory);
    }

    // 배송 이력 정보 조회(orderProductId 기준)
    public List<DeliveryHistory> getDeliveryHistory(Integer orderProductId) {  
        return s.selectList("DeliveryHistoryMapper.getDeliveryHistory", orderProductId);
    }

    // 배송 이력 정보 수정
    public int updateDeliveryHistory(DeliveryHistory deliveryHistory) {
        return s.update("DeliveryHistoryMapper.updateDeliveryHistory", deliveryHistory);
    }

    // 최근 준비중인 배송 이력 조회
    public DeliveryHistory selectLatestPreparingDeliveryHistory(Integer orderProductId) {
        return s.selectOne("DeliveryHistoryMapper.selectLatestPreparingDeliveryHistory", orderProductId);
    }

    // 최근 배송중인 배송 이력 조회
    public DeliveryHistory selectLatestDeliveringDeliveryHistory(Integer orderProductId) {
        return s.selectOne("DeliveryHistoryMapper.selectLatestDeliveringDeliveryHistory", orderProductId);
    }

    // 최근 배송완료인 배송 이력 조회
    public DeliveryHistory selectLatestDeliveredDeliveryHistory(Integer orderProductId) {
        return s.selectOne("DeliveryHistoryMapper.selectLatestDeliveredDeliveryHistory", orderProductId);
    }

    // 최근 반품중인 배송 이력 조회
    public DeliveryHistory selectLatestReturningDeliveryHistory(Integer orderProductId) {
        return s.selectOne("DeliveryHistoryMapper.selectLatestReturningDeliveryHistory", orderProductId);
    }

    // 회원의 주문 내역이 존재하면서 구매 완료한 상품인지 확인
    public int checkUserOrderedProduct(ReviewDTO reviewDTO) {
        return s.selectOne("OrderMapper.checkUserOrderedProduct", reviewDTO);
    }

    // 주문 상품 이력 정보 생성
    public int insertOrderProductHistory(OrderProductHistory orderProductHistory) {
        return s.insert("OrderProductHistoryMapper.insertOrderProductHistory", orderProductHistory);
    }

    // 주문 상품 이력 정보 조회
    public OrderProductHistory selectOrderProductHistory(OrderProduct orderProduct) {
        return s.selectOne("OrderProductHistoryMapper.selectOrderProductHistory", orderProduct);
    }

    // 주문 정보 조회(merchant_uid 기준)
    public Order getOrderInfoByMerchantUid(String merchantUid) {
        return s.selectOne("OrderMapper.getOrderInfoByMerchantUid", merchantUid);
    }

    // 주문 수 조회
    public int getOrderCount() {
        return s.selectOne("OrderMapper.getOrderCount");
    }
}
