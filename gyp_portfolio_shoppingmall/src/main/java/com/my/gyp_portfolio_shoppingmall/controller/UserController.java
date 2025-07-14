package com.my.gyp_portfolio_shoppingmall.controller;

import java.io.IOException;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.my.gyp_portfolio_shoppingmall.dto.UserDto.BasicUserDTO;
import com.my.gyp_portfolio_shoppingmall.dto.UserDto.LoginHistoryDTO;
import com.my.gyp_portfolio_shoppingmall.dto.UserDto.PasswordResetDTO;
import com.my.gyp_portfolio_shoppingmall.dto.UserDto.PasswordUpdateDTO;
import com.my.gyp_portfolio_shoppingmall.dto.UserDto.UserListDTO;
import com.my.gyp_portfolio_shoppingmall.exception.OptimisticLockingException;
import com.my.gyp_portfolio_shoppingmall.exception.UserException;
import com.my.gyp_portfolio_shoppingmall.security.jwt.JwtSupport;
import com.my.gyp_portfolio_shoppingmall.service.UserService;
import com.my.gyp_portfolio_shoppingmall.support.LoginHistorySupport.LoginResult;
import com.my.gyp_portfolio_shoppingmall.vo.LoginHistory;
import com.my.gyp_portfolio_shoppingmall.vo.User;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("api/user")
public class UserController {

    private final JwtSupport jwtSupport;
    private final UserService userService;

