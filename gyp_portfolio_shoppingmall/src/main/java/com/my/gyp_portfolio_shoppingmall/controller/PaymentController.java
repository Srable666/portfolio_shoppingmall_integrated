package com.my.gyp_portfolio_shoppingmall.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.my.gyp_portfolio_shoppingmall.dto.PaymentDto.CancelRequestDTO;
import com.my.gyp_portfolio_shoppingmall.dto.PaymentDto.PaymentDataDTO;
import com.my.gyp_portfolio_shoppingmall.dto.PaymentDto.PaymentHistorySearchDTO;
import com.my.gyp_portfolio_shoppingmall.dto.PaymentDto.PaymentInfoDTO;
import com.my.gyp_portfolio_shoppingmall.dto.PaymentDto.PaymentPrepareRequestDTO;
import com.my.gyp_portfolio_shoppingmall.dto.PaymentDto.PortOneWebhookDTO;
import com.my.gyp_portfolio_shoppingmall.exception.PaymentException;
import com.my.gyp_portfolio_shoppingmall.exception.PortOneException;
import com.my.gyp_portfolio_shoppingmall.service.PaymentService;
import com.my.gyp_portfolio_shoppingmall.support.PaymentLogSupport;
import com.my.gyp_portfolio_shoppingmall.vo.PaymentHistory;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {
    
    private final PaymentService paymentService;
    
    // 결제 정보 생성(프론트엔드 결제 초기화용)
    @PostMapping("/prepare")
    public ResponseEntity<?> preparePayment(@RequestBody PaymentPrepareRequestDTO requestDTO) {
        try {
            PaymentInfoDTO paymentInfoDTO = paymentService.createPaymentInfo(requestDTO);
            log.info("결제 정보 생성 성공");
            return ResponseEntity.ok(paymentInfoDTO);
        } catch (PaymentException.PaymentRequestException e) {
            log.error("결제 정보 생성 중 요청 오류");
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (PaymentException.InvalidAmountException e) {
            log.error("결제 금액 오류");
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (PaymentException.InvalidProductInfoException e) {
            log.error("상품 정보 오류");
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (PaymentException.InvalidBuyerInfoException e) {
            log.error("구매자 정보 오류");
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("결제 정보 생성 중 알 수 없는 오류 발생 - {}", e.getMessage());
            return ResponseEntity.internalServerError().body("결제 정보 생성 중 알 수 없는 오류가 발생했습니다.");
        }
    }

    // 결제 검증
    @PostMapping("/verify/{paymentId}")
    @Async("paymentTaskExecutor")
    public ResponseEntity<?> verifyPayment(@PathVariable String paymentId) {
        String maskedPaymentId = PaymentLogSupport.maskPaymentId(paymentId);

        try {
            PaymentDataDTO verificationResult = paymentService.verifyPayment(paymentId);
            log.info("결제 검증 성공 - paymentId: {}", maskedPaymentId);
            return ResponseEntity.ok(verificationResult);
        } catch (PortOneException.PaymentVerificationException e) {
            log.error("결제 검증 실패 - paymentId: {}, 사유: {}", maskedPaymentId, e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("결제 데이터 검증 실패 - paymentId: {}, 사유: {}", maskedPaymentId, e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (PortOneException.ServerException e) {
            log.error("결제 검증 중 외부 서비스 오류 발생 - paymentId: {}, 사유: {}", maskedPaymentId, e.getMessage());
            return ResponseEntity.internalServerError().body(e.getMessage());
        } catch (PaymentException.PaymentHistoryException e) {
            log.error("결제 이력 저장 중 오류 발생 - paymentId: {}, 사유: {}", maskedPaymentId, e.getMessage());
            return ResponseEntity.internalServerError().body(e.getMessage());
        } catch (Exception e) {
            log.error("결제 검증 중 알 수 없는 오류 발생 - paymentId: {}, 오류: {}", maskedPaymentId, e.getMessage());
            return ResponseEntity.internalServerError().body("결제 검증 중 알 수 없는 오류가 발생했습니다.");
        }
    }

    // 결제 취소
    @PostMapping("/cancel/{paymentId}")
    public ResponseEntity<?> cancelPayment(
        @PathVariable String paymentId,
        @RequestBody CancelRequestDTO requestDTO
    ) {
        String maskedPaymentId = PaymentLogSupport.maskPaymentId(paymentId);

        try {
            PaymentDataDTO cancellationResult = paymentService.cancelPayment(paymentId, requestDTO.getReason());
            log.info("결제 취소 성공 - paymentId: {}", maskedPaymentId);
            return ResponseEntity.ok(cancellationResult);
        } catch (PortOneException.PaymentCancellationException e) {
            log.error("결제 취소 실패 - paymentId: {}, 사유: {}", maskedPaymentId, e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("잘못된 결제 ID 형식 - paymentId: {}, 사유: {}", maskedPaymentId, e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (PortOneException.ServerException e) {
            log.error("결제 취소 중 외부 서비스 오류 발생 - paymentId: {}, 사유: {}", maskedPaymentId, e.getMessage());
            return ResponseEntity.internalServerError().body(e.getMessage());
        } catch (PaymentException.PaymentHistoryException e) {
            log.error("결제 이력 저장 중 오류 발생 - paymentId: {}, 사유: {}", maskedPaymentId, e.getMessage());
            return ResponseEntity.internalServerError().body(e.getMessage());
        } catch (Exception e) {
            log.error("결제 취소 중 알 수 없는 오류 발생 - paymentId: {}, 오류: {}", maskedPaymentId, e.getMessage());
            return ResponseEntity.internalServerError().body("결제 취소 중 알 수 없는 오류가 발생했습니다.");
        }
    }

    // 웹훅 처리
    @PostMapping("/webhook")
    public ResponseEntity<?> handleWebhook(@RequestBody PortOneWebhookDTO webhookDTO) {
        try {
            paymentService.processWebhook(webhookDTO);
            log.info("웹훅 처리 성공 - status: {}", webhookDTO.getStatus());
            return ResponseEntity.ok("Webhook processed successfully");
        } catch (PortOneException.PaymentVerificationException e) {
            log.error("웹훅 검증 실패 - status: {}, 사유: {}", webhookDTO.getStatus(), e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("잘못된 결제 ID 형식 - impUid: {}, 사유: {}", webhookDTO.getImpUid(), e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (PaymentException.PaymentHistoryException e) {
            log.error("결제 이력 저장 중 오류 발생 - impUid: {}, 사유: {}", webhookDTO.getImpUid(), e.getMessage());
            return ResponseEntity.internalServerError().body(e.getMessage());
        } catch (PortOneException.ServerException e) {
            log.error("웹훅 처리 중 외부 서비스 오류 발생 - 사유: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(e.getMessage());
        } catch (Exception e) {
            log.error("웹훅 처리 중 알 수 없는 오류 발생 - 오류: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("웹훅 처리 중 알 수 없는 오류가 발생했습니다.");
        }
    }

    // 결제 이력 조회(impUid)
    @GetMapping("/history/imp/{impUid}")
    public ResponseEntity<?> getPaymentHistoryByImpUid(@PathVariable String impUid) {
        String maskedImpUid = PaymentLogSupport.maskPaymentId(impUid);

        try {
            PaymentHistory history = paymentService.getPaymentHistoryByImpUid(impUid);
            log.info("결제 이력 조회 성공 - impUid: {}", maskedImpUid);
            return ResponseEntity.ok(history);
        } catch (IllegalArgumentException e) {
            log.warn("잘못된 결제 ID 형식 - impUid: {}", maskedImpUid);
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (PaymentException.PaymentHistoryNotFoundException e) {
            log.warn("결제 이력 없음 - impUid: {}", maskedImpUid);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("결제 이력 조회 중 알 수 없는 오류 발생 - impUid: {}, 오류: {}", maskedImpUid, e.getMessage());
            return ResponseEntity.internalServerError().body("결제 이력 조회 중 알 수 없는 오류가 발생했습니다.");
        }
    }

    // 결제 이력 조회(merchantUid)
    @GetMapping("/history/merchant/{merchantUid}")
    public ResponseEntity<?> getPaymentHistoryByMerchantUid(@PathVariable String merchantUid) {        
        String maskedMerchantUid = PaymentLogSupport.maskPaymentId(merchantUid);

        try {
            PaymentHistory history = paymentService.getPaymentHistoryByMerchantUid(merchantUid);
            log.info("결제 이력 조회 성공 - merchantUid: {}", maskedMerchantUid);
            return ResponseEntity.ok(history);
        } catch (IllegalArgumentException e) {
            log.warn("잘못된 주문번호 형식 - merchantUid: {}, 사유: {}", maskedMerchantUid, e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (PaymentException.PaymentHistoryNotFoundException e) {
            log.warn("결제 이력 없음 - merchantUid: {}", maskedMerchantUid);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("결제 이력 조회 중 알 수 없는 오류 발생 - merchantUid: {}, 오류: {}", maskedMerchantUid, e.getMessage());
            return ResponseEntity.internalServerError().body("결제 이력 조회 중 알 수 없는 오류가 발생했습니다.");
        }
    }

    // 결제 이력 조회(orderId)
    @GetMapping("/history/order/{orderId}")
    public ResponseEntity<?> getPaymentHistoryByOrderId(@PathVariable String orderId) {
        String maskedOrderId = PaymentLogSupport.maskPaymentId(orderId);

        try {
            PaymentHistory history = paymentService.getPaymentHistoryByOrderId(orderId);
            log.info("결제 이력 조회 성공 - orderId: {}", maskedOrderId);
            return ResponseEntity.ok(history);
        } catch (IllegalArgumentException e) {
            log.warn("잘못된 주문 ID 형식 - orderId: {}, 사유: {}", maskedOrderId, e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (PaymentException.PaymentHistoryNotFoundException e) {
            log.warn("결제 이력 없음 - orderId: {}", maskedOrderId);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("결제 이력 조회 중 알 수 없는 오류 발생 - orderId: {}, 오류: {}", maskedOrderId, e.getMessage());
            return ResponseEntity.internalServerError().body("결제 이력 조회 중 알 수 없는 오류가 발생했습니다.");
        }
    }

    // 결제 이력 검색
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/historyListForAdmin")
    public ResponseEntity<?> searchPaymentHistory(
        @ModelAttribute PaymentHistorySearchDTO searchDTO
    ) {        
        try {
            List<PaymentHistory> result = paymentService.searchPaymentHistory(searchDTO);
            log.info("결제 이력 검색 성공 - {}", searchDTO);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            log.warn("잘못된 검색 조건 - searchDTO: {}, 사유: {}", searchDTO, e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("결제 이력 검색 중 알 수 없는 오류 발생 - searchDTO: {}, 오류: {}", searchDTO, e.getMessage());
            return ResponseEntity.internalServerError().body("결제 이력 검색 중 알 수 없는 오류가 발생했습니다.");
        }
    }    

    // 총 매출 조회
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/totalRevenue")
    public ResponseEntity<?> getTotalRevenue() {
        try {
            BigDecimal totalRevenue = paymentService.getTotalRevenue();
            return ResponseEntity.ok(totalRevenue);
        } catch (Exception e) {
            log.error("총 매출 조회 중 알 수 없는 오류 발생 - 오류: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 총 매출 조회에 실패했습니다.");
        }
    }

    // 총 결제 수 조회
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/count")
    public ResponseEntity<?> getPaymentCount() {
        return ResponseEntity.ok(paymentService.getPaymentCount());
    }
}
