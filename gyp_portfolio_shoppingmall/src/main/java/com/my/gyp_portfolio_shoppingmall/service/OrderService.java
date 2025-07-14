package com.my.gyp_portfolio_shoppingmall.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import com.my.gyp_portfolio_shoppingmall.dao.OrderDao;
import com.my.gyp_portfolio_shoppingmall.dao.ProductDao;
import com.my.gyp_portfolio_shoppingmall.dao.UserDao;
import com.my.gyp_portfolio_shoppingmall.dto.OrderDto.DeliveryInfoDTO;
import com.my.gyp_portfolio_shoppingmall.dto.OrderDto.NewOrderDTO;
import com.my.gyp_portfolio_shoppingmall.dto.OrderDto.OrderDTO;
import com.my.gyp_portfolio_shoppingmall.dto.OrderDto.OrderListForAdminDTO;
import com.my.gyp_portfolio_shoppingmall.dto.OrderDto.OrderProductDTO;
import com.my.gyp_portfolio_shoppingmall.dto.OrderDto.UserOrderHistoryDTO;
import com.my.gyp_portfolio_shoppingmall.enums.OrderEnums.DeliveryStatus;
import com.my.gyp_portfolio_shoppingmall.enums.OrderEnums.DeliveryType;
import com.my.gyp_portfolio_shoppingmall.enums.OrderEnums.OrderProductStatus;
import com.my.gyp_portfolio_shoppingmall.enums.ProductEnums.ProductInventoryStatus;
import com.my.gyp_portfolio_shoppingmall.exception.OrderException;
import com.my.gyp_portfolio_shoppingmall.exception.ProductException;
import com.my.gyp_portfolio_shoppingmall.exception.UserException;
import com.my.gyp_portfolio_shoppingmall.support.OptimisticLock;
import com.my.gyp_portfolio_shoppingmall.support.OrderSupport;
import com.my.gyp_portfolio_shoppingmall.support.PhoneEncryptionUtil;
import com.my.gyp_portfolio_shoppingmall.support.UserSupport;
import com.my.gyp_portfolio_shoppingmall.vo.DeliveryHistory;
import com.my.gyp_portfolio_shoppingmall.vo.InventoryHistory;
import com.my.gyp_portfolio_shoppingmall.vo.Order;
import com.my.gyp_portfolio_shoppingmall.vo.OrderProduct;
import com.my.gyp_portfolio_shoppingmall.vo.OrderProductHistory;
import com.my.gyp_portfolio_shoppingmall.vo.ProductInventory;
import com.my.gyp_portfolio_shoppingmall.vo.ProductItem;
import com.my.gyp_portfolio_shoppingmall.vo.User;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class OrderService {
    
    private final UserDao userDao;
    private final OrderDao orderDao;
    private final ProductDao productDao;
    private final PhoneEncryptionUtil phoneEncryptionUtil;
    
    // 상태 업데이트만 수행하는 낙관적 잠금 전용 메서드
    @OptimisticLock
    public int updateOrderProductStatusWithOptimisticLock(OrderProduct orderProduct) {
        return orderDao.updateOrderProductStatusWithOptimisticLock(orderProduct);
    }

    // 주문 접수
    @Transactional(
        isolation = Isolation.REPEATABLE_READ,
        timeout = 10
    )
    public void insertOrder(NewOrderDTO newOrderDTO) {
        // 현재 로그인한 사용자의 이메일 추출
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = auth.getName();
        
        // user 존재 여부 확인
        User userCheck = userDao.findByEmailForUpdate(userEmail);
        if (userCheck == null) {
            throw new UserException.UserNotFoundException();
        }

        // productItem 정보 유효 여부 확인(존재 여부, 재고 여부, 판매 가능 여부)
        for (OrderProductDTO orderProductDTO : newOrderDTO.getOrderProductDTOList()) {
            ProductItem productItemCheck = productDao.getProductItemForUpdate(orderProductDTO.getProductItemId());
            if (productItemCheck == null) {
                throw new ProductException.ProductItemNotFoundException();
            }
            if (productItemCheck.getStockQuantity() < orderProductDTO.getOriginalQuantity()) {
                throw new ProductException.ProductItemQuantityException();
            }
            if (productItemCheck.getIsActive() == 0 || productItemCheck.getIsDeleted() == 1) {
                throw new ProductException.ProductItemNotSaleException();
            }
        }

        // 주문 정보 정리
        Order order = new Order();
        order.setUserId(userCheck.getUserId());
        order.setDeliveryFee(newOrderDTO.getDeliveryFee());
        order.setRecipientName(newOrderDTO.getRecipientName());
        order.setRecipientPhone(phoneEncryptionUtil.encrypt(newOrderDTO.getRecipientPhone()));
        order.setRecipientPostcode(newOrderDTO.getRecipientPostcode());
        order.setRecipientAddress(newOrderDTO.getRecipientAddress());
        order.setDeliveryRequest(newOrderDTO.getDeliveryRequest());
        order.setPaymentMethod(newOrderDTO.getPaymentMethod());

        // 총 주문금액 계산
        BigDecimal totalPrice = newOrderDTO.getOrderProductDTOList().stream()
            .map(item -> item.getFinalPrice().multiply(BigDecimal.valueOf(item.getOriginalQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        totalPrice = totalPrice.add(BigDecimal.valueOf(newOrderDTO.getDeliveryFee()));        
        order.setOriginalTotalPrice(totalPrice);
        order.setCurrentTotalPrice(totalPrice);

        // 주문 정보 생성 후 orderId 반환받아 order 객체에 저장
        orderDao.insertOrder(order);

        // merchantUid 생성
        String merchantUid;
        do {
            merchantUid = OrderSupport.generateMerchantUid();
        } while (orderDao.getOrderInfoByMerchantUid(merchantUid) != null);
        order.setMerchantUid(merchantUid);
        orderDao.updateOrder(order);

        // 주문한 상품 정보 저장 및 재고 예약
        for (OrderProductDTO orderProductDTO : newOrderDTO.getOrderProductDTOList()) {
            // 주문한 상품 정보 저장
            OrderProduct orderProduct = new OrderProduct();
            orderProduct.setOrderId(order.getOrderId());
            orderProduct.setProductItemId(orderProductDTO.getProductItemId());
            orderProduct.setOriginalQuantity(orderProductDTO.getOriginalQuantity());
            orderProduct.setChangedQuantity(orderProductDTO.getOriginalQuantity());
            orderProduct.setRequestQuantity(0);
            orderProduct.setPrice(orderProductDTO.getPrice());
            orderProduct.setDiscountRate(orderProductDTO.getDiscountRate());
            orderProduct.setFinalPrice(orderProductDTO.getFinalPrice());
            orderProduct.setSize(orderProductDTO.getSize());
            orderProduct.setColor(orderProductDTO.getColor());
            orderProduct.setStatus(OrderProductStatus.PAYMENT_PENDING);
            orderDao.insertOrderProduct(orderProduct);

            // 주문한 상품 이력 정보 생성
            OrderProductHistory orderProductHistory = new OrderProductHistory();
            orderProductHistory.setOrderProductId(orderProduct.getOrderProductId());
            orderProductHistory.setStatusTo(OrderProductStatus.PAYMENT_PENDING);
            orderProductHistory.setReason("주문 접수");
            orderDao.insertOrderProductHistory(orderProductHistory);

            // 주문한 상품의 상품 품목 재고 감소 & 예약 수량 증가
            productDao.ChangeStockByNewOrder(orderProduct);
        }
    }

    // 주문 상품 상태 업데이트(결제 대기 -> 결제 완료)
    @Transactional(
        isolation = Isolation.REPEATABLE_READ,
        timeout = 5
    )
    public void updateOrderProductStatusToPaymentCompleted(List<OrderProductDTO> orderProductDTOList) {
        // 관리자 권한 확인
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (!auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            throw new UserException.AccessDeniedException();
        }

        for (OrderProductDTO orderProductDTO : orderProductDTOList) {
            // 주문 정보 조회
            Order orderCheck = orderDao.getOrderInfo(orderProductDTO.getOrderId());
            if (orderCheck == null) {
                throw new OrderException.OrderNotFoundException();
            }
    
            // 주문 상품 조회
            OrderProduct orderProductCheck = new OrderProduct();
            orderProductCheck.setOrderProductId(orderProductDTO.getOrderProductId());
            orderProductCheck = orderDao.getOrderProduct(orderProductCheck);
    
            // 주문 상품 존재 여부 확인
            if (orderProductCheck == null) {
                throw new OrderException.OrderProductNotFoundException();
            }
    
            // 현재 주문 상품 status가 PAYMENT_PENDING인 경우에만 통과
            if (orderProductCheck.getStatus() != OrderProductStatus.PAYMENT_PENDING) {
                throw new OrderException.OrderProductRequestException();
            }
    
            // orderProduct 상태 업데이트(낙관적 잠금)
            orderProductCheck.setStatus(OrderProductStatus.PAYMENT_COMPLETED);
            orderProductCheck.setVersion(orderProductDTO.getVersion());
            updateOrderProductStatusWithOptimisticLock(orderProductCheck);
    
            // 주문한 상품 이력 정보 생성
            OrderProductHistory orderProductHistory = new OrderProductHistory();
            orderProductHistory.setOrderProductId(orderProductDTO.getOrderProductId());
            orderProductHistory.setStatusFrom(OrderProductStatus.PAYMENT_PENDING);
            orderProductHistory.setStatusTo(OrderProductStatus.PAYMENT_COMPLETED);
            orderProductHistory.setReason("결제 완료");
            orderDao.insertOrderProductHistory(orderProductHistory);
        }
    }
    
    // 관리자용 주문 상품 상태 업데이트(결제 완료 -> 준비중 / 웹훅 실패 시 사용)
    @Transactional(
        isolation = Isolation.REPEATABLE_READ,
        timeout = 5
    )
    public void manuallyUpdateOrderProductStatusToPreparing(List<OrderProductDTO> orderProductDTOList) {    
        for (OrderProductDTO orderProductDTO : orderProductDTOList) {
            Order orderCheck = orderDao.getOrderInfo(orderProductDTO.getOrderId());
            OrderProduct orderProductCheck = new OrderProduct();
            orderProductCheck.setOrderProductId(orderProductDTO.getOrderProductId());
            orderProductCheck = orderDao.getOrderProduct(orderProductCheck);

            // order 존재 여부 확인
            if (orderCheck == null) {
                throw new OrderException.OrderNotFoundException();
            }

            // 현재 주문 상품 status가 PAYMENT_COMPLETED인 경우에만 통과
            if (orderProductDTO.getStatus() != OrderProductStatus.PAYMENT_COMPLETED) {
                throw new OrderException.OrderProductRequestException();
            }

            // orderProduct 상태 업데이트(낙관적 잠금)   
            orderProductCheck.setStatus(OrderProductStatus.PREPARING);     
            orderProductCheck.setVersion(orderProductDTO.getVersion());   
            updateOrderProductStatusWithOptimisticLock(orderProductCheck);

            // 주문한 상품 이력 정보 생성
            OrderProductHistory orderProductHistory = new OrderProductHistory();
            orderProductHistory.setOrderProductId(orderProductDTO.getOrderProductId());
            orderProductHistory.setStatusFrom(OrderProductStatus.PAYMENT_COMPLETED);
            orderProductHistory.setStatusTo(OrderProductStatus.PREPARING);
            orderProductHistory.setReason("상품 준비중");
            orderDao.insertOrderProductHistory(orderProductHistory);

            // deliveryHistory 빈 정보 생성
            DeliveryHistory deliveryHistory = new DeliveryHistory();
            deliveryHistory.setOrderProductId(orderProductDTO.getOrderProductId());
            deliveryHistory.setDeliveryType(DeliveryType.ORDER_OUT);
            deliveryHistory.setDeliveryStatus(DeliveryStatus.PREPARING);
            orderDao.insertDeliveryHistory(deliveryHistory);
        }    
    }

    // 관리자용 주문 상품 상태 업데이트(준비중 -> 배송중)
    @Transactional(
        isolation = Isolation.REPEATABLE_READ,
        timeout = 5
    )
    public void updateOrderProductStatusToDelivering(DeliveryInfoDTO deliveryInfoDTO) {       
        OrderProduct orderProductCheck = new OrderProduct();
        orderProductCheck.setOrderProductId(deliveryInfoDTO.getOrderProductId());
        orderProductCheck = orderDao.getOrderProduct(orderProductCheck);
        
        // orderProduct 존재 여부 확인           
        if (orderProductCheck == null) {
            throw new OrderException.OrderProductNotFoundException();
        }

        // orderProduct 상태가 PREPARING인 경우에만 통과
        if (orderProductCheck.getStatus() != OrderProductStatus.PREPARING) {
            throw new OrderException.OrderProductRequestException();
        }

        // orderProduct의 quantity와 배송 정보에 있는 바코드 개수가 일치하는지 확인
        if (orderProductCheck.getOriginalQuantity() != deliveryInfoDTO.getBarcodes().size()) {
            throw new OrderException.OrderProductRequestException();
        }

        for (String barcode : deliveryInfoDTO.getBarcodes()) {
            ProductInventory productInventoryCheck = new ProductInventory();
            productInventoryCheck.setBarcode(barcode);
            productInventoryCheck = productDao.getProductInventoryForUpdate(productInventoryCheck);

            // productInventory 존재 여부 확인
            if (productInventoryCheck == null) {
                throw new ProductException.ProductInventoryNotFoundException();
            }

            // 해당 바코드 재고의 productItemId와 주문 상품의 productItemId가 일치하는지 확인
            if (productInventoryCheck.getProductItemId() != orderProductCheck.getProductItemId()) {
                throw new ProductException.ProductInventoryRequestException();
            }

            // productInventory 상태가 IN_STOCK인 경우에만 통과
            if (productInventoryCheck.getStatus() != ProductInventoryStatus.IN_STOCK) {
                throw new ProductException.ProductInventoryRequestException();
            }

            // productInventory 상태 업데이트
            productInventoryCheck.setStatus(ProductInventoryStatus.OUT_OF_STOCK);
            productInventoryCheck.setOrderProductId(orderProductCheck.getOrderProductId());
            productDao.updateProductInventory(productInventoryCheck);

            // 상품 재고 변동 이력 inventoryHistory 등록
            InventoryHistory inventoryHistory = new InventoryHistory();
            inventoryHistory.setProductInventoryId(productInventoryCheck.getProductInventoryId());
            inventoryHistory.setOrderProductId(orderProductCheck.getOrderProductId());
            inventoryHistory.setStatusFrom(ProductInventoryStatus.IN_STOCK);
            inventoryHistory.setStatusTo(ProductInventoryStatus.OUT_OF_STOCK);
            productDao.insertInventoryHistory(inventoryHistory);
        }

        // 주문 상품 배송 정보 업데이트
        orderProductCheck.setStatus(OrderProductStatus.DELIVERING);
        orderProductCheck.setVersion(deliveryInfoDTO.getVersion());
        updateOrderProductStatusWithOptimisticLock(orderProductCheck);

        // 주문한 상품 이력 정보 생성
        OrderProductHistory orderProductHistory = new OrderProductHistory();
        orderProductHistory.setOrderProductId(orderProductCheck.getOrderProductId());
        orderProductHistory.setStatusFrom(OrderProductStatus.PREPARING);
        orderProductHistory.setStatusTo(OrderProductStatus.DELIVERING);
        orderProductHistory.setReason("배송 중");
        orderDao.insertOrderProductHistory(orderProductHistory);

        // deliveryHistory 상태 업데이트
        DeliveryHistory deliveryHistory = orderDao.selectLatestPreparingDeliveryHistory(orderProductCheck.getOrderProductId());
        deliveryHistory.setInvoiceNumber(deliveryInfoDTO.getInvoiceNumber());
        deliveryHistory.setDeliveryCompany(deliveryInfoDTO.getDeliveryCompany());
        deliveryHistory.setDeliveryStatus(DeliveryStatus.DELIVERING);
        deliveryHistory.setDeliveryStartDate(deliveryInfoDTO.getDeliveryStartDate());
        orderDao.updateDeliveryHistory(deliveryHistory);
    }

    // 관리자용 주문 내역 업데이트(배송중 -> 배송완료 / 교환 배송중 -> 교환 배송완료)
    @Transactional(
        isolation = Isolation.REPEATABLE_READ,
        timeout = 5
    )
    public void updateOrderStatusToDelivered(DeliveryInfoDTO deliveryInfoDTO) {     
        OrderProduct orderProductCheck = new OrderProduct();
        orderProductCheck.setOrderProductId(deliveryInfoDTO.getOrderProductId());
        orderProductCheck = orderDao.getOrderProduct(orderProductCheck);

        // 주문 존재 여부 확인
        if (orderProductCheck == null) {
            throw new OrderException.OrderProductNotFoundException();
        }

        // 현재 주문 상품 status가 DELIVERING 또는 EXCHANGE_DELIVERING인 경우에만 통과
        if (!(orderProductCheck.getStatus() == OrderProductStatus.DELIVERING || 
        orderProductCheck.getStatus() == OrderProductStatus.EXCHANGE_DELIVERING)) {
            throw new OrderException.OrderProductRequestException();
        }

        // orderProduct 상태 업데이트(낙관적 잠금)
        if (orderProductCheck.getStatus() == OrderProductStatus.DELIVERING) {
            orderProductCheck.setStatus(OrderProductStatus.DELIVERED);
        } else {
            orderProductCheck.setStatus(OrderProductStatus.EXCHANGE_DELIVERED);
        }
        orderProductCheck.setVersion(deliveryInfoDTO.getVersion());
        updateOrderProductStatusWithOptimisticLock(orderProductCheck);

        // 주문한 상품 이력 정보 생성
        OrderProductHistory orderProductHistory = new OrderProductHistory();
        orderProductHistory.setOrderProductId(orderProductCheck.getOrderProductId());
        if (orderProductCheck.getStatus() == OrderProductStatus.DELIVERING) {
            orderProductHistory.setStatusFrom(OrderProductStatus.DELIVERING);
            orderProductHistory.setStatusTo(OrderProductStatus.DELIVERED);
            orderProductHistory.setReason("배송 완료");
        } else {
            orderProductHistory.setStatusFrom(OrderProductStatus.EXCHANGE_DELIVERING);
            orderProductHistory.setStatusTo(OrderProductStatus.EXCHANGE_DELIVERED);
            orderProductHistory.setReason("교환 배송 완료");
        }
        orderDao.insertOrderProductHistory(orderProductHistory);

        // deliveryHistory 상태 업데이트
        DeliveryHistory deliveryHistory = orderDao.selectLatestDeliveringDeliveryHistory(deliveryInfoDTO.getOrderProductId());
        deliveryHistory.setDeliveryStatus(DeliveryStatus.DELIVERED);
        deliveryHistory.setDeliveryCompleteDate(deliveryInfoDTO.getDeliveryCompleteDate());
        orderDao.updateDeliveryHistory(deliveryHistory);
    }

    // 주문 내역 업데이트(배송완료 -> 구매확정 / 회원 본인 & 관리자 접근 가능)
    @Transactional(
        isolation = Isolation.REPEATABLE_READ,
        timeout = 5
    )
    public void updateOrderStatusToDeliveryConfirmed(OrderProductDTO orderProductDTO) {
        // 필요한 정보 추출
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = auth.getName();
        User userCheck = userDao.findByEmailForUpdate(userEmail);
        Order orderCheck = orderDao.getOrderInfo(orderProductDTO.getOrderId());

        // 주문 존재 여부 확인
        if (orderCheck == null) {
            throw new OrderException.OrderNotFoundException();
        }
        
        // 관리자&주문자 일치 여부 확인
        UserSupport.validateNonAdminUserAccess(
            auth, 
            userCheck.getUserId(), 
            orderCheck.getUserId()
        );

        // 주문 상품 조회
        OrderProduct orderProductCheck = new OrderProduct();
        orderProductCheck.setOrderProductId(orderProductDTO.getOrderProductId());
        orderProductCheck = orderDao.getOrderProduct(orderProductCheck);

        // 주문 존재 여부 확인
        if (orderProductCheck == null) {
            throw new OrderException.OrderProductNotFoundException();
        }

        // 현재 주문 상품 status가 DELIVERED 또는 EXCHANGE_DELIVERED인 경우에만 통과
        if (!(orderProductCheck.getStatus() == OrderProductStatus.DELIVERED || 
        orderProductCheck.getStatus() == OrderProductStatus.EXCHANGE_DELIVERED)) {
            throw new OrderException.OrderProductRequestException();
        }

        // productItem 수량 업데이트(예약 수량 감소 & 판매 수량 증가)
        productDao.ChangeStockByPurchaseConfirmation(orderProductCheck);
        
        // 주문 상품 상태 업데이트(배송완료/교환 배송완료 -> 구매 확정)
        orderProductCheck.setStatus(OrderProductStatus.DELIVERY_CONFIRMED);
        orderProductCheck.setVersion(orderProductDTO.getVersion());
        updateOrderProductStatusWithOptimisticLock(orderProductCheck);

        // 주문한 상품 이력 정보 생성
        OrderProductHistory orderProductHistory = new OrderProductHistory();
        orderProductHistory.setOrderProductId(orderProductCheck.getOrderProductId());
        orderProductHistory.setStatusFrom(OrderProductStatus.DELIVERED);
        orderProductHistory.setStatusTo(OrderProductStatus.DELIVERY_CONFIRMED);
        orderProductHistory.setReason(auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")) ? 
                "구매 확정(관리자)" : "구매 확정(회원 본인)");
        orderDao.insertOrderProductHistory(orderProductHistory);

        // deliveryHistory 상태 업데이트
        DeliveryHistory deliveryHistory = orderDao.selectLatestDeliveredDeliveryHistory(orderProductDTO.getOrderProductId());
        deliveryHistory.setDeliveryStatus(DeliveryStatus.CONFIRMED);
        orderDao.updateDeliveryHistory(deliveryHistory);
    }

    // 자동 구매 확정 처리(배송완료/교환 배송완료 7일 후)
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional(
        isolation = Isolation.REPEATABLE_READ,
        timeout = 5
    )
    public void autoConfirmPurchase() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(7);
        List<OrderProduct> unconfirmedOrderProducts = orderDao.findUnconfirmedDeliveries(cutoffDate);

        // 구매 확정 처리
        for (OrderProduct orderProduct : unconfirmedOrderProducts) {
            // productItem 수량 업데이트(예약 수량 감소 & 판매 수량 증가)
            productDao.ChangeStockByPurchaseConfirmation(orderProduct);
            
            // orderProduct 상태 업데이트(낙관적 잠금, 배송완료/교환 배송완료 -> 배송 확정)
            orderProduct.setStatus(OrderProductStatus.DELIVERY_CONFIRMED);
            updateOrderProductStatusWithOptimisticLock(orderProduct);

            // 주문한 상품 이력 정보 생성
            OrderProductHistory orderProductHistory = new OrderProductHistory();
            orderProductHistory.setOrderProductId(orderProduct.getOrderProductId());
            orderProductHistory.setStatusFrom(OrderProductStatus.DELIVERED);
            orderProductHistory.setStatusTo(OrderProductStatus.DELIVERY_CONFIRMED);
            orderProductHistory.setReason("자동 구매 확정");
            orderDao.insertOrderProductHistory(orderProductHistory);

            // deliveryHistory 상태 업데이트
            DeliveryHistory deliveryHistory = orderDao.selectLatestDeliveredDeliveryHistory(orderProduct.getOrderProductId());
            deliveryHistory.setDeliveryStatus(DeliveryStatus.CONFIRMED);
            orderDao.updateDeliveryHistory(deliveryHistory);
        }
    }

    // 회원 본인 주문 내역 리스트 조회    
    @Transactional(
        isolation = Isolation.REPEATABLE_READ,
        timeout = 5
    )
    public List<UserOrderHistoryDTO> getUserOrderHistoryList() {
        // 현재 로그인한 사용자의 이메일 추출
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = auth.getName();

        // user 존재 여부 확인
        User userCheck = userDao.findByEmailForUpdate(userEmail);
        if (userCheck == null) {
            throw new UserException.UserNotFoundException();
        }

        // 회원 주문 내역 조회
        List<UserOrderHistoryDTO> userOrderHistoryDTOList = orderDao.getUserOrderHistoryList(userCheck.getUserId());
        for (UserOrderHistoryDTO userOrderHistoryDTO : userOrderHistoryDTOList) {
            userOrderHistoryDTO.setRecipientPhone(phoneEncryptionUtil.decrypt(userOrderHistoryDTO.getRecipientPhone()));
        }

        return userOrderHistoryDTOList;
    }

    // 단일 주문 상세 조회(회원 본인 & 관리자 접근 가능)
    @Transactional(
        isolation = Isolation.REPEATABLE_READ,
        timeout = 5
    )
    public UserOrderHistoryDTO getOrderHistoryDetail(OrderDTO orderDTO) {
        // 필요한 정보 추출
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = auth.getName();
        User userCheck = userDao.findByEmailForUpdate(userEmail);
        Order orderCheck = orderDao.getOrderInfo(orderDTO.getOrderId());

        // 주문 존재 여부 확인
        if (orderCheck == null) {
            throw new OrderException.OrderNotFoundException();
        }
        
        // 관리자&주문자 일치 여부 확인
        UserSupport.validateNonAdminUserAccess(
            auth, 
            userCheck.getUserId(), 
            orderCheck.getUserId()
        );

        // 주문 이력 조회
        UserOrderHistoryDTO userOrderHistoryDTO = orderDao.getOrderDetail(orderDTO.getOrderId());

        // 주문 이력 존재 여부 확인
        if (userOrderHistoryDTO == null) {
            throw new OrderException.OrderNotFoundException();
        }

        userOrderHistoryDTO.setRecipientPhone(phoneEncryptionUtil.decrypt(userOrderHistoryDTO.getRecipientPhone()));

        return userOrderHistoryDTO;
    }

    // 관리자용 전체 주문 상품 리스트 조회(검색 조건 포함)
    public List<UserOrderHistoryDTO> getOrderListForAdmin(OrderListForAdminDTO orderListForAdminDTO) {
        Map<String, Object> params = new HashMap<>();
        params.put("orderId", orderListForAdminDTO.getOrderId());
        params.put("merchantUid", orderListForAdminDTO.getMerchantUid());
        params.put("userEmail", orderListForAdminDTO.getUserEmail());
        params.put("startDate", orderListForAdminDTO.getStartDate() != null ? 
            orderListForAdminDTO.getStartDate().toString() : null);
        params.put("endDate", orderListForAdminDTO.getEndDate() != null ? 
            orderListForAdminDTO.getEndDate().toString() : null);
        params.put("offset", (orderListForAdminDTO.getPage() - 1) * orderListForAdminDTO.getSize());
        params.put("size", orderListForAdminDTO.getSize());

        List<UserOrderHistoryDTO> orderListForAdminDTOList = orderDao.getOrderListForAdmin(params);
        for (UserOrderHistoryDTO userOrderHistoryDTO : orderListForAdminDTOList) {
            userOrderHistoryDTO.setRecipientPhone(phoneEncryptionUtil.decrypt(userOrderHistoryDTO.getRecipientPhone()));
        }

        return orderListForAdminDTOList;
    }

    // 회원의 주문 상품 취소/반품/교환 요청
    @Transactional(
        isolation = Isolation.REPEATABLE_READ,
        timeout = 5
    )
    public void updateOrderProductRequest(OrderProductDTO orderProductDTO) {        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = auth.getName();
        User userCheck = userDao.findByEmailForUpdate(userEmail);
        Order orderCheck = orderDao.getOrderInfo(orderProductDTO.getOrderId());
        OrderProduct orderProductCheck = new OrderProduct();
        orderProductCheck.setOrderProductId(orderProductDTO.getOrderProductId());
        orderProductCheck = orderDao.getOrderProduct(orderProductCheck);
        
        // 주문 및 주문 상품 존재 여부 확인
        if (orderCheck == null) {
            throw new OrderException.OrderNotFoundException();
        }
        if (orderProductCheck == null) {
            throw new OrderException.OrderProductNotFoundException();
        }

        // 주문자 일치 여부 확인
        UserSupport.validateNonAdminUserAccess(
            auth, 
            userCheck.getUserId(), 
            orderCheck.getUserId()
        );

        // DTO 상태가 취소 요청이면 orderProductCheck 상태가 결제 대기, 준비중일 경우에만 통과
        if (orderProductDTO.getStatus() == OrderProductStatus.CANCEL_REQUESTED) {
            if (orderProductCheck.getStatus() != OrderProductStatus.PAYMENT_PENDING && orderProductCheck.getStatus() != OrderProductStatus.PREPARING) {
                throw new OrderException.OrderProductRequestException();
            }
        }

        // DTO 상태가 반품 요청이거나 교환 요청이면 orderProductCheck 상태가 배송완료일 경우에만 통과
        if (orderProductDTO.getStatus() == OrderProductStatus.RETURN_REQUESTED || orderProductDTO.getStatus() == OrderProductStatus.EXCHANGE_REQUESTED) {
            if (orderProductCheck.getStatus() != OrderProductStatus.DELIVERED) {
                throw new OrderException.OrderProductRequestException();
            }
        }

        // DTO 상태가 교환 요청일때 상품 재고 존재 여부 확인
        if (orderProductDTO.getStatus() == OrderProductStatus.EXCHANGE_REQUESTED) {
            ProductItem productItem = productDao.getProductItemForUpdate(orderProductCheck.getProductItemId());
            if (productItem.getStockQuantity() < orderProductDTO.getRequestQuantity()) {
                throw new OrderException.OrderProductStockException();
            }
        }

        // orderProduct 상태 업데이트(낙관적 잠금)
        if (orderProductDTO.getStatus() == OrderProductStatus.EXCHANGE_REQUESTED) {
            orderProductCheck.setRequestQuantity(orderProductDTO.getRequestQuantity());
        } else {
            orderProductCheck.setChangedQuantity(orderProductCheck.getOriginalQuantity() - orderProductDTO.getChangedQuantity());
            orderProductCheck.setRequestQuantity(orderProductDTO.getRequestQuantity());
        }
        orderProductCheck.setStatus(orderProductDTO.getStatus());
        orderProductCheck.setRequestReason(orderProductDTO.getRequestReason());
        orderProductCheck.setVersion(orderProductDTO.getVersion());
        updateOrderProductStatusWithOptimisticLock(orderProductCheck);

        // 주문한 상품 이력 정보 생성
        OrderProductHistory orderProductHistory = new OrderProductHistory();
        orderProductHistory.setOrderProductId(orderProductCheck.getOrderProductId());
        orderProductHistory.setRequestQuantityRecord(orderProductDTO.getRequestQuantity());
        orderProductHistory.setStatusFrom(orderProductCheck.getStatus());
        orderProductHistory.setStatusTo(orderProductDTO.getStatus());
        orderProductHistory.setReason(orderProductDTO.getRequestReason());
        orderDao.insertOrderProductHistory(orderProductHistory);
    }

    // 관리자의 주문 취소 요청 승인(배송 이전)
    @Transactional(
        isolation = Isolation.REPEATABLE_READ,
        timeout = 5
    )
    public void updateOrderProductCancelApproval(OrderProductDTO cancelOrderProductDTO) {
        OrderProduct orderProductCheck = new OrderProduct();
        orderProductCheck.setOrderProductId(cancelOrderProductDTO.getOrderProductId());
        orderProductCheck = orderDao.getOrderProduct(orderProductCheck);

        // 주문 상품 존재 여부 확인
        if (orderProductCheck == null) {
            throw new OrderException.OrderProductNotFoundException();
        }

        // 주문 상품 상태가 취소요청인 경우에만 통과
        if (orderProductCheck.getStatus() != OrderProductStatus.CANCEL_REQUESTED) {
            throw new OrderException.OrderProductRequestException();
        }

        // productItem 수량 정보 변경(예약 -> 재고)
        productDao.StockRecovery(orderProductCheck);

        // orderProduct 상태 업데이트(낙관적 잠금, 취소 요청 -> 취소 완료)
        if (orderProductCheck.getChangedQuantity() == 0) {
            // 전체 취소인 경우 취소 완료로 업데이트
            orderProductCheck.setStatus(OrderProductStatus.CANCELLED);
        } else {
            // 부분 취소인 경우 배송완료로 업데이트
            orderProductCheck.setStatus(OrderProductStatus.DELIVERED);
        }
        orderProductCheck.setVersion(cancelOrderProductDTO.getVersion());
        updateOrderProductStatusWithOptimisticLock(orderProductCheck);

        // 주문한 상품 이력 정보 생성
        OrderProductHistory orderProductHistory = new OrderProductHistory();
        orderProductHistory.setOrderProductId(orderProductCheck.getOrderProductId());
        orderProductHistory.setStatusFrom(OrderProductStatus.CANCEL_REQUESTED);
        orderProductHistory.setStatusTo(OrderProductStatus.CANCELLED);
        orderProductHistory.setReason("주문 취소 완료");
        orderDao.insertOrderProductHistory(orderProductHistory);

        // orders 업데이트
        Order currentOrder = orderDao.getOrderInfo(orderProductCheck.getOrderId());
        // orderProduct의 changedQuantity와 finalPrice를 곱하여 currentTotalPrice 업데이트
        BigDecimal totalPrice = orderProductCheck.getFinalPrice().multiply(BigDecimal.valueOf(orderProductCheck.getChangedQuantity()));
        // 주문 상품 총 가격이 0이 아니면 배송비 추가
        if (totalPrice.compareTo(BigDecimal.ZERO) != 0) {
            totalPrice = totalPrice.add(BigDecimal.valueOf(currentOrder.getDeliveryFee()));
        }
        currentOrder.setCurrentTotalPrice(totalPrice);
        orderDao.updateOrder(currentOrder);
    }

    // 관리자의 주문 반품 요청 승인(반품 요청 -> 반품 중)
    @Transactional(
        isolation = Isolation.REPEATABLE_READ,
        timeout = 5
    )
    public void updateOrderProductReturnApproval(DeliveryInfoDTO returnDeliveryInfoDTO) {
        OrderProduct orderProductCheck = new OrderProduct();
        orderProductCheck.setOrderProductId(returnDeliveryInfoDTO.getOrderProductId());
        orderProductCheck = orderDao.getOrderProduct(orderProductCheck);
        
        // 주문 상품 존재 여부 확인
        if (orderProductCheck == null) {
            throw new OrderException.OrderProductNotFoundException();
        }

        // 주문 상품 상태가 반품 요청 중인 경우에만 통과
        if (orderProductCheck.getStatus() != OrderProductStatus.RETURN_REQUESTED) {
            throw new OrderException.OrderProductRequestException();
        }
        
        // orderProduct 상태 업데이트(낙관적 잠금, 반품 요청 -> 반품 중)
        orderProductCheck.setStatus(OrderProductStatus.RETURNING);
        orderProductCheck.setVersion(returnDeliveryInfoDTO.getVersion());
        updateOrderProductStatusWithOptimisticLock(orderProductCheck);

        // 주문한 상품 변동 이력 정보 생성
        OrderProductHistory newOrderProductHistory = new OrderProductHistory();
        newOrderProductHistory.setOrderProductId(orderProductCheck.getOrderProductId());
        newOrderProductHistory.setRequestQuantityRecord(orderProductCheck.getRequestQuantity());
        newOrderProductHistory.setStatusFrom(OrderProductStatus.RETURN_REQUESTED);
        newOrderProductHistory.setStatusTo(OrderProductStatus.RETURNING);
        newOrderProductHistory.setReason("반품 중");
        orderDao.insertOrderProductHistory(newOrderProductHistory);

        // 주문 당시 deliveryHistory 상태 업데이트(배송완료 -> 반품)
        DeliveryHistory originalDeliveryHistory = orderDao.selectLatestDeliveredDeliveryHistory(returnDeliveryInfoDTO.getOrderProductId());
        originalDeliveryHistory.setDeliveryStatus(DeliveryStatus.RETURN);
        originalDeliveryHistory.setDeliveryStartDate(returnDeliveryInfoDTO.getDeliveryStartDate());
        orderDao.updateDeliveryHistory(originalDeliveryHistory);

        // 반품 deliveryHistory 등록(반품 배송 정보)
        DeliveryHistory returnDeliveryHistory = new DeliveryHistory();
        returnDeliveryHistory.setOrderProductId(returnDeliveryInfoDTO.getOrderProductId());
        returnDeliveryHistory.setDeliveryType(DeliveryType.RETURN_IN);
        returnDeliveryHistory.setInvoiceNumber(returnDeliveryInfoDTO.getInvoiceNumber());
        returnDeliveryHistory.setDeliveryCompany(returnDeliveryInfoDTO.getDeliveryCompany());
        returnDeliveryHistory.setDeliveryStatus(DeliveryStatus.DELIVERING);
        returnDeliveryHistory.setDeliveryStartDate(returnDeliveryInfoDTO.getDeliveryStartDate());
        orderDao.insertDeliveryHistory(returnDeliveryHistory);
    }

    // 관리자의 주문 반품 완료 처리(반품 중 -> 반품 완료)
    @Transactional(
        isolation = Isolation.REPEATABLE_READ,
        timeout = 5
    )
    public void updateOrderProductReturnComplete(DeliveryInfoDTO returnDeliveryInfoDTO) {
        OrderProduct orderProductCheck = new OrderProduct();
        orderProductCheck.setOrderProductId(returnDeliveryInfoDTO.getOrderProductId());
        orderProductCheck = orderDao.getOrderProduct(orderProductCheck);

        // 주문 상품 존재 여부 확인
        if (orderProductCheck == null) {
            throw new OrderException.OrderProductNotFoundException();
        }

        // 주문 상품 상태가 반품 중인 경우에만 통과
        if (orderProductCheck.getStatus() != OrderProductStatus.RETURNING) {
            throw new OrderException.OrderProductRequestException();
        }

        for (String barcode : returnDeliveryInfoDTO.getBarcodes()) {
            // productInventory 조회
            ProductInventory returnProductInventory = new ProductInventory();
            returnProductInventory.setBarcode(barcode);
            returnProductInventory = productDao.getProductInventoryForUpdate(returnProductInventory);

            // status가 OUT_OF_STOCK인 경우에만 통과
            if (returnProductInventory.getStatus() != ProductInventoryStatus.OUT_OF_STOCK) {
                throw new OrderException.OrderProductRequestException();
            }

            // 반품된 기존 productInventory 상태 업데이트(출고 -> 재고)
            returnProductInventory.setStatus(ProductInventoryStatus.IN_STOCK);
            returnProductInventory.setOrderProductId(0);
            productDao.updateProductInventory(returnProductInventory);

            // 반품으로 인한 재고 변동 이력 등록(출고 -> 재고)
            InventoryHistory inventoryHistory = new InventoryHistory();
            inventoryHistory.setProductInventoryId(returnProductInventory.getProductInventoryId());
            inventoryHistory.setOrderProductId(orderProductCheck.getOrderProductId());
            inventoryHistory.setStatusFrom(ProductInventoryStatus.OUT_OF_STOCK);
            inventoryHistory.setStatusTo(ProductInventoryStatus.IN_STOCK);
            productDao.insertInventoryHistory(inventoryHistory);
        }

        // productItem 수량 정보 업데이트(예약 -> 재고)
        productDao.StockRecovery(orderProductCheck);

        // 반품 deliveryHistory 상태 업데이트(반품 중 -> 반품 완료)
        DeliveryHistory deliveryHistory = orderDao.selectLatestDeliveringDeliveryHistory(orderProductCheck.getOrderProductId());
        deliveryHistory.setDeliveryStatus(DeliveryStatus.DELIVERED);
        deliveryHistory.setDeliveryCompleteDate(returnDeliveryInfoDTO.getDeliveryCompleteDate());
        orderDao.updateDeliveryHistory(deliveryHistory);
        
        // orderProduct 상태 업데이트(낙관적 잠금, 반품 중 -> 반품 완료)
        // 전체 반품인 경우 반품 완료로 업데이트
        if (orderProductCheck.getChangedQuantity() == 0) {
            orderProductCheck.setStatus(OrderProductStatus.RETURNED);
        } else {
            // 부분 반품인 경우 배송완료로 업데이트
            orderProductCheck.setStatus(OrderProductStatus.DELIVERED);
        }
        orderProductCheck.setVersion(returnDeliveryInfoDTO.getVersion());
        updateOrderProductStatusWithOptimisticLock(orderProductCheck);

        // 주문한 상품 이력 정보 생성
        OrderProductHistory newOrderProductHistory = new OrderProductHistory();
        newOrderProductHistory.setOrderProductId(orderProductCheck.getOrderProductId());
        newOrderProductHistory.setRequestQuantityRecord(orderProductCheck.getRequestQuantity());
        newOrderProductHistory.setStatusFrom(OrderProductStatus.RETURNING);
        newOrderProductHistory.setStatusTo(OrderProductStatus.RETURNED);
        newOrderProductHistory.setReason("반품 완료");
        orderDao.insertOrderProductHistory(newOrderProductHistory);

        // 주문 마스터 업데이트
        Order order = orderDao.getOrderInfo(orderProductCheck.getOrderId());
        // orderProduct의 changedQuantity와 finalPrice를 곱하여 currentTotalPrice 업데이트
        BigDecimal totalPrice = orderProductCheck.getFinalPrice().multiply(BigDecimal.valueOf(orderProductCheck.getChangedQuantity()));
        // 주문 상품 총 가격이 0이 아니면 배송비 추가
        if (totalPrice.compareTo(BigDecimal.ZERO) != 0) {
            totalPrice = totalPrice.add(BigDecimal.valueOf(order.getDeliveryFee()));
        }
        order.setCurrentTotalPrice(totalPrice);
        orderDao.updateOrder(order);
    }

    // 관리자의 주문 교환 요청 승인(교환 요청 -> 교환 반품 중)
    @Transactional(
        isolation = Isolation.REPEATABLE_READ,
        timeout = 5
    )
    public void updateOrderProductExchangeApproval(DeliveryInfoDTO returnDeliveryInfoDTO) {
        OrderProduct orderProductCheck = new OrderProduct();
        orderProductCheck.setOrderProductId(returnDeliveryInfoDTO.getOrderProductId());
        orderProductCheck = orderDao.getOrderProduct(orderProductCheck);

        // 주문 상품 존재 여부 확인
        if (orderProductCheck == null) {
            throw new OrderException.OrderProductNotFoundException();
        }

        // 주문 상품 상태가 교환 요청인 경우에만 통과    
        if (orderProductCheck.getStatus() != OrderProductStatus.EXCHANGE_REQUESTED) {
            throw new OrderException.OrderProductRequestException();
        }

        // orderProduct 상태 업데이트(낙관적 잠금, 교환 요청 -> 교환 반품 중)
        orderProductCheck.setStatus(OrderProductStatus.EXCHANGE_RETURNING);
        orderProductCheck.setVersion(returnDeliveryInfoDTO.getVersion());
        updateOrderProductStatusWithOptimisticLock(orderProductCheck);

        // 주문한 상품 변동 이력 정보 생성
        OrderProductHistory newOrderProductHistory = new OrderProductHistory();
        newOrderProductHistory.setOrderProductId(orderProductCheck.getOrderProductId());
        newOrderProductHistory.setRequestQuantityRecord(orderProductCheck.getRequestQuantity());
        newOrderProductHistory.setStatusFrom(OrderProductStatus.EXCHANGE_REQUESTED);
        newOrderProductHistory.setStatusTo(OrderProductStatus.EXCHANGE_RETURNING);
        newOrderProductHistory.setReason("교환 반품 중");
        orderDao.insertOrderProductHistory(newOrderProductHistory);

        // 주문 당시 deliveryHistory 상태 업데이트(배송완료 -> 반품)
        DeliveryHistory originalDeliveryHistory = orderDao.selectLatestDeliveredDeliveryHistory(returnDeliveryInfoDTO.getOrderProductId());
        originalDeliveryHistory.setDeliveryStatus(DeliveryStatus.RETURN);
        originalDeliveryHistory.setDeliveryStartDate(returnDeliveryInfoDTO.getDeliveryStartDate());
        orderDao.updateDeliveryHistory(originalDeliveryHistory);

        // 새 deliveryHistory 등록(반품 배송 정보)
        DeliveryHistory exchangeDeliveryHistory = new DeliveryHistory();
        exchangeDeliveryHistory.setOrderProductId(returnDeliveryInfoDTO.getOrderProductId());
        exchangeDeliveryHistory.setDeliveryType(DeliveryType.EXCHANGE_IN);
        exchangeDeliveryHistory.setInvoiceNumber(returnDeliveryInfoDTO.getInvoiceNumber());
        exchangeDeliveryHistory.setDeliveryCompany(returnDeliveryInfoDTO.getDeliveryCompany());
        exchangeDeliveryHistory.setDeliveryStatus(DeliveryStatus.DELIVERING);
        exchangeDeliveryHistory.setDeliveryStartDate(returnDeliveryInfoDTO.getDeliveryStartDate());
        orderDao.insertDeliveryHistory(exchangeDeliveryHistory);
    }

    // 관리자의 주문 교환 준비 처리(교환 반품 중 -> 교환 준비 중)
    @Transactional(
        isolation = Isolation.REPEATABLE_READ,
        timeout = 5
    )
    public void updateOrderProductExchangePrepare(DeliveryInfoDTO returnDeliveryInfoDTO) {
        OrderProduct orderProductCheck = new OrderProduct();
        orderProductCheck.setOrderProductId(returnDeliveryInfoDTO.getOrderProductId());
        orderProductCheck = orderDao.getOrderProduct(orderProductCheck);

        // 주문 상품 존재 여부 확인
        if (orderProductCheck == null) {
            throw new OrderException.OrderProductNotFoundException();
        }

        // 주문 상품 상태가 교환 반품 중인 경우에만 통과
        if (orderProductCheck.getStatus() != OrderProductStatus.EXCHANGE_RETURNING) {
            throw new OrderException.OrderProductRequestException();
        }
        
        for (String barcode : returnDeliveryInfoDTO.getBarcodes()) {
            // 반품된 ProductInventory 조회
            ProductInventory returnProductInventory = new ProductInventory();
            returnProductInventory.setBarcode(barcode);
            returnProductInventory = productDao.getProductInventoryForUpdate(returnProductInventory);

            // 반품된 ProductInventory 상태가 OUT_OF_STOCK인 경우에만 통과
            if (returnProductInventory.getStatus() != ProductInventoryStatus.OUT_OF_STOCK) {
                throw new OrderException.OrderProductRequestException();
            }
        
            // 반품된 기존 ProductInventory 상태 업데이트(출고 -> 재고)
            returnProductInventory.setStatus(ProductInventoryStatus.IN_STOCK);
            returnProductInventory.setOrderProductId(0);
            productDao.updateProductInventory(returnProductInventory);

            // 반품으로 인한 재고 변동 이력 등록(출고 -> 재고)
            InventoryHistory inventoryHistory = new InventoryHistory();
            inventoryHistory.setProductInventoryId(returnProductInventory.getProductInventoryId());
            inventoryHistory.setOrderProductId(orderProductCheck.getOrderProductId());
            inventoryHistory.setStatusFrom(ProductInventoryStatus.OUT_OF_STOCK);
            inventoryHistory.setStatusTo(ProductInventoryStatus.IN_STOCK);
            productDao.insertInventoryHistory(inventoryHistory);

            // productItem 수량 정보 업데이트(예약 1 감소 & 재고 1 증가)
            productDao.decreaseOneReservedStock(returnProductInventory.getProductItemId());
            productDao.increaseOneStock(returnProductInventory.getProductItemId());
        }
        
        // deliveryHistory 상태 업데이트(교환 반품 배송 중 -> 교환 반품 배송 완료)
        DeliveryHistory deliveryHistory = orderDao.selectLatestDeliveringDeliveryHistory(orderProductCheck.getOrderProductId());
        deliveryHistory.setDeliveryStatus(DeliveryStatus.DELIVERED);
        deliveryHistory.setDeliveryCompleteDate(returnDeliveryInfoDTO.getDeliveryCompleteDate());
        orderDao.updateDeliveryHistory(deliveryHistory);

        // orderProduct 상태 업데이트(낙관적 잠금, 교환 반품 중 -> 교환 준비 중)
        orderProductCheck.setStatus(OrderProductStatus.EXCHANGE_PREPARING);
        orderProductCheck.setVersion(returnDeliveryInfoDTO.getVersion());
        updateOrderProductStatusWithOptimisticLock(orderProductCheck);

        // 주문한 상품 변동 이력 정보 생성
        OrderProductHistory newOrderProductHistory = new OrderProductHistory();
        newOrderProductHistory.setOrderProductId(orderProductCheck.getOrderProductId());
        newOrderProductHistory.setRequestQuantityRecord(orderProductCheck.getRequestQuantity());
        newOrderProductHistory.setStatusFrom(OrderProductStatus.EXCHANGE_RETURNING);
        newOrderProductHistory.setStatusTo(OrderProductStatus.EXCHANGE_PREPARING);
        newOrderProductHistory.setReason("교환 제품 준비 중");
        orderDao.insertOrderProductHistory(newOrderProductHistory);
    }

    // 관리자의 주문 교환 배송 처리(교환 준비 중 -> 교환 배송 중)
    @Transactional(
        isolation = Isolation.REPEATABLE_READ,
        timeout = 5
    )
    public void updateOrderProductExchangeDelivering(DeliveryInfoDTO exchangeDeliveryInfoDTO) {
        OrderProduct orderProductCheck = new OrderProduct();
        orderProductCheck.setOrderProductId(exchangeDeliveryInfoDTO.getOrderProductId());
        orderProductCheck = orderDao.getOrderProduct(orderProductCheck);

        // 주문 상품 존재 여부 확인
        if (orderProductCheck == null) {
            throw new OrderException.OrderProductNotFoundException();
        }

        // 주문 상품 상태가 교환 준비중인 경우에만 통과
        if (orderProductCheck.getStatus() != OrderProductStatus.EXCHANGE_PREPARING) {
            throw new OrderException.OrderProductRequestException();
        }

        for (String barcode : exchangeDeliveryInfoDTO.getBarcodes()) {
            // productInventory 조회
            ProductInventory exchangeProductInventory = new ProductInventory();
            exchangeProductInventory.setBarcode(barcode);
            exchangeProductInventory = productDao.getProductInventoryForUpdate(exchangeProductInventory);

            // productInventory 존재 여부 확인
            if (exchangeProductInventory == null) {
                throw new OrderException.OrderProductRequestException();
            }

            // status가 IN_STOCK인 경우에만 통과
            if (exchangeProductInventory.getStatus() != ProductInventoryStatus.IN_STOCK) {
                throw new OrderException.OrderProductRequestException();
            }

            // productInventory 상태 업데이트(재고 -> 출고)
            exchangeProductInventory.setStatus(ProductInventoryStatus.OUT_OF_STOCK);
            productDao.updateProductInventory(exchangeProductInventory);

            // 교환으로 인한 재고 변동 이력 등록(재고 -> 출고)
            InventoryHistory inventoryHistory = new InventoryHistory();
            inventoryHistory.setProductInventoryId(exchangeProductInventory.getProductInventoryId());
            inventoryHistory.setOrderProductId(orderProductCheck.getOrderProductId());
            inventoryHistory.setStatusFrom(ProductInventoryStatus.IN_STOCK);
            inventoryHistory.setStatusTo(ProductInventoryStatus.OUT_OF_STOCK);
            productDao.insertInventoryHistory(inventoryHistory);

            // productItem 수량 정보 업데이트(재고 1 감소 & 예약 1 증가)
            productDao.decreaseOneStock(exchangeProductInventory.getProductItemId());
            productDao.increaseOneReservedStock(exchangeProductInventory.getProductItemId());
        }

        // 교환 배송 deliveryHistory 등록
        DeliveryHistory exchangeDeliveryHistory = new DeliveryHistory();
        exchangeDeliveryHistory.setOrderProductId(exchangeDeliveryInfoDTO.getOrderProductId());
        exchangeDeliveryHistory.setDeliveryType(DeliveryType.EXCHANGE_OUT);
        exchangeDeliveryHistory.setInvoiceNumber(exchangeDeliveryInfoDTO.getInvoiceNumber());
        exchangeDeliveryHistory.setDeliveryCompany(exchangeDeliveryInfoDTO.getDeliveryCompany());
        exchangeDeliveryHistory.setDeliveryStatus(DeliveryStatus.DELIVERING);
        exchangeDeliveryHistory.setDeliveryStartDate(exchangeDeliveryInfoDTO.getDeliveryStartDate());
        orderDao.insertDeliveryHistory(exchangeDeliveryHistory);

        // orderProduct 상태 업데이트(낙관적 잠금, 교환 준비중 -> 교환 배송 중)
        orderProductCheck.setStatus(OrderProductStatus.EXCHANGE_DELIVERING);
        orderProductCheck.setVersion(exchangeDeliveryInfoDTO.getVersion());
        updateOrderProductStatusWithOptimisticLock(orderProductCheck);

        // 주문한 상품 변동 이력 정보 생성
        OrderProductHistory newOrderProductHistory = new OrderProductHistory();
        newOrderProductHistory.setOrderProductId(orderProductCheck.getOrderProductId());
        newOrderProductHistory.setRequestQuantityRecord(orderProductCheck.getRequestQuantity());
        newOrderProductHistory.setStatusFrom(OrderProductStatus.EXCHANGE_PREPARING);
        newOrderProductHistory.setStatusTo(OrderProductStatus.EXCHANGE_DELIVERING);
        newOrderProductHistory.setReason("교환 배송 중");
        orderDao.insertOrderProductHistory(newOrderProductHistory);
    }

    // 배송 이력 정보 조회
    public List<DeliveryHistory> getDeliveryHistory(OrderProductDTO orderProductDTO) {
        OrderProduct orderProductCheck = new OrderProduct();
        orderProductCheck.setOrderProductId(orderProductDTO.getOrderProductId());
        orderProductCheck = orderDao.getOrderProduct(orderProductCheck);

        if (orderProductCheck == null) {
            throw new OrderException.OrderProductNotFoundException();
        }
        return orderDao.getDeliveryHistory(orderProductDTO.getOrderProductId());
    }

    // 주문 수 조회
    public int getOrderCount() {
        return orderDao.getOrderCount();
    }
}
