package com.my.gyp_portfolio_shoppingmall.service;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.EnumSet;
import java.util.List;
import java.util.Objects;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.my.gyp_portfolio_shoppingmall.dao.OrderDao;
import com.my.gyp_portfolio_shoppingmall.dao.PaymentHistoryDao;
import com.my.gyp_portfolio_shoppingmall.dao.ProductDao;
import com.my.gyp_portfolio_shoppingmall.dao.UserDao;
import com.my.gyp_portfolio_shoppingmall.dto.PaymentDto.BuyerInfoDTO;
import com.my.gyp_portfolio_shoppingmall.dto.PaymentDto.CancelRequestDTO;
import com.my.gyp_portfolio_shoppingmall.dto.PaymentDto.PaymentDataDTO;
import com.my.gyp_portfolio_shoppingmall.dto.PaymentDto.PaymentDataDTO.CustomerDTO;
import com.my.gyp_portfolio_shoppingmall.dto.PaymentDto.PaymentHistorySearchDTO;
import com.my.gyp_portfolio_shoppingmall.dto.PaymentDto.PaymentHistorySearchResultDTO;
import com.my.gyp_portfolio_shoppingmall.dto.PaymentDto.PaymentInfoDTO;
import com.my.gyp_portfolio_shoppingmall.dto.PaymentDto.PaymentPrepareRequestDTO;
import com.my.gyp_portfolio_shoppingmall.dto.PaymentDto.PortOneResponseDTO;
import com.my.gyp_portfolio_shoppingmall.dto.PaymentDto.PortOneWebhookDTO;
import com.my.gyp_portfolio_shoppingmall.dto.PaymentDto.VirtualAccountDTO;
import com.my.gyp_portfolio_shoppingmall.dto.PaymentDto.VirtualAccountRequestDTO;
import com.my.gyp_portfolio_shoppingmall.enums.OrderEnums.DeliveryStatus;
import com.my.gyp_portfolio_shoppingmall.enums.OrderEnums.DeliveryType;
import com.my.gyp_portfolio_shoppingmall.enums.OrderEnums.OrderProductStatus;
import com.my.gyp_portfolio_shoppingmall.enums.OrderEnums.PaymentMethod;
import com.my.gyp_portfolio_shoppingmall.enums.PaymentEnums.PaymentStatus;
import com.my.gyp_portfolio_shoppingmall.exception.PaymentException;
import com.my.gyp_portfolio_shoppingmall.exception.PortOneException;
import com.my.gyp_portfolio_shoppingmall.support.EmailSender;
import com.my.gyp_portfolio_shoppingmall.support.PhoneEncryptionUtil;
import com.my.gyp_portfolio_shoppingmall.vo.DeliveryHistory;
import com.my.gyp_portfolio_shoppingmall.vo.Order;
import com.my.gyp_portfolio_shoppingmall.vo.OrderProduct;
import com.my.gyp_portfolio_shoppingmall.vo.OrderProductHistory;
import com.my.gyp_portfolio_shoppingmall.vo.PaymentHistory;
import com.my.gyp_portfolio_shoppingmall.vo.User;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional(
    isolation = Isolation.REPEATABLE_READ,
    timeout = 10
)
public class PaymentService {

    private final String baseUrl;
    private final UserDao userDao;
    private final OrderDao orderDao;
    private final ProductDao productDao;
    private final EmailSender emailSender;
    private final OrderService orderService;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final PaymentHistoryDao paymentHistoryDao;
    private final PortOneApiService portOneApiService;
    private final PhoneEncryptionUtil phoneEncryptionUtil;

    // 생성자 주입
    public PaymentService(
        PortOneApiService portOneApiService, 
        RestTemplate restTemplate, 
        OrderDao orderDao, 
        ProductDao productDao, 
        OrderService orderService, 
        PaymentHistoryDao paymentHistoryDao, 
        ObjectMapper objectMapper, 
        EmailSender emailSender, 
        UserDao userDao, 
        PhoneEncryptionUtil phoneEncryptionUtil
    ) {
        this.portOneApiService = portOneApiService;
        this.restTemplate = restTemplate;
        this.orderDao = orderDao;
        this.productDao = productDao;
        this.orderService = orderService;
        this.paymentHistoryDao = paymentHistoryDao;
        this.baseUrl = portOneApiService.getBaseUrl();
        this.objectMapper = objectMapper;
        this.emailSender = emailSender;
        this.userDao = userDao;
        this.phoneEncryptionUtil = phoneEncryptionUtil;
    }

    // 결제 요청에 필요한 정보 생성(프론트엔드에서 포트원 SDK 초기화 용도)
    public PaymentInfoDTO createPaymentInfo(PaymentPrepareRequestDTO requestDTO) {
        // 기본 요청 정보 검증
        validateBasicPaymentRequest(requestDTO);

        // 결제 정보 생성
        PaymentInfoDTO paymentInfoDTO = new PaymentInfoDTO();
        paymentInfoDTO.setStoreId(portOneApiService.getStoreId());
        paymentInfoDTO.setChannelKey(portOneApiService.getClientKey());
        paymentInfoDTO.setOrderCode(requestDTO.getOrderCode());
        paymentInfoDTO.setAmount(requestDTO.getAmount());
        paymentInfoDTO.setProductName(requestDTO.getProductName());
        
        // 구매자 정보 설정
        BuyerInfoDTO buyer = createBuyerInfo(requestDTO);
        paymentInfoDTO.setBuyer(buyer);
        
        return paymentInfoDTO;
    }

    // 결제 검증
    public PaymentDataDTO verifyPayment(String paymentId) {
        // 입력값 검증
        if (!StringUtils.hasText(paymentId)) {
            savePaymentHistory(
                createErrorPaymentData(paymentId, null, "결제 ID가 없습니다."),
                "VERIFICATION_ERROR",
                "결제 ID가 없습니다."
            );
            throw new PortOneException.PaymentVerificationException("결제 ID가 없습니다.");
        }
    
        // API 요청 및 응답 처리
        PaymentDataDTO responseData = requestPaymentVerification(paymentId);
        
        // 결제 상태 검증
        if (!"PAID".equals(responseData.getStatus()) && !"READY".equals(responseData.getStatus())) {
            String errorMessage = "결제 상태가 올바르지 않습니다: " + responseData.getStatus();
            savePaymentHistory(
                createErrorPaymentData(paymentId, responseData.getOrderRef(), errorMessage),
                "VERIFICATION_ERROR",
                errorMessage
            );
            throw new PortOneException.PaymentVerificationException("결제 상태가 올바르지 않습니다: " + responseData.getStatus());
        }
        
        // 결제 이력 저장 (성공)
        savePaymentHistory(responseData, null, null);
        
        return responseData;
    }
    
