package com.my.gyp_portfolio_shoppingmall.support;

import org.springframework.security.core.Authentication;

import com.my.gyp_portfolio_shoppingmall.exception.UserException;

public class UserSupport {
    
    private static final String PASSWORD_PATTERN = 
        "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,20}$";
    
    public static boolean isValidPassword(String password) {
        return password != null && password.matches(PASSWORD_PATTERN);
    }

    public static boolean isAdminUser(Authentication auth) {
        return auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    public static void validateNonAdminUserAccess(
            Authentication auth, 
            Integer currentUserId,    // 접근 시도하는 사용자 ID
            Integer targetUserId       // 조회할 사용자 ID
    ) {
        if (!isAdminUser(auth) && !currentUserId.equals(targetUserId)) {
            throw new UserException.AccessDeniedException();
        }
    }
} 