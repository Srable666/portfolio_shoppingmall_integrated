package com.my.gyp_portfolio_shoppingmall.security.handler;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@ControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // 권한 부족 시 처리
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDeniedException(AccessDeniedException e) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "권한이 없는 API 접근입니다.");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    // 예외 처리
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(Exception e) {
        log.error("예외 클래스: " + e.getClass().getName());
        log.error("예외 메시지: " + e.getMessage());
        log.error("상세 스택트레이스: ", e);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "처리 중 오류가 발생했습니다.");
        response.put("errorType", e.getClass().getSimpleName());
        response.put("errorMessage", e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
