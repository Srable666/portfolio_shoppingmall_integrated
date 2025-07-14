package com.my.gyp_portfolio_shoppingmall.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.my.gyp_portfolio_shoppingmall.dto.OrderDto.DeliveryInfoDTO;
import com.my.gyp_portfolio_shoppingmall.dto.OrderDto.NewOrderDTO;
import com.my.gyp_portfolio_shoppingmall.dto.OrderDto.OrderDTO;
import com.my.gyp_portfolio_shoppingmall.dto.OrderDto.OrderListForAdminDTO;
import com.my.gyp_portfolio_shoppingmall.dto.OrderDto.OrderProductDTO;
import com.my.gyp_portfolio_shoppingmall.dto.OrderDto.UserOrderHistoryDTO;
import com.my.gyp_portfolio_shoppingmall.exception.OptimisticLockingException;
import com.my.gyp_portfolio_shoppingmall.exception.OrderException;
import com.my.gyp_portfolio_shoppingmall.exception.ProductException;
import com.my.gyp_portfolio_shoppingmall.exception.UserException;
import com.my.gyp_portfolio_shoppingmall.service.OrderService;
import com.my.gyp_portfolio_shoppingmall.vo.DeliveryHistory;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("api/order")
public class OrderController {
    
    private final OrderService orderService;