    // 결제 취소
    public PaymentDataDTO cancelPayment(String paymentId, String reason) {
        // 입력값 검증
        if (!StringUtils.hasText(paymentId)) {
            savePaymentHistory(
                createErrorPaymentData(paymentId, null, "결제 ID가 없습니다."),
                "CANCELLATION_ERROR",
                "결제 ID가 없습니다."
            );
            throw new PortOneException.PaymentCancellationException("결제 ID가 없습니다.");
        }
        if (!StringUtils.hasText(reason)) {
            savePaymentHistory(
                createErrorPaymentData(paymentId, null, "취소 사유가 없습니다."),
                "CANCELLATION_ERROR",
                "취소 사유가 없습니다."
            );
            throw new PortOneException.PaymentCancellationException("취소 사유가 없습니다.");
        }

        // API 요청 및 응답 처리
        PaymentDataDTO responseData = requestPortOneCancellation(paymentId, reason);
        
        // 취소 상태 검증
        if (!"CANCELLED".equals(responseData.getStatus())) {
            String errorMessage = "결제 취소 상태가 올바르지 않습니다: " + responseData.getStatus();
            savePaymentHistory(
                createErrorPaymentData(paymentId, responseData.getOrderRef(), errorMessage),
                "CANCELLATION_ERROR",
                errorMessage
            );
            throw new PortOneException.PaymentCancellationException(
                "결제 취소 상태가 올바르지 않습니다: " + responseData.getStatus()
            );
        }
        
        // 결제 이력 저장 (취소 성공)
        savePaymentHistory(responseData, null, "결제 취소 처리 완료");
        
        return responseData;
    }

    // 가상계좌 발급
    public VirtualAccountDTO requestVirtualAccount(String paymentId, String customerName, String bankCode) {
        // 입력값 검증
        if (!StringUtils.hasText(paymentId)) {
            savePaymentHistory(
                createErrorPaymentData(paymentId, null, "결제 ID가 없습니다."),
                "VIRTUAL_ACCOUNT_ERROR",
                "결제 ID가 없습니다."
            );
            throw new PortOneException.PaymentRequestException("결제 ID가 없습니다.");
        }
        if (!StringUtils.hasText(customerName)) {
            savePaymentHistory(
                createErrorPaymentData(paymentId, null, "고객명이 없습니다."),
                "VIRTUAL_ACCOUNT_ERROR",
                "고객명이 없습니다."
            );
            throw new PortOneException.PaymentRequestException("고객명이 없습니다.");
        }
        if (!StringUtils.hasText(bankCode)) {
            savePaymentHistory(
                createErrorPaymentData(paymentId, null, "은행 코드가 없습니다."),
                "VIRTUAL_ACCOUNT_ERROR",
                "은행 코드가 없습니다."
            );
            throw new PortOneException.PaymentRequestException("은행 코드가 없습니다.");
        }

        // API 요청 및 응답 처리
        VirtualAccountDTO responseData = requestVirtualAccountIssuance(paymentId, customerName, bankCode);
        
        // 가상계좌 상태 검증
        if (responseData == null || responseData.getAccountNumber() == null) {
            savePaymentHistory(
                createErrorPaymentData(paymentId, null, "가상계좌 발급 데이터가 올바르지 않습니다."),
                "VIRTUAL_ACCOUNT_ERROR",
                "가상계좌 발급 데이터가 올바르지 않습니다."
            );
            throw new PortOneException.PaymentRequestException("가상계좌 발급 데이터가 올바르지 않습니다.");
        }
        
        // 결제 이력 저장 (가상계좌 발급 성공)
        PaymentDataDTO paymentData = new PaymentDataDTO();
        paymentData.setId(paymentId);
        paymentData.setStatus("READY");
        paymentData.setVirtualAccountInfo(convertToVirtualAccountInfo(responseData));        
        savePaymentHistory(paymentData, null, "가상계좌 발급 완료");
    
        return responseData;
    }

    // 포트원 웹훅 처리
    public void processWebhook(PortOneWebhookDTO webhookDTO) {
        if (webhookDTO == null) {
            savePaymentHistory(
                createErrorPaymentData(null, null, "웹훅 데이터가 없습니다."),
                "WEBHOOK_ERROR",
                "웹훅 데이터가 없습니다."
            );
            throw new PortOneException.PaymentVerificationException("웹훅 데이터가 없습니다.");
        }

        // 결제 정보 조회 및 검증
        String impUid = webhookDTO.getImpUid();
        String merchantUid = webhookDTO.getMerchantUid();
        if (!StringUtils.hasText(impUid) || !StringUtils.hasText(merchantUid)) {
            savePaymentHistory(
                createErrorPaymentData(impUid, merchantUid, "결제 ID 또는 주문번호가 누락되었습니다."),
                "WEBHOOK_ERROR",
                "결제 ID 또는 주문번호가 누락되었습니다."
            );
            throw new PortOneException.PaymentVerificationException("결제 ID 또는 주문번호가 누락되었습니다.");
        }

        // 결제 정보 검증
        PaymentDataDTO paymentData = verifyPayment(impUid);

        // 주문 정보 검증
        Order order = orderDao.getOrderInfoByMerchantUid(merchantUid);        
        if (order == null) {
            savePaymentHistory(
                createErrorPaymentData(impUid, merchantUid, "주문을 찾을 수 없습니다."),
                "WEBHOOK_ERROR",
                "주문을 찾을 수 없습니다: " + merchantUid
            );
            throw new PortOneException.PaymentVerificationException("주문을 찾을 수 없습니다: " + merchantUid);
        }

        // 결제 금액 검증
        long webhookAmount = webhookDTO.getAmount();
        long actualAmount = paymentData.getAmount().getTotal();
        if (actualAmount != webhookAmount) {
            String errorMessage = String.format("결제 금액 불일치. 웹훅: %s원, 실제: %s원", webhookAmount, actualAmount);
            savePaymentHistory(
                createErrorPaymentData(impUid, merchantUid, errorMessage),
                "WEBHOOK_ERROR",
                errorMessage
            );
            throw new PortOneException.PaymentVerificationException(
                String.format("결제 금액 불일치. 웹훅: %s원, 실제: %s원", webhookAmount, actualAmount)
            );
        }

        // 결제 상태별 처리
        switch (webhookDTO.getStatus()) {
            case "PAID" -> handlePaidStatus(webhookDTO, order);
            case "FAILED" -> handleFailedStatus(webhookDTO, order);
            case "CANCELLED" -> handleCancelledStatus(webhookDTO, order);
            default -> {
                String message = "처리되지 않은 결제 상태: " + webhookDTO.getStatus();
                savePaymentHistory(
                    createErrorPaymentData(impUid, merchantUid, message),
                    "WEBHOOK_ERROR",
                    message
                );
                log.warn(message);
                savePaymentHistory(
                    createErrorPaymentData(impUid, merchantUid, message),
                    "WEBHOOK_ERROR",
                    message
                );
                throw new PortOneException.PaymentVerificationException(message);
            }
        }
    }