    // 회원 가입
    @PostMapping("/signup")
    public ResponseEntity<?> signup(
        @RequestBody BasicUserDTO basicUserDTO) {
        try {
            userService.insertUser(basicUserDTO);
            return ResponseEntity.ok("회원 가입에 성공했습니다.");
        } catch (UserException.DuplicateEmailException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (UserException.InvalidPasswordException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("회원 가입 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 회원 가입에 실패했습니다.");
        }
    }

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<?> login(
            HttpServletRequest request,
            HttpServletResponse response,
            @RequestBody BasicUserDTO basicUserDTO) throws IOException {
        try {
            LoginHistoryDTO loginHistoryDTO = new LoginHistoryDTO();
            loginHistoryDTO.setIpAddress(request.getRemoteAddr());
            loginHistoryDTO.setUserAgent(request.getHeader("User-Agent"));
            loginHistoryDTO.setBasicUserDTO(basicUserDTO);

            LoginResult result = userService.processLogin(loginHistoryDTO);

            // JWT 토큰을 응답 헤더에 설정
            jwtSupport.setTokenHeaders(response, result.getTokenPair());
            
            // 로그인 성공 메시지 반환
            return ResponseEntity.ok(result);
        } catch (UserException.UserNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (UserException.PasswordMismatchException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("로그인 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 로그인에 실패했습니다.");
        }
    }

    // 로그아웃
    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = jwtSupport.extractRefreshToken(request);
        
        userService.logout(refreshToken);
        
        // 응답 헤더에서 토큰 제거
        jwtSupport.removeTokenHeaders(response);

        return ResponseEntity.ok("로그아웃이 완료되었습니다.");
    }

    // 사용자 조회(회원 당사자 및 관리자 전용)
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_USER')")
    @GetMapping("/find")
    public ResponseEntity<?> find(
            @ModelAttribute BasicUserDTO basicUserDTO) {
        try {
            return ResponseEntity.ok(userService.findByEmail(basicUserDTO));
        } catch (UserException.UserNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("사용자 조회 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 사용자 조회에 실패했습니다.");
        }
    }

    // 사용자 일반 정보 수정(회원 당사자만 가능)
    @PreAuthorize("hasRole('ROLE_USER')")
    @PostMapping("/update")
    public ResponseEntity<?> updateUser(
                @RequestBody BasicUserDTO basicUserDTO) {
        try {
            userService.updateUser(basicUserDTO);
            return ResponseEntity.ok("회원 정보 수정이 완료되었습니다.");
        } catch (UserException.LoginRequiredException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (UserException.AccessDeniedException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (UserException.UserNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (OptimisticLockingException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("회원 정보 수정 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 회원 정보 수정에 실패했습니다.");
        }
    }

    // 사용자 비밀번호 수정
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/updatePassword")
    public ResponseEntity<?> updatePassword(
            @RequestBody PasswordUpdateDTO passwordUpdateDTO) {
        try {
            userService.updatePassword(passwordUpdateDTO);
            return ResponseEntity.ok("비밀번호 수정이 완료되었습니다.");
        } catch (UserException.LoginRequiredException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (UserException.UserNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (UserException.PasswordMismatchException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (UserException.InvalidPasswordException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("비밀번호 수정 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 비밀번호 수정에 실패했습니다.");
        }
    }

    // 사용자 탈퇴
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/delete")
    public ResponseEntity<?> deleteUser(
            @RequestBody BasicUserDTO basicUserDTO) {

        try {
            userService.deleteUser(basicUserDTO);
            return ResponseEntity.ok("회원 탈퇴가 완료되었습니다.");
        } catch (UserException.LoginRequiredException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (UserException.UserNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (UserException.PasswordMismatchException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("회원 탈퇴 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 회원 탈퇴에 실패했습니다.");
        }
    }

    // 비밀번호 재설정 토큰 생성 및 이메일 발송
    @PostMapping("/sendPasswordResetEmail")
    public ResponseEntity<?> sendPasswordResetEmail(
            @RequestBody BasicUserDTO basicUserDTO) {
        try {
            userService.sendPasswordResetEmail(basicUserDTO);
            return ResponseEntity.ok("비밀번호 재설정 이메일 발송이 완료되었습니다.");
        } catch (UserException.UserNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("비밀번호 재설정 이메일 발송 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 비밀번호 재설정 이메일 발송에 실패했습니다.");
        }
    }

    // 비밀번호 재설정
    @PostMapping("/resetPassword")
    public ResponseEntity<?> resetPassword(
            @RequestBody PasswordResetDTO passwordResetDTO) {
        try {
            userService.resetPassword(passwordResetDTO);
            return ResponseEntity.ok("비밀번호 재설정이 완료되었습니다.");
        } catch (UserException.InvalidResetTokenException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (UserException.InvalidPasswordException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("비밀번호 재설정 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 비밀번호 재설정에 실패했습니다.");
        }
    }

    // 회원 수 조회
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/count")
    public ResponseEntity<?> getUserCount() {
        try {
            int userCount = userService.getUserCount();
            return ResponseEntity.ok(userCount);
        } catch (Exception e) {
            log.error("회원 수 조회 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 회원 수 조회에 실패했습니다.");
        }
    }

    // 회원 목록 조회
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/list")
    public ResponseEntity<?> getUserList(
            @ModelAttribute UserListDTO userListDTO) {
        try {
            List<User> userList = userService.getUserList(userListDTO);
            return ResponseEntity.ok(userList);
        } catch (Exception e) {
            log.error("회원 목록 조회 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 회원 목록 조회에 실패했습니다.");
        }
    }

    // 회원 활성화/비활성화 상태 수정
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/updateUserDeletedForAdmin")
    public ResponseEntity<?> updateUserDeletedForAdmin(@RequestBody BasicUserDTO basicUserDTO) {
        try {
            userService.updateUserDeletedForAdmin(basicUserDTO);
            return ResponseEntity.ok("회원 활성화/비활성화 상태 수정이 완료되었습니다.");
        } catch (Exception e) {
            log.error("회원 활성화/비활성화 상태 수정 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 회원 활성화/비활성화 상태 수정에 실패했습니다.");
        }
    }

    // 로그인 기록 조회
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/loginHistory")
    public ResponseEntity<?> getLoginHistory(@RequestParam Integer userId) {
        try {
            List<LoginHistory> loginHistory = userService.getLoginHistory(userId);
            return ResponseEntity.ok(loginHistory);
        } catch (Exception e) {
            log.error("로그인 기록 조회 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 로그인 기록 조회에 실패했습니다.");
        }
    }

    // 비밀번호 일치여부로 회원 당사자 확인
    @PreAuthorize("hasRole('ROLE_USER')")
    @PostMapping("/checkPassword")
    public ResponseEntity<?> checkPassword(
            @RequestBody BasicUserDTO basicUserDTO) {
        try {
            userService.checkPassword(basicUserDTO);
            return ResponseEntity.ok("본인 확인이 완료되었습니다.");
        } catch (UserException.LoginRequiredException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (UserException.UserNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (UserException.PasswordMismatchException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("비밀번호 일치여부로 회원 당사자 확인 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 비밀번호 일치여부로 회원 당사자 확인에 실패했습니다.");
        }
    }
}
