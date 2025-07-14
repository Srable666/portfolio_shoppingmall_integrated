package com.my.gyp_portfolio_shoppingmall.dao;

import java.util.List;

import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Repository;

import com.my.gyp_portfolio_shoppingmall.dto.PaymentDto.PaymentHistorySearchDTO;
import com.my.gyp_portfolio_shoppingmall.vo.PaymentHistory;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Repository
@RequiredArgsConstructor
@Slf4j
public class PaymentHistoryDao {

    private final SqlSession s;

    // 결제 이력 정보 생성
    public int insertPaymentHistory(PaymentHistory paymentHistory) {
        return s.insert("PaymentHistoryMapper.insertPaymentHistory", paymentHistory);
    }

    // 결제 이력 업데이트
    public int updatePaymentHistory(PaymentHistory paymentHistory) {
        return s.update("PaymentHistoryMapper.updatePaymentHistory", paymentHistory);
    }
    
    // 결제 이력 조회(payment_id 기준)
    public PaymentHistory selectPaymentHistoryByPaymentId(String paymentId) {
        return s.selectOne("PaymentHistoryMapper.selectPaymentHistoryByPaymentId", paymentId);
    }
    
    // 결제 이력 조회(merchant_uid 기준)
    public PaymentHistory selectPaymentHistoryByMerchantUid(String merchantUid) {
        return s.selectOne("PaymentHistoryMapper.selectPaymentHistoryByMerchantUid", merchantUid);
    }
    
    // 결제 이력 조회(order_id 기준)
    public PaymentHistory selectPaymentHistoryByOrderId(String orderId) {
        return s.selectOne("PaymentHistoryMapper.selectPaymentHistoryByOrderId", orderId);
    }
    
    // 결제 이력 검색(관리자용)
    public List<PaymentHistory> searchPaymentHistory(PaymentHistorySearchDTO searchDTO) {
        return s.selectList("PaymentHistoryMapper.searchPaymentHistory", searchDTO);
    }
    
    // 총 매출 조회
    public long getTotalRevenue() {
        return s.selectOne("PaymentHistoryMapper.getTotalRevenue");
    }
}