    /**
     * 포트원 결제 ID(imp_uid)로 결제 이력을 조회
     *
     * @param impUid 포트원 결제 ID
     * @return 결제 이력 정보
     * @throws PaymentException.PaymentHistoryNotFoundException 결제 이력을 찾을 수 없는 경우
     * @throws IllegalArgumentException 유효하지 않은 결제 ID가 입력된 경우
     */
    public PaymentHistory getPaymentHistoryByImpUid(String impUid) {
        // 입력값 검증
        if (!StringUtils.hasText(impUid)) {
            savePaymentHistory(
                createErrorPaymentData(impUid, null, "결제 ID가 없습니다."),
                "PAYMENT_HISTORY_NOT_FOUND",
                "결제 ID가 없습니다."
            );
            throw new IllegalArgumentException("결제 ID가 없습니다.");
        }
        if (!impUid.startsWith("imp_")) {
            savePaymentHistory(
                createErrorPaymentData(impUid, null, "유효하지 않은 포트원 결제 ID 형식입니다."),
                "PAYMENT_HISTORY_NOT_FOUND",
                "유효하지 않은 포트원 결제 ID 형식입니다."
            );
            throw new IllegalArgumentException("유효하지 않은 포트원 결제 ID 형식입니다.");
        }

        // 결제 이력 조회
        PaymentHistory paymentHistory = paymentHistoryDao.selectPaymentHistoryByPaymentId(impUid);

        // 조회 결과 검증
        if (paymentHistory == null) {
            savePaymentHistory(
                createErrorPaymentData(impUid, null, "결제 이력을 찾을 수 없습니다."),
                "PAYMENT_HISTORY_NOT_FOUND",
                "결제 이력을 찾을 수 없습니다."
            );
            throw new PaymentException.PaymentHistoryNotFoundException(
                String.format("결제 이력을 찾을 수 없습니다. (결제ID: %s)", impUid)
            );
        }

        paymentHistory.setCustomerPhone(phoneEncryptionUtil.decrypt(paymentHistory.getCustomerPhone()));

        return paymentHistory;
    }

    /**
     * 주문번호(merchant_uid)로 결제 이력을 조회
     *
     * @param merchantUid 주문번호
     * @return 결제 이력 정보
     * @throws PaymentException.PaymentHistoryNotFoundException 결제 이력을 찾을 수 없는 경우
     * @throws IllegalArgumentException 유효하지 않은 주문번호가 입력된 경우
     */
    public PaymentHistory getPaymentHistoryByMerchantUid(String merchantUid) {
        // 입력값 검증
        if (!StringUtils.hasText(merchantUid)) {
            savePaymentHistory(
                createErrorPaymentData(null, merchantUid, "주문번호가 없습니다."),
                "PAYMENT_HISTORY_NOT_FOUND",
                "주문번호가 없습니다."
            );
            throw new IllegalArgumentException("주문번호가 없습니다.");
        }        
        String merchantUidPattern = "^ORD_\\d{8}_\\d{6}$";
        if (!merchantUid.matches(merchantUidPattern)) {
            savePaymentHistory(
                createErrorPaymentData(null, merchantUid, "유효하지 않은 주문번호 형식입니다."),
                "PAYMENT_HISTORY_NOT_FOUND",
                "유효하지 않은 주문번호 형식입니다."
            );
            throw new IllegalArgumentException(
                "유효하지 않은 주문번호 형식입니다. (예: ORD_20240101_123456)"
            );
        }

        // 결제 이력 조회
        PaymentHistory paymentHistory = paymentHistoryDao.selectPaymentHistoryByMerchantUid(merchantUid);

        // 조회 결과 검증
        if (paymentHistory == null) {
            savePaymentHistory(
                createErrorPaymentData(null, merchantUid, "결제 이력을 찾을 수 없습니다."),
                "PAYMENT_HISTORY_NOT_FOUND",
                "결제 이력을 찾을 수 없습니다."
            );
            throw new PaymentException.PaymentHistoryNotFoundException(
                String.format("결제 이력을 찾을 수 없습니다. (주문번호: %s)", merchantUid)
            );
        }

        paymentHistory.setCustomerPhone(phoneEncryptionUtil.decrypt(paymentHistory.getCustomerPhone()));

        return paymentHistory;
    }

    /**
     * 주문 ID로 결제 이력을 조회
     *
     * @param orderId 주문 ID
     * @return 결제 이력 정보
     * @throws PaymentException.PaymentHistoryNotFoundException 결제 이력을 찾을 수 없는 경우
     * @throws IllegalArgumentException 유효하지 않은 주문 ID가 입력된 경우
     */
    public PaymentHistory getPaymentHistoryByOrderId(String orderId) {
        // 입력값 검증
        if (!StringUtils.hasText(orderId)) {
            savePaymentHistory(
                createErrorPaymentData(null, orderId, "주문 ID가 없습니다."),
                "PAYMENT_HISTORY_NOT_FOUND",
                "주문 ID가 없습니다."
            );
            throw new IllegalArgumentException("주문 ID가 없습니다.");
        }
        String uuidPattern = "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$";
        if (!orderId.matches(uuidPattern)) {
            savePaymentHistory(
                createErrorPaymentData(null, orderId, "유효하지 않은 주문 ID 형식입니다."),
                "PAYMENT_HISTORY_NOT_FOUND",
                "유효하지 않은 주문 ID 형식입니다."
            );
            throw new IllegalArgumentException(
                "유효하지 않은 주문 ID 형식입니다. UUID 형식이어야 합니다."
            );
        }

        // 결제 이력 조회
        PaymentHistory paymentHistory = paymentHistoryDao.selectPaymentHistoryByOrderId(orderId);

        // 조회 결과 검증
        if (paymentHistory == null) {
            savePaymentHistory(
                createErrorPaymentData(null, orderId, "결제 이력을 찾을 수 없습니다."),
                "PAYMENT_HISTORY_NOT_FOUND",
                "결제 이력을 찾을 수 없습니다."
            );
            throw new PaymentException.PaymentHistoryNotFoundException(
                String.format("결제 이력을 찾을 수 없습니다. (주문 ID: %s)", orderId)
            );
        }

        paymentHistory.setCustomerPhone(phoneEncryptionUtil.decrypt(paymentHistory.getCustomerPhone()));

        return paymentHistory;
    }

