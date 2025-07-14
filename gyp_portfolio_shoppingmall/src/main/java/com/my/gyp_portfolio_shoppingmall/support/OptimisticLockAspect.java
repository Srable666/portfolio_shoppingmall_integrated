package com.my.gyp_portfolio_shoppingmall.support;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

import com.my.gyp_portfolio_shoppingmall.exception.OptimisticLockingException;

import lombok.extern.slf4j.Slf4j;

@Aspect
@Component
@Slf4j
public class OptimisticLockAspect {
    
    @Around("@annotation(optimisticLock)")
    public Object handleOptimisticLock(ProceedingJoinPoint joinPoint, OptimisticLock optimisticLock) throws Throwable {
        int retryCount = 0;
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = joinPoint.getSignature().getName();
        
        while (retryCount < optimisticLock.maxRetries()) {
            try {
                Object result = joinPoint.proceed();
                
                if (result instanceof Integer && (Integer)result == 0) {
                    retryCount++;
                    if (retryCount >= optimisticLock.maxRetries()) {
                        throw new OptimisticLockingException(
                            String.format("%s.%s 실행 중 처리 실패", className, methodName)
                        );
                    }
                    Thread.sleep(optimisticLock.delayMs());
                    continue;
                }
                
                return result;
                
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new OptimisticLockingException("로직 처리 중 인터럽트 발생");
            }
        }
        
        throw new OptimisticLockingException("최대 재시도 횟수 초과");
    }
}