package com.my.gyp_portfolio_shoppingmall.exception;

public class UserException {
    // 이메일 중복
    public static class DuplicateEmailException extends RuntimeException {
        public DuplicateEmailException() {
            super("이미 존재하는 이메일입니다.");
        }
    }
    
    // 비밀번호 유효성 검사
    public static class InvalidPasswordException extends RuntimeException {
        public InvalidPasswordException() {
            super("비밀번호는 8~20자의 대소문자, 숫자, 특수문자를 포함해야 합니다.");
        }
    }

    // 사용자 존재 여부
    public static class UserNotFoundException extends RuntimeException {
        public UserNotFoundException() {
            super("존재하지 않는 사용자입니다.");
        }
    }

    // 비밀번호 불일치
    public static class PasswordMismatchException extends RuntimeException {
        public PasswordMismatchException() {
            super("비밀번호가 일치하지 않습니다.");
        }
    }

    // 비밀번호 재설정 토큰 유효성 검사
    public static class InvalidResetTokenException extends RuntimeException {
        public InvalidResetTokenException() {
            super("유효기간이 만료되었습니다.");
        }
    }

    // 접근 권한 예외
    public static class AccessDeniedException extends RuntimeException {
        public AccessDeniedException() {
            super("접근 권한이 없습니다.");
        }
    }

    // 로그인 필요
    public static class LoginRequiredException extends RuntimeException {
        public LoginRequiredException() {
            super("로그인이 필요합니다.");
        }
    }
} 