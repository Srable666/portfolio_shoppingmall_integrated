package com.my.gyp_portfolio_shoppingmall.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

public class UserDto {
    // 기본 사용자 정보 DTO
    @Getter @Setter
    public static class BasicUserDTO {
        private Integer userId;
        private String email;
        private String password;
        private String name;
        private String postcode;
        private String baseAddress;
        private String detailAddress;
        private String phone;
        private Integer isDeleted;
        private Integer version;
    }

    // 로그인 이력 DTO
    @Getter @Setter
    public static class LoginHistoryDTO {
        private String ipAddress;
        private String userAgent;
        private BasicUserDTO basicUserDTO;
        private boolean isSuccess;
        private String failureMessage;
    }

    // 비밀번호 변경용 DTO
    @Getter @Setter
    public static class PasswordUpdateDTO {
        private String currentPassword;
        private String newPassword;
    }

    // 비밀번호 재설정 DTO
    @Getter @Setter
    public static class PasswordResetDTO {
        private String newPassword;
        private String resetToken;
    }

    // 회원 목록 조회 DTO
    @Getter @Setter
    public static class UserListDTO {
        private Integer userId;
        private String email;
        private String name;
        private String phone;
        private String postcode;
        private String baseAddress;
        private String detailAddress;
        private Integer isDeleted;
        private LocalDateTime createdAt;
    }
}