    /**
     * 결제 이력을 검색 조건에 따라 조회합니다.
     *
     * @param searchDTO 검색 조건을 담은 DTO
     * @return 검색 조건에 맞는 결제 이력 목록
     * @throws IllegalArgumentException 유효하지 않은 검색 조건이 입력된 경우
     */
    public PaymentHistorySearchResultDTO searchPaymentHistory(PaymentHistorySearchDTO searchDTO) {
        // 검색 조건 검증
        validateSearchConditions(searchDTO);
        
        // 결제 이력 검색 실행
        List<PaymentHistory> histories = paymentHistoryDao.searchPaymentHistory(searchDTO);
        for (PaymentHistory paymentHistory : histories) {
            paymentHistory.setCustomerPhone(phoneEncryptionUtil.decrypt(paymentHistory.getCustomerPhone()));
        }
        
        // 검색 결과가 없는 경우 빈 리스트 반환
        histories = (histories != null) ? histories : Collections.emptyList();
        
        // 검색 결과 DTO 생성
        PaymentHistorySearchResultDTO resultDTO = new PaymentHistorySearchResultDTO();
        resultDTO.setItems(histories);
        resultDTO.setTotalCount(histories.size());
        resultDTO.setCurrentPage(calculateCurrentPage(searchDTO.getOffset(), searchDTO.getSize()));
        resultDTO.setPageSize(searchDTO.getSize());
        
        return resultDTO;
    }

    // 총 매출 조회
    public BigDecimal getTotalRevenue() {
        return BigDecimal.valueOf(paymentHistoryDao.getTotalRevenue());
    }
    

    // API 요청 및 응답 처리
    private PaymentDataDTO requestPaymentVerification(String paymentId) {
        String url = baseUrl + "/payments/" + paymentId;
        HttpEntity<Void> request = new HttpEntity<>(portOneApiService.createAuthHeaders());
        
        ResponseEntity<PortOneResponseDTO<PaymentDataDTO>> response = restTemplate.exchange(
            url, 
            HttpMethod.GET, 
            request, 
            new ParameterizedTypeReference<PortOneResponseDTO<PaymentDataDTO>>() {}
        );
            
        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            // 결제 정보 조회 실패 DB 저장
            handlePaymentVerificationError(
                paymentId, 
                "API_ERROR", 
                "결제 정보 조회 실패"
            );
            throw new PortOneException.ServerException("결제 정보 조회 실패: " + response.getStatusCode());
        }
        