    // 주문 접수
    @PreAuthorize("hasRole('ROLE_USER')")
    @PostMapping("/insertOrder")
    public ResponseEntity<?> insertOrder(@RequestBody NewOrderDTO newOrderDTO) {
        try {       
            orderService.insertOrder(newOrderDTO);
            return ResponseEntity.ok("주문 접수가 완료되었습니다.");
        } catch (ProductException.ProductNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (ProductException.ProductItemQuantityException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (ProductException.ProductItemNotSaleException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("주문 접수 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 주문 접수에 실패했습니다.");
        }
    }

    // 관리자용 주문 상품 상태 업데이트(결제 완료 -> 준비중)
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/updateOrderProductStatusToPaymentCompleted")
    public ResponseEntity<?> updateOrderProductStatusToPaymentCompleted(@RequestBody List<OrderProductDTO> orderProductDTOList) {
        try {
            orderService.updateOrderProductStatusToPaymentCompleted(orderProductDTOList);
            return ResponseEntity.ok("주문 상태 업데이트가 완료되었습니다.");
        } catch (OrderException.OrderNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (OrderException.OrderProductNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (OrderException.OrderProductRequestException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (OptimisticLockingException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("주문 상태 업데이트 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 주문 상태 업데이트에 실패했습니다.");
        }
    }

    // 관리자용 주문 내역 업데이트(결제 완료 -> 준비중)
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/manuallyUpdateOrderProductStatusToPreparing")
    public ResponseEntity<?> manuallyUpdateOrderProductStatusToPreparing(@RequestBody List<OrderProductDTO> orderProductDTOList) {
        try {
            orderService.manuallyUpdateOrderProductStatusToPreparing(orderProductDTOList);
            return ResponseEntity.ok("주문 상태 업데이트가 완료되었습니다.");
        } catch (OrderException.OrderNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (OrderException.OrderProductRequestException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (OptimisticLockingException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("주문 상태 업데이트 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 주문 상태 업데이트에 실패했습니다.");
        }
    }

    // 관리자용 주문 내역 업데이트(준비중 -> 배송중)
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/updateOrderProductStatusToDelivering")
    public ResponseEntity<?> updateOrderProductStatusToDelivering(@RequestBody DeliveryInfoDTO deliveryInfoDTO) {
        try {
            orderService.updateOrderProductStatusToDelivering(deliveryInfoDTO);
            return ResponseEntity.ok("주문 상태 업데이트가 완료되었습니다.");
        } catch (OrderException.OrderProductNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (OrderException.OrderProductRequestException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (ProductException.ProductInventoryNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (ProductException.ProductInventoryRequestException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (OptimisticLockingException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("주문 상태 업데이트 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 주문 상태 업데이트에 실패했습니다.");
        }
    }

    // 관리자용 주문 내역 업데이트(배송중 -> 배송완료)
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/updateOrderStatusToDelivered")
    public ResponseEntity<?> updateOrderStatusToDelivered(@RequestBody DeliveryInfoDTO deliveryInfoDTO) {
        try {
            orderService.updateOrderStatusToDelivered(deliveryInfoDTO);
            return ResponseEntity.ok("주문 상태 업데이트가 완료되었습니다.");
        } catch (OrderException.OrderProductNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (OrderException.OrderProductRequestException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (OptimisticLockingException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("주문 상태 업데이트 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 주문 상태 업데이트에 실패했습니다.");
        }
    }

    // 주문 내역 업데이트(배송완료 -> 구매확정 / 회원 본인 & 관리자 접근 가능)
    @PreAuthorize("hasRole('ROLE_USER') or hasRole('ROLE_ADMIN')")
    @PostMapping("/updateOrderStatusToDeliveryConfirmed")
    public ResponseEntity<?> updateOrderStatusToDeliveryConfirmed(@RequestBody OrderProductDTO orderProductDTO) {
        try {
            orderService.updateOrderStatusToDeliveryConfirmed(orderProductDTO);
            return ResponseEntity.ok("주문 상태 업데이트가 완료되었습니다.");
        } catch (OrderException.OrderNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (OrderException.OrderProductNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (OrderException.OrderProductRequestException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (OptimisticLockingException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("주문 상태 업데이트 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 주문 상태 업데이트에 실패했습니다.");
        }
    }

    // 회원 주문 내역 목록 조회(회원 본인만 접근 가능)
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/orderList")
    public ResponseEntity<?> getOrderList() {
        try {
            List<UserOrderHistoryDTO> userOrderHistoryDTOList = orderService.getUserOrderHistoryList();
            return ResponseEntity.ok(userOrderHistoryDTOList);
        } catch (UserException.UserNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("주문 목록 조회 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 주문 목록 조회에 실패했습니다.");
        }
    }

    // 단일 주문 상세 조회(회원 본인 & 관리자 접근 가능)
    @PreAuthorize("hasRole('ROLE_USER') or hasRole('ROLE_ADMIN')")
    @GetMapping("/orderDetail")
    public ResponseEntity<?> getOrderDetail(@ModelAttribute OrderDTO orderDTO) {
        try {
            UserOrderHistoryDTO userOrderHistoryDTO = orderService.getOrderHistoryDetail(orderDTO);
            return ResponseEntity.ok(userOrderHistoryDTO);
        } catch (OrderException.OrderNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("주문 목록 조회 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 주문 목록 조회에 실패했습니다.");
        }
    }

    // 관리자용 전체 주문 상품 리스트 조회(검색 조건 포함)
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/orderListForAdmin")
    public ResponseEntity<?> getOrderListForAdmin(@ModelAttribute OrderListForAdminDTO orderListForAdminDTO) {
        try {
            List<UserOrderHistoryDTO> orderListForAdminDTOList = orderService.getOrderListForAdmin(orderListForAdminDTO);
            return ResponseEntity.ok(orderListForAdminDTOList);
        } catch (Exception e) {
            log.error("주문 목록 조회 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 주문 목록 조회에 실패했습니다.");
        }
    }

    // 회원 주문 상품 취소/반품/교환 요청
    @PreAuthorize("hasRole('ROLE_USER')")
    @PostMapping("/updateOrderProductRequest")
    public ResponseEntity<?> updateOrderProductRequest(@RequestBody OrderProductDTO orderProductDTO) {
        try {
            orderService.updateOrderProductRequest(orderProductDTO);
            return ResponseEntity.ok("요청이 완료되었습니다.");
        } catch (OrderException.OrderNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (OrderException.OrderProductNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (OrderException.OrderProductRequestException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (OrderException.OrderProductStockException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (OptimisticLockingException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("주문 취소/반품/교환 요청 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 주문 취소/반품/교환 요청에 실패했습니다.");
        }
    }

    // 관리자용 주문 취소 요청 승인(배송 이전)
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/updateOrderProductCancelApproval")
    public ResponseEntity<?> updateOrderProductCancelApproval(@RequestBody OrderProductDTO cancelOrderProductDTO) {
        try {
            orderService.updateOrderProductCancelApproval(cancelOrderProductDTO);
            return ResponseEntity.ok("주문 취소 요청 승인이 완료되었습니다.");
        } catch (OrderException.OrderProductNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (OrderException.OrderProductRequestException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (OptimisticLockingException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("주문 취소 요청 승인 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 주문 취소 요청 승인에 실패했습니다.");
        }
    }

    // 관리자용 주문 반품 요청 승인(반품 요청 -> 반품 중)
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/updateOrderProductReturnApproval")
    public ResponseEntity<?> updateOrderProductReturnApproval(@RequestBody DeliveryInfoDTO returnDeliveryInfoDTO) {
        try {
            orderService.updateOrderProductReturnApproval(returnDeliveryInfoDTO);
            return ResponseEntity.ok("주문 반품 요청 승인이 완료되었습니다.");
        } catch (OrderException.OrderProductNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (OrderException.OrderProductRequestException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (OptimisticLockingException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("주문 반품 요청 승인 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 주문 반품 요청 승인에 실패했습니다.");
        }
    }

    // 관리자용 주문 반품 완료 처리(반품 중 -> 반품 완료)
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/updateOrderProductReturnComplete")
    public ResponseEntity<?> updateOrderProductReturnComplete(@RequestBody DeliveryInfoDTO returnDeliveryInfoDTO) {
        try {
            orderService.updateOrderProductReturnComplete(returnDeliveryInfoDTO);
            return ResponseEntity.ok("주문 반품 완료 처리가 완료되었습니다.");
        } catch (OrderException.OrderProductNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (OrderException.OrderProductRequestException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (OptimisticLockingException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("주문 반품 완료 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 주문 반품 완료 처리에 실패했습니다.");
        }
    }
    
    // 관리자의 주문 교환 요청 승인(교환 요청 -> 교환 반품 중)
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/updateOrderProductExchangeApproval")
    public ResponseEntity<?> updateOrderProductExchangeApproval(@RequestBody DeliveryInfoDTO returnDeliveryInfoDTO) {
        try {
            orderService.updateOrderProductExchangeApproval(returnDeliveryInfoDTO);
            return ResponseEntity.ok("주문 교환 요청 승인이 완료되었습니다.");
        } catch (OrderException.OrderProductNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (OrderException.OrderProductRequestException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (OptimisticLockingException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("주문 교환 요청 승인 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 주문 교환 요청 승인에 실패했습니다.");
        }
    }
    
    // 관리자의 주문 반품 준비 처리(교환 반품중 -> 교환 준비중)
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/updateOrderProductExchangePrepare")
    public ResponseEntity<?> updateOrderProductExchangePrepare(@RequestBody DeliveryInfoDTO returnDeliveryInfoDTO) {
        try {
            orderService.updateOrderProductExchangePrepare(returnDeliveryInfoDTO);
            return ResponseEntity.ok("주문 교환 준비중 처리가 완료되었습니다.");
        } catch (OrderException.OrderProductNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (OrderException.OrderProductRequestException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (OptimisticLockingException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("주문 교환 준비 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 주문 교환 준비 처리에 실패했습니다.");
        }
    }

    // 관리자의 주문 교환 완료 처리(교환 준비중 -> 교환 배송중)
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/updateOrderProductExchangeDelivering")
    public ResponseEntity<?> updateOrderProductExchangeDelivering(@RequestBody DeliveryInfoDTO exchangeDeliveryInfoDTO) {
        try {
            orderService.updateOrderProductExchangeDelivering(exchangeDeliveryInfoDTO);
            return ResponseEntity.ok("주문 교환 배송중 처리가 완료되었습니다.");
        } catch (OrderException.OrderProductNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (OrderException.OrderProductRequestException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (OptimisticLockingException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("주문 교환 배송중 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 주문 교환 배송중 처리에 실패했습니다.");
        }
    }

    // 배송 이력 정보 조회
    @PreAuthorize("hasRole('ROLE_USER') or hasRole('ROLE_ADMIN')")
    @GetMapping("/getDeliveryHistory")
    public ResponseEntity<?> getDeliveryHistory(@ModelAttribute OrderProductDTO orderProductDTO) {
        try {
            List<DeliveryHistory> deliveryHistoryList = orderService.getDeliveryHistory(orderProductDTO);
            return ResponseEntity.ok(deliveryHistoryList);
        } catch (OrderException.OrderProductNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("배송 이력 조회 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 배송 이력 조회에 실패했습니다.");
        }
    }

    // 주문 수 조회
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/count")
    public ResponseEntity<?> getOrderCount() {
        try {
            int orderCount = orderService.getOrderCount();
            return ResponseEntity.ok(orderCount);
        } catch (Exception e) {
            log.error("주문 수 조회 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 주문 수 조회에 실패했습니다.");
        }
    }
}