        return Objects.requireNonNull(response.getBody()).getResponse();
    }

    // 결제 검증 에러 DB 저장
    private void handlePaymentVerificationError(String paymentId, String errorCode, String errorMessage) {
        PaymentDataDTO errorPaymentDataDTO = new PaymentDataDTO();
        errorPaymentDataDTO.setId(paymentId);
        errorPaymentDataDTO.setStatus("FAILED");

        savePaymentHistory(errorPaymentDataDTO, errorCode, errorMessage);
    }

    // API 요청 및 응답 처리
    private PaymentDataDTO requestPortOneCancellation(String paymentId, String reason) {
        String url = baseUrl + "/payments/" + paymentId + "/cancel";
            
        // 요청 본문 생성
        CancelRequestDTO requestBody = new CancelRequestDTO();
        requestBody.setReason(reason);
            
        // API 요청 객체 생성
        HttpEntity<CancelRequestDTO> request = new HttpEntity<>(
            requestBody, 
            portOneApiService.createAuthHeaders()
        );

        // API 호출
        ResponseEntity<PortOneResponseDTO<PaymentDataDTO>> response = restTemplate.exchange(
            url, 
            HttpMethod.POST, 
            request, 
            new ParameterizedTypeReference<PortOneResponseDTO<PaymentDataDTO>>() {}
        );
            
        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            handlePaymentCancellationError(
                paymentId, 
                "API_ERROR", 
                "결제 취소 실패: " + response.getStatusCode()
            );
            throw new PortOneException.ServerException("결제 취소 실패: " + response.getStatusCode());
        }
        
        return Objects.requireNonNull(response.getBody()).getResponse();
    }

    // 결제 취소 에러 처리
    private void handlePaymentCancellationError(String paymentId, String errorCode, String errorMessage) {
        PaymentDataDTO errorPaymentDataDTO = new PaymentDataDTO();
        errorPaymentDataDTO.setId(paymentId);
        errorPaymentDataDTO.setStatus("FAILED");
        savePaymentHistory(errorPaymentDataDTO, errorCode, errorMessage);
    }

    // 결제 요청 기본 정보 검증
    private void validateBasicPaymentRequest(PaymentPrepareRequestDTO requestDTO) {
        // null 체크
        if (requestDTO == null) {
            savePaymentHistory(
                createErrorPaymentData(null, null, "결제 요청 정보가 없습니다."),
                "PAYMENT_PREPARE_ERROR",
                "결제 요청 정보가 없습니다."
            );
            throw new PaymentException.PaymentRequestException("결제 요청 정보가 없습니다.");
        }

        // 주문 번호 검증
        if (!StringUtils.hasText(requestDTO.getOrderCode())) {
            savePaymentHistory(
                createErrorPaymentData(null, requestDTO.getOrderCode(), "주문 번호가 없습니다."),
                "PAYMENT_PREPARE_ERROR",
                "주문 번호가 없습니다."
            );
            throw new PaymentException.PaymentRequestException("주문 번호가 없습니다.");
        }

        // 결제 금액 검증
        if (requestDTO.getAmount() <= 0) {
            savePaymentHistory(
                createErrorPaymentData(null, requestDTO.getOrderCode(), "결제 금액이 유효하지 않습니다."),
                "PAYMENT_PREPARE_ERROR",
                "결제 금액이 유효하지 않습니다."
            );
            throw new PaymentException.InvalidAmountException();
        }

        // 상품명 검증
        if (!StringUtils.hasText(requestDTO.getProductName())) {
            savePaymentHistory(
                createErrorPaymentData(null, requestDTO.getOrderCode(), "상품명이 없습니다."),
                "PAYMENT_PREPARE_ERROR",
                "상품명이 없습니다."
            );
            throw new PaymentException.InvalidProductInfoException();
        }

        // 구매자 기본 정보 검증
        if (!StringUtils.hasText(requestDTO.getBuyerName())) {
            savePaymentHistory(
                createErrorPaymentData(null, requestDTO.getOrderCode(), "구매자 이름이 없습니다."),
                "PAYMENT_PREPARE_ERROR",
                "구매자 이름이 없습니다."
            );
            throw new PaymentException.InvalidBuyerInfoException("이름");
        }
        if (!StringUtils.hasText(requestDTO.getBuyerEmail())) {
            savePaymentHistory(
                createErrorPaymentData(null, requestDTO.getOrderCode(), "구매자 이메일이 없습니다."),
                "PAYMENT_PREPARE_ERROR",
                "구매자 이메일이 없습니다."
            );
            throw new PaymentException.InvalidBuyerInfoException("이메일");
        }
    }

    // 구매자 정보 생성
    private BuyerInfoDTO createBuyerInfo(PaymentPrepareRequestDTO requestDTO) {
        BuyerInfoDTO buyer = new BuyerInfoDTO();
        buyer.setName(requestDTO.getBuyerName());
        buyer.setEmail(requestDTO.getBuyerEmail());
        buyer.setTel(requestDTO.getBuyerTel());
        return buyer;
    }


    // API 요청 및 응답 처리
    private VirtualAccountDTO requestVirtualAccountIssuance(String paymentId, String customerName, String bankCode) {
        String url = baseUrl + "/payments/" + paymentId + "/virtual-account";
        
        // 요청 본문 생성
        VirtualAccountRequestDTO requestBody = new VirtualAccountRequestDTO();
        requestBody.setCustomerName(customerName);
        requestBody.setBankCode(bankCode);
        
        // API 요청 객체 생성
        HttpEntity<VirtualAccountRequestDTO> request = new HttpEntity<>(
            requestBody, 
            portOneApiService.createAuthHeaders()
        );
    
        // API 호출
        ResponseEntity<PortOneResponseDTO<VirtualAccountDTO>> response = restTemplate.exchange(
            url, 
            HttpMethod.POST, 
            request, 
            new ParameterizedTypeReference<PortOneResponseDTO<VirtualAccountDTO>>() {}
        );
            
        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            handleVirtualAccountError(
                paymentId, 
                "API_ERROR", 
                "가상계좌 발급 실패: " + response.getStatusCode()
            );
            throw new PortOneException.ServerException("가상계좌 발급 실패: " + response.getStatusCode());
        }
        
        return Objects.requireNonNull(response.getBody()).getResponse();
    }

    // 가상계좌 에러 처리
    private void handleVirtualAccountError(String paymentId, String errorCode, String errorMessage) {
        PaymentDataDTO errorPaymentDataDTO = new PaymentDataDTO();
        errorPaymentDataDTO.setId(paymentId);
        errorPaymentDataDTO.setStatus("FAILED");
        savePaymentHistory(errorPaymentDataDTO, errorCode, errorMessage);
    }

    // VirtualAccountDTO를 PaymentDataDTO.VirtualAccountInfoDTO로 변환
    private PaymentDataDTO.VirtualAccountInfoDTO convertToVirtualAccountInfo(VirtualAccountDTO virtualAccount) {
        PaymentDataDTO.VirtualAccountInfoDTO info = new PaymentDataDTO.VirtualAccountInfoDTO();
        info.setAccountNumber(virtualAccount.getAccountNumber());
        info.setBankCode(virtualAccount.getBankCode());
        info.setBankName(virtualAccount.getBankName());
        info.setHolderName(virtualAccount.getCustomerName());
        return info;
    }

    // 결제 에러 데이터 생성
    public PaymentDataDTO createErrorPaymentData(String impUid, String merchantUid, String errorMessage) {
        PaymentDataDTO errorPaymentDataDTO = new PaymentDataDTO();
        errorPaymentDataDTO.setId(impUid);
        errorPaymentDataDTO.setOrderRef(merchantUid);
        errorPaymentDataDTO.setStatus("ERROR");
        return errorPaymentDataDTO;
    }

    
    // 결제 완료 처리
    private void handlePaidStatus(PortOneWebhookDTO webhookDTO, Order order) {
        // 주문 상품 목록 조회 및 검증
        List<OrderProduct> orderProducts = getAndValidateOrderProducts(order.getOrderId());

        // 결제 이력 저장
        savePaymentCompletionHistory(webhookDTO);

        // 주문 상품 상태 업데이트 및 이력 생성
        updateOrderProductsStatus(orderProducts);

        // 배송 정보 생성
        createDeliveryHistories(orderProducts);

        // 결제 완료 이메일 발송
        sendPaymentCompletionEmail(order, webhookDTO);

        log.info("결제 완료 처리 성공 - 주문번호: {}", webhookDTO.getMerchantUid());
    }

    // 결제 실패 처리
    private void handleFailedStatus(PortOneWebhookDTO webhookDTO, Order order) {
        // 주문 상품 목록 조회 및 검증
        List<OrderProduct> orderProducts = getAndValidateOrderProducts(order.getOrderId());

        // 결제 실패 이력 저장
        savePaymentFailureHistory(webhookDTO);

        // 주문 상품 처리
        handleFailedOrderProducts(orderProducts);

        // 주문 금액 초기화
        updateOrderAmount(order);

        log.info("결제 실패 처리 완료 - 주문번호: {}, 실패 사유: {}", 
            webhookDTO.getMerchantUid(), 
            getFailureReason(webhookDTO)
        );
    }

    // 결제 취소 처리
    private void handleCancelledStatus(PortOneWebhookDTO webhookDTO, Order order) {
        // 주문 상품 목록 조회 및 검증
        List<OrderProduct> orderProducts = getAndValidateOrderProducts(order.getOrderId());

        // 결제 취소 이력 저장
        savePaymentCancellationHistory(webhookDTO);

        // 주문 상품 처리
        handleCancelledOrderProducts(orderProducts);

        // 주문 금액 초기화
        updateOrderAmount(order);

        log.info("결제 취소 처리 완료 - 주문번호: {}, 취소 시각: {}, 취소 금액: {}", 
            webhookDTO.getMerchantUid(),
            webhookDTO.getCancelledAt(), 
            webhookDTO.getCancelAmount()
        );
    }


    // 주문 상품 목록 조회 및 검증
    private List<OrderProduct> getAndValidateOrderProducts(Integer orderId) {
        OrderProduct query = new OrderProduct();
        query.setOrderId(orderId);
        List<OrderProduct> orderProducts = orderDao.getOrderProductList(query);

        if (orderProducts.isEmpty()) {
            savePaymentHistory(
                createErrorPaymentData(null, null, "주문 상품이 없습니다."),
                "PAYMENT_HISTORY_NOT_FOUND",
                "주문 상품이 없습니다."
            );
            throw new PortOneException.PaymentVerificationException("주문 상품이 없습니다.");
        }

        return orderProducts;
    }

    // 주문 상품 상태 검증
    private void validateOrderProductStatus(OrderProduct orderProduct) {
        if (orderProduct.getStatus() != OrderProductStatus.PAYMENT_PENDING) {
            savePaymentHistory(
                createErrorPaymentData(null, null, "처리 불가능한 주문 상태: " + orderProduct.getStatus() + " (주문상품ID: " + orderProduct.getOrderProductId() + ")"),
                "PAYMENT_HISTORY_NOT_FOUND",
                "처리 불가능한 주문 상태: " + orderProduct.getStatus() + " (주문상품ID: " + orderProduct.getOrderProductId() + ")"
            );
            throw new PortOneException.PaymentVerificationException(
                String.format("처리 불가능한 주문 상태: %s (주문상품ID: %s)", 
                    orderProduct.getStatus(),
                    orderProduct.getOrderProductId())
            );
        }
    }

    // 실패한 주문 상품 상태 검증
    private void validateFailedOrderProductStatus(OrderProduct orderProduct) {
            if (orderProduct.getStatus() != OrderProductStatus.PAYMENT_PENDING) {
                savePaymentHistory(
                    createErrorPaymentData(null, null, "처리 불가능한 주문 상태: " + orderProduct.getStatus() + " (주문상품ID: " + orderProduct.getOrderProductId() + ")"),
                    "PAYMENT_HISTORY_NOT_FOUND",
                    "처리 불가능한 주문 상태: " + orderProduct.getStatus() + " (주문상품ID: " + orderProduct.getOrderProductId() + ")"
                );
                throw new PortOneException.PaymentVerificationException(
                String.format("처리 불가능한 주문 상태: %s (주문상품ID: %s)", 
                    orderProduct.getStatus(),
                    orderProduct.getOrderProductId())
            );
        }
    }

    // 주문 상품 상태 업데이트
    private void updateOrderProductStatus(OrderProduct orderProduct) {
        orderProduct.setStatus(OrderProductStatus.PAYMENT_COMPLETED);
        orderService.updateOrderProductStatusWithOptimisticLock(orderProduct);
    }

    // 주문 상품 이력 생성
    private void createOrderProductHistory(OrderProduct orderProduct) {
        OrderProductHistory history = new OrderProductHistory();
        history.setOrderProductId(orderProduct.getOrderProductId());
        history.setStatusFrom(OrderProductStatus.PAYMENT_PENDING);
        history.setStatusTo(OrderProductStatus.PAYMENT_COMPLETED);
        history.setReason("결제 완료 후 상품 준비중");
        orderDao.insertOrderProductHistory(history);
    }

    // 주문 상품 상태 업데이트 및 이력 생성
    private void updateOrderProductsStatus(List<OrderProduct> orderProducts) {
        for (OrderProduct orderProduct : orderProducts) {
            validateOrderProductStatus(orderProduct);
            updateOrderProductStatus(orderProduct);
            createOrderProductHistory(orderProduct);
        }
    }

    // 실패한 주문 상품 처리
    private void handleFailedOrderProducts(List<OrderProduct> orderProducts) {
        for (OrderProduct orderProduct : orderProducts) {
            validateFailedOrderProductStatus(orderProduct);
            recoverProductStock(orderProduct);
            updateFailedOrderProductStatus(orderProduct);
            createFailedOrderProductHistory(orderProduct);
        }
    }

    // 취소된 주문 상품 처리
    private void handleCancelledOrderProducts(List<OrderProduct> orderProducts) {
        for (OrderProduct orderProduct : orderProducts) {
            validateCancellableOrderStatus(orderProduct);
            recoverProductStock(orderProduct);
            OrderProductStatus prevStatus = updateCancelledOrderProductStatus(orderProduct);
            createCancelledOrderProductHistory(orderProduct, prevStatus);
            updateDeliveryStatusIfNeeded(orderProduct, prevStatus);
        }
    }

    // 실패한 주문 상품 상태 업데이트
    private void updateFailedOrderProductStatus(OrderProduct orderProduct) {
        orderProduct.setChangedQuantity(0);
        orderProduct.setFinalPrice(BigDecimal.ZERO);
        orderProduct.setStatus(OrderProductStatus.CANCELLED);

        orderService.updateOrderProductStatusWithOptimisticLock(orderProduct);
    }

    // 실패한 주문 상품 이력 생성
    private void createFailedOrderProductHistory(OrderProduct orderProduct) {
        OrderProductHistory history = new OrderProductHistory();
        history.setOrderProductId(orderProduct.getOrderProductId());
        history.setStatusFrom(OrderProductStatus.PAYMENT_PENDING);
        history.setStatusTo(OrderProductStatus.CANCELLED);
        history.setReason("결제 실패로 인한 주문 취소");

        orderDao.insertOrderProductHistory(history);
    }

    // 주문 금액 초기화
    private void updateOrderAmount(Order order) {
        order.setCurrentTotalPrice(BigDecimal.ZERO);
        orderDao.updateOrder(order);
    }

    // 취소된 주문 상품 이력 생성
    private void createCancelledOrderProductHistory(OrderProduct orderProduct, OrderProductStatus prevStatus) {
        OrderProductHistory history = new OrderProductHistory();
        history.setOrderProductId(orderProduct.getOrderProductId());
        history.setStatusFrom(prevStatus);
        history.setStatusTo(OrderProductStatus.CANCELLED);
        history.setReason("결제 취소 처리");

        orderDao.insertOrderProductHistory(history);
    }

    // 주문 취소 가능 상태 검증
    private void validateCancellableOrderStatus(OrderProduct orderProduct) {
        if (orderProduct.getStatus() != OrderProductStatus.PAYMENT_PENDING && 
            orderProduct.getStatus() != OrderProductStatus.PREPARING) {
            savePaymentHistory(
                createErrorPaymentData(null, null, "취소 불가능한 주문 상태: " + orderProduct.getStatus() + " (주문상품ID: " + orderProduct.getOrderProductId() + ")"),
                "PAYMENT_HISTORY_NOT_FOUND",
                "취소 불가능한 주문 상태: " + orderProduct.getStatus() + " (주문상품ID: " + orderProduct.getOrderProductId() + ")"
            );
            throw new PortOneException.PaymentCancellationException(
            String.format("취소 불가능한 주문 상태: %s (주문상품ID: %s)", 
                orderProduct.getStatus(),
                orderProduct.getOrderProductId())
            );
        }
    }

    // 재고 원복 처리
    private void recoverProductStock(OrderProduct orderProduct) {
        productDao.StockRecoveryForPortOne(orderProduct);
    }

    // 취소된 주문 상품 상태 업데이트
    private OrderProductStatus updateCancelledOrderProductStatus(OrderProduct orderProduct) {
        OrderProductStatus prevStatus = orderProduct.getStatus();
        orderProduct.setChangedQuantity(0);
        orderProduct.setFinalPrice(BigDecimal.ZERO);
        orderProduct.setStatus(OrderProductStatus.CANCELLED);

        orderService.updateOrderProductStatusWithOptimisticLock(orderProduct);

        return prevStatus;
    }


    /**
     * 결제 이력을 저장
     * 
     * @param paymentDataDTO 결제 정보 DTO
     * @param errorCode 오류 코드 (오류 발생 시)
     * @param errorMessage 오류 메시지 (오류 발생 시)
     * @throws PaymentException.PaymentHistoryException 결제 이력 저장 중 오류 발생 시
     */
    public void savePaymentHistory(PaymentDataDTO paymentDataDTO, String errorCode, String errorMessage) {
        if (paymentDataDTO == null) {
            savePaymentHistory(
                createErrorPaymentData(null, null, "결제 데이터가 없습니다."),
                "PAYMENT_HISTORY_SAVE_ERROR",
                "결제 데이터가 없습니다."
            );
            throw new IllegalArgumentException("결제 데이터가 없습니다.");
        }

        PaymentHistory history = createPaymentHistory(paymentDataDTO);
        
        // 오류 정보 설정
        history.setErrorCode(errorCode);
        history.setErrorMessage(errorMessage);
        
        // 전체 데이터 JSON으로 저장
        try {
            history.setPaymentData(objectMapper.writeValueAsString(paymentDataDTO));
        } catch (JsonProcessingException e) {
            log.error("결제 데이터 JSON 변환 실패: {}", e.getMessage());
            savePaymentHistory(
                createErrorPaymentData(null, null, "결제 데이터 JSON 변환 중 오류가 발생했습니다."),
                "PAYMENT_HISTORY_SAVE_ERROR",
                "결제 데이터 JSON 변환 중 오류가 발생했습니다."
            );
            throw new PaymentException.PaymentHistoryException("결제 데이터 JSON 변환 중 오류가 발생했습니다.");
        }
        
        // 데이터베이스에 저장
        int result = paymentHistoryDao.insertPaymentHistory(history);        
        if (result <= 0) {
            savePaymentHistory(
                createErrorPaymentData(null, null, "결제 이력 저장에 실패했습니다."),
                "PAYMENT_HISTORY_SAVE_ERROR",
                "결제 이력 저장에 실패했습니다."
            );
            throw new PaymentException.PaymentHistoryException("결제 이력 저장에 실패했습니다.");
        }       
    }

    // PaymentDataDTO로부터 PaymentHistory 엔티티를 생성
    private PaymentHistory createPaymentHistory(PaymentDataDTO paymentDataDTO) {
        PaymentHistory history = new PaymentHistory();
        
        // 필수 정보 검증 및 설정
        validateAndSetRequiredFields(history, paymentDataDTO);
        
        // 주문 정보 연결
        setOrderInfo(history, paymentDataDTO.getOrderRef());
        
        // 결제 금액 설정
        setPaymentAmount(history, paymentDataDTO);
        
        // 고객 정보 설정
        setCustomerInfo(history, paymentDataDTO.getCustomer());
        
        // 시간 정보 설정
        if (paymentDataDTO.getRequestedAt() != null) {
            history.setRequestedAt(paymentDataDTO.getRequestedAt().toLocalDateTime());
        }
        
        return history;
    }

    // 필수 필드 검증 및 설정
    private void validateAndSetRequiredFields(PaymentHistory history, PaymentDataDTO paymentDataDTO) {
        if (StringUtils.hasText(paymentDataDTO.getId())) {
            savePaymentHistory(
                createErrorPaymentData(null, null, "ImpUid가 없습니다."),
                "PAYMENT_HISTORY_NOT_FOUND",
                "ImpUid가 없습니다."
            );
            throw new IllegalArgumentException("ImpUid가 없습니다.");
        }
        if (StringUtils.hasText(paymentDataDTO.getOrderRef())) {
            savePaymentHistory(
                createErrorPaymentData(null, null, "MerchantUid가 없습니다."),
                "PAYMENT_HISTORY_NOT_FOUND",
                "MerchantUid가 없습니다."
            );
            throw new IllegalArgumentException("MerchantUid가 없습니다.");
        }
        if (StringUtils.hasText(paymentDataDTO.getStatus())) {
            savePaymentHistory(
                createErrorPaymentData(null, null, "결제 상태가 없습니다."),
                "PAYMENT_HISTORY_NOT_FOUND",
                "결제 상태가 없습니다."
            );
            throw new IllegalArgumentException("결제 상태가 없습니다.");
        }
        if (StringUtils.hasText(paymentDataDTO.getMethod())) {
            savePaymentHistory(
                createErrorPaymentData(null, null, "결제 방법이 없습니다."),
                "PAYMENT_HISTORY_NOT_FOUND",
                "결제 방법이 없습니다."
            );
            throw new IllegalArgumentException("결제 방법이 없습니다.");
        }

        history.setImpUid(paymentDataDTO.getId());
        history.setMerchantUid(paymentDataDTO.getOrderRef());
        history.setStatus(PaymentStatus.valueOf(paymentDataDTO.getStatus()));
        history.setPaymentMethod(PaymentMethod.valueOf(paymentDataDTO.getMethod()));
    }
            
    // 주문 정보 설정
    private void setOrderInfo(PaymentHistory history, String merchantUid) {
        Order order = orderDao.getOrderInfoByMerchantUid(merchantUid);
        if (order != null) {
            history.setOrderId(order.getOrderId());
        } else {
            log.warn("주문 정보를 찾을 수 없습니다.");
            savePaymentHistory(
                createErrorPaymentData(null, null, "주문 정보를 찾을 수 없습니다."),
                "PAYMENT_HISTORY_NOT_FOUND",
                "주문 정보를 찾을 수 없습니다."
            );
            throw new PaymentException.PaymentHistoryException(
                "결제 이력 저장 실패: 주문 정보를 찾을 수 없습니다."
            );
        }
    }
    
    // 결제 금액 설정
    private void setPaymentAmount(PaymentHistory history, PaymentDataDTO paymentDataDTO) {
        if (paymentDataDTO.getAmount() != null) {
            history.setAmount(BigDecimal.valueOf(paymentDataDTO.getAmount().getTotal()));
        } else {
            log.warn("결제 금액 정보가 없습니다.");
            savePaymentHistory(
                createErrorPaymentData(null, null, "결제 금액 정보를 찾을 수 없습니다."),
                "PAYMENT_HISTORY_NOT_FOUND",
                "결제 금액 정보를 찾을 수 없습니다."
            );
            throw new PaymentException.PaymentHistoryException(
                "결제 이력 저장 실패: 결제 금액 정보를 찾을 수 없습니다."
            );
        }
    }
    
    // 고객 정보 설정
    private void setCustomerInfo(PaymentHistory history, CustomerDTO customer) {
        if (customer != null) {
            history.setCustomerName(customer.getName());
            history.setCustomerEmail(customer.getEmail());
            history.setCustomerPhone(phoneEncryptionUtil.encrypt(customer.getPhoneNumber()));
        } else {
            log.warn("고객 정보가 없습니다.");
            savePaymentHistory(
                createErrorPaymentData(null, null, "고객 정보를 찾을 수 없습니다."),
                "PAYMENT_HISTORY_NOT_FOUND",
                "고객 정보를 찾을 수 없습니다."
            );
            throw new PaymentException.PaymentHistoryException(
                "결제 이력 저장 실패: 고객 정보를 찾을 수 없습니다."
            );
        }
    }

    // 결제 완료 이력 저장
    private void savePaymentCompletionHistory(PortOneWebhookDTO webhookDTO) {
        PaymentDataDTO paymentDataDTO = createPaymentDataFromWebhook(webhookDTO);
        savePaymentHistory(paymentDataDTO, null, null);
    }

    // 결제 실패 이력 저장
    private void savePaymentFailureHistory(PortOneWebhookDTO webhookDTO) {
        PaymentDataDTO paymentDataDTO = new PaymentDataDTO();
        paymentDataDTO.setId(webhookDTO.getImpUid());
        paymentDataDTO.setOrderRef(webhookDTO.getMerchantUid());
        paymentDataDTO.setStatus("FAILED");

        PaymentDataDTO.PaymentAmountDTO amount = new PaymentDataDTO.PaymentAmountDTO();
        amount.setTotal(webhookDTO.getAmount());  // long 타입 사용
        paymentDataDTO.setAmount(amount);

        savePaymentHistory(
            paymentDataDTO, 
            "PAYMENT_FAILED",
            getFailureReason(webhookDTO)
        );
    }

    // 결제 취소 이력 저장
    private void savePaymentCancellationHistory(PortOneWebhookDTO webhookDTO) {
        PaymentDataDTO paymentDataDTO = new PaymentDataDTO();
        paymentDataDTO.setId(webhookDTO.getImpUid());
        paymentDataDTO.setOrderRef(webhookDTO.getMerchantUid());
        paymentDataDTO.setStatus("CANCELLED");

        PaymentDataDTO.PaymentAmountDTO amount = new PaymentDataDTO.PaymentAmountDTO();
        amount.setTotal(webhookDTO.getAmount());  // long 타입 사용
        paymentDataDTO.setAmount(amount);

        savePaymentHistory(paymentDataDTO, null, "결제 취소 처리");
    }


    // 배송 정보 생성
    private void createDeliveryHistories(List<OrderProduct> orderProducts) {
        for (OrderProduct orderProduct : orderProducts) {
            DeliveryHistory deliveryHistory = new DeliveryHistory();
            deliveryHistory.setOrderProductId(orderProduct.getOrderProductId());
            deliveryHistory.setDeliveryType(DeliveryType.ORDER_OUT);
            deliveryHistory.setDeliveryStatus(DeliveryStatus.PREPARING);
            orderDao.insertDeliveryHistory(deliveryHistory);
        }
    }

    // 배송 상태 업데이트 (필요한 경우)
    private void updateDeliveryStatusIfNeeded(OrderProduct orderProduct, OrderProductStatus prevStatus) {
        if (prevStatus == OrderProductStatus.PREPARING) {
            DeliveryHistory deliveryHistory = 
                orderDao.selectLatestPreparingDeliveryHistory(orderProduct.getOrderProductId());
            if (deliveryHistory != null) {
                deliveryHistory.setDeliveryStatus(DeliveryStatus.CANCELLED);
                orderDao.updateDeliveryHistory(deliveryHistory);
            }
        }
    }


    // 결제 완료 이메일 발송
    private void sendPaymentCompletionEmail(Order order, PortOneWebhookDTO webhookDTO) {
        User user = userDao.findByUserId(order.getUserId());
        if (user != null) {
            try {
                emailSender.sendPaymentCompletedEmail(
                    user.getEmail(),
                    user.getName(),
                    webhookDTO.getMerchantUid(),
                    BigDecimal.valueOf(webhookDTO.getAmount())
                );
            } catch (Exception e) {
                // 이메일 발송 실패는 전체 프로세스를 중단시키지 않음
                log.error("결제 완료 이메일 발송 실패 - 주문번호: {}, 에러: {}", 
                    webhookDTO.getMerchantUid(), 
                    e.getMessage()
                );
                savePaymentHistory(
                    createErrorPaymentData(null, null, "결제 완료 이메일 발송 실패 - 주문번호: " + webhookDTO.getMerchantUid() + ", 에러: " + e.getMessage()),
                    "PAYMENT_HISTORY_NOT_FOUND",
                    "결제 완료 이메일 발송 실패 - 주문번호: " + webhookDTO.getMerchantUid() + ", 에러: " + e.getMessage()
                );
            }
        }
    }



    // 검색 조건 검증
    private void validateSearchConditions(PaymentHistorySearchDTO searchDTO) {
        // 비어있는 검색 조건 검증
        if (searchDTO == null) {
            savePaymentHistory(
                createErrorPaymentData(null, null, "검색 조건이 없습니다."),
                "PAYMENT_HISTORY_SEARCH_ERROR",
                "검색 조건이 없습니다."
            );
            throw new IllegalArgumentException("검색 조건이 없습니다.");
        }

        // 날짜 범위 검증
        if (searchDTO.getStartDate() != null && searchDTO.getEndDate() != null) {
            if (searchDTO.getStartDate().isAfter(searchDTO.getEndDate())) {
                savePaymentHistory(
                    createErrorPaymentData(null, null, "시작일이 종료일보다 늦을 수 없습니다."),
                    "PAYMENT_HISTORY_SEARCH_ERROR",
                    "시작일이 종료일보다 늦을 수 없습니다."
                );
                throw new IllegalArgumentException("시작일이 종료일보다 늦을 수 없습니다.");
            }
        }

        // 결제 금액 검증
        if (searchDTO.getAmount() < 0) {
            savePaymentHistory(
                createErrorPaymentData(null, null, "결제 금액은 0 이상이어야 합니다."),
                "PAYMENT_HISTORY_SEARCH_ERROR",
                "결제 금액은 0 이상이어야 합니다."
            );
            throw new IllegalArgumentException("결제 금액은 0 이상이어야 합니다.");
        }

        // 결제 상태 검증
        if (searchDTO.getStatus() != null && 
            !EnumSet.allOf(PaymentStatus.class).contains(searchDTO.getStatus())) {
            savePaymentHistory(
                createErrorPaymentData(null, null, "유효하지 않은 결제 상태입니다."),
                "PAYMENT_HISTORY_SEARCH_ERROR",
                "유효하지 않은 결제 상태입니다."
            );
            throw new IllegalArgumentException("유효하지 않은 결제 상태입니다.");
        }

        // 결제 방법 검증
        if (searchDTO.getPaymentMethod() != null && 
            !EnumSet.allOf(PaymentMethod.class).contains(searchDTO.getPaymentMethod())) {
            savePaymentHistory(
                createErrorPaymentData(null, null, "유효하지 않은 결제 방법입니다."),
                "PAYMENT_HISTORY_SEARCH_ERROR",
                "유효하지 않은 결제 방법입니다."
            );
            throw new IllegalArgumentException("유효하지 않은 결제 방법입니다.");
        }
    }
    

    // offset과 size를 기반으로 현재 페이지 번호를 계산
    private int calculateCurrentPage(int offset, int size) {
        return (offset / size) + 1;
    }

    // 실패 사유 조회
    private String getFailureReason(PortOneWebhookDTO webhookDTO) {
        return webhookDTO.getFailedAt() != null ? "결제 시간 초과" : "결제 오류";
    }

    // 웹훅 데이터로부터 결제 데이터 생성
    private PaymentDataDTO createPaymentDataFromWebhook(PortOneWebhookDTO webhookDTO) {
        PaymentDataDTO paymentDataDTO = new PaymentDataDTO();
        paymentDataDTO.setId(webhookDTO.getImpUid());
        paymentDataDTO.setOrderRef(webhookDTO.getMerchantUid());
        paymentDataDTO.setStatus("PAID");

        PaymentDataDTO.PaymentAmountDTO amount = new PaymentDataDTO.PaymentAmountDTO();
        amount.setTotal(webhookDTO.getAmount());
        paymentDataDTO.setAmount(amount);

        return paymentDataDTO;
    }
}
