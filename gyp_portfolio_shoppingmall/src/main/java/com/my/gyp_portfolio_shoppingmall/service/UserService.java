package com.my.gyp_portfolio_shoppingmall.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import com.my.gyp_portfolio_shoppingmall.dao.UserDao;
import com.my.gyp_portfolio_shoppingmall.dto.UserDto.BasicUserDTO;
import com.my.gyp_portfolio_shoppingmall.dto.UserDto.LoginHistoryDTO;
import com.my.gyp_portfolio_shoppingmall.dto.UserDto.PasswordResetDTO;
import com.my.gyp_portfolio_shoppingmall.dto.UserDto.PasswordUpdateDTO;
import com.my.gyp_portfolio_shoppingmall.dto.UserDto.UserListDTO;
import com.my.gyp_portfolio_shoppingmall.enums.LoginEnums;
import com.my.gyp_portfolio_shoppingmall.exception.UserException;
import com.my.gyp_portfolio_shoppingmall.security.jwt.JwtSupport;
import com.my.gyp_portfolio_shoppingmall.security.jwt.TokenPair;
import com.my.gyp_portfolio_shoppingmall.support.EmailSender;
import com.my.gyp_portfolio_shoppingmall.support.LoginHistorySupport;
import com.my.gyp_portfolio_shoppingmall.support.LoginHistorySupport.LoginResult;
import com.my.gyp_portfolio_shoppingmall.support.OptimisticLock;
import com.my.gyp_portfolio_shoppingmall.support.PhoneEncryptionUtil;
import com.my.gyp_portfolio_shoppingmall.support.TokenBlacklistSupport;
import com.my.gyp_portfolio_shoppingmall.support.UserSupport;
import com.my.gyp_portfolio_shoppingmall.vo.LoginHistory;
import com.my.gyp_portfolio_shoppingmall.vo.User;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserDao userDao;
    private final JwtSupport jwtSupport;
    private final EmailSender emailSender;
    private final PasswordEncoder passwordEncoder;
    private final LoginHistorySupport loginHistoryUtil;
    private final PhoneEncryptionUtil phoneEncryptionUtil;
    private final TokenBlacklistSupport tokenBlacklistSupport;

    // 상태 업데이트만 수행하는 낙관적 잠금 전용 메서드
    @OptimisticLock
    public int updateUserWithOptimisticLock(User user) {
        return userDao.updateUserWithOptimisticLock(user);
    }

    // 회원 가입
    @Transactional(
        isolation = Isolation.REPEATABLE_READ,
        timeout = 30
    )
    public void insertUser(BasicUserDTO basicUserDTO) {        
        User user = new User();
        user.setEmail(basicUserDTO.getEmail());
        user.setPassword(basicUserDTO.getPassword());
        user.setName(basicUserDTO.getName());
        user.setPostcode(basicUserDTO.getPostcode());
        user.setBaseAddress(basicUserDTO.getBaseAddress());
        user.setDetailAddress(basicUserDTO.getDetailAddress());
        user.setPhone(phoneEncryptionUtil.encrypt(basicUserDTO.getPhone().trim()));
        
        // 이메일 중복 체크
        if (userDao.findByEmailForUpdate(user.getEmail()) != null) {
            throw new UserException.DuplicateEmailException();
        }

        // 비밀번호 유효성 검사
        if (!UserSupport.isValidPassword(user.getPassword())) {
            throw new UserException.InvalidPasswordException();
        }

        // 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);

        userDao.insertUser(user);

        // 가입 환영 이메일 발송
        emailSender.sendWelcomeEmail(user.getEmail(), user.getName());
    }

    // 로그인
    @Transactional(
        isolation = Isolation.REPEATABLE_READ,
        timeout = 5
    )
    public LoginResult processLogin(LoginHistoryDTO loginHistoryDTO) {
        try {
            User user = userDao.findByEmailForUpdate(loginHistoryDTO.getBasicUserDTO().getEmail());

            // 사용자 존재 여부 체크
            if (user == null) {
                LoginHistoryDTO loginHistoryFailureDTO = new LoginHistoryDTO();
                loginHistoryFailureDTO.setIpAddress(loginHistoryDTO.getIpAddress());
                loginHistoryFailureDTO.setUserAgent(loginHistoryDTO.getUserAgent());
                loginHistoryFailureDTO.setBasicUserDTO(loginHistoryDTO.getBasicUserDTO());
                loginHistoryFailureDTO.setSuccess(false);
                loginHistoryFailureDTO.setFailureMessage("존재하지 않는 이메일입니다.");
                saveLoginHistory(loginHistoryFailureDTO);
                throw new UserException.UserNotFoundException();
            }

            // 사용자 탈퇴 여부 체크
            if (user.getIsDeleted() == 1) {
                LoginHistoryDTO loginHistoryFailureDTO = new LoginHistoryDTO();
                loginHistoryFailureDTO.setIpAddress(loginHistoryDTO.getIpAddress());
                loginHistoryFailureDTO.setUserAgent(loginHistoryDTO.getUserAgent());
                loginHistoryFailureDTO.setBasicUserDTO(loginHistoryDTO.getBasicUserDTO());
                loginHistoryFailureDTO.setSuccess(false);
                loginHistoryFailureDTO.setFailureMessage("탈퇴한 회원입니다.");
                saveLoginHistory(loginHistoryFailureDTO);
                throw new UserException.UserNotFoundException();
            }

            // 비밀번호 일치 여부 체크
            if (!passwordEncoder.matches(loginHistoryDTO.getBasicUserDTO().getPassword(), user.getPassword())) {
                LoginHistoryDTO loginHistoryFailureDTO = new LoginHistoryDTO();
                loginHistoryFailureDTO.setIpAddress(loginHistoryDTO.getIpAddress());
                loginHistoryFailureDTO.setUserAgent(loginHistoryDTO.getUserAgent());
                loginHistoryFailureDTO.setBasicUserDTO(loginHistoryDTO.getBasicUserDTO());
                loginHistoryFailureDTO.setSuccess(false);
                loginHistoryFailureDTO.setFailureMessage("비밀번호가 일치하지 않습니다.");
                saveLoginHistory(loginHistoryFailureDTO);
                throw new UserException.PasswordMismatchException();
            }

            // 새로운 JWT 생성
            TokenPair tokenPair = jwtSupport.rotateTokens(loginHistoryDTO.getBasicUserDTO().getEmail(), user.getIsAdmin() == 1);

            // 로그인 성공 기록 저장
            LoginHistoryDTO loginHistorySuccessDTO = new LoginHistoryDTO();
            loginHistorySuccessDTO.setIpAddress(loginHistoryDTO.getIpAddress());
            loginHistorySuccessDTO.setUserAgent(loginHistoryDTO.getUserAgent());
            loginHistorySuccessDTO.setBasicUserDTO(loginHistoryDTO.getBasicUserDTO());
            loginHistorySuccessDTO.setSuccess(true);
            saveLoginHistory(loginHistorySuccessDTO);

            return LoginResult.success(tokenPair);

        } catch (UserException.UserNotFoundException e) {
            throw e;
        } catch (UserException.PasswordMismatchException e) {
            throw e;
        } catch (Exception e) {
            log.error("로그인 처리 중 오류가 발생했습니다. 이메일: {}", loginHistoryDTO.getBasicUserDTO().getEmail(), e);

            // 로그인 실패 기록 저장
            LoginHistoryDTO loginHistoryFailureDTO = new LoginHistoryDTO();
            loginHistoryFailureDTO.setBasicUserDTO(loginHistoryDTO.getBasicUserDTO());
            loginHistoryFailureDTO.setSuccess(false);
            loginHistoryFailureDTO.setFailureMessage("로그인 처리 중 오류가 발생했습니다.");
            saveLoginHistory(loginHistoryFailureDTO);

            throw e;
        }
    }

    // 로그인 기록 저장
    @Transactional(
        isolation = Isolation.REPEATABLE_READ,
        timeout = 5
    )
    private void saveLoginHistory(LoginHistoryDTO loginHistoryDTO) {
        LoginHistory loginHistory = new LoginHistory();
        String deviceType = loginHistoryUtil.determineDeviceType(loginHistoryDTO.getUserAgent());
        User user = userDao.findByEmailForUpdate(loginHistoryDTO.getBasicUserDTO().getEmail());

        // 공통 정보 설정
        loginHistory.setIpAddress(loginHistoryDTO.getIpAddress());
        loginHistory.setUserAgent(loginHistoryDTO.getUserAgent());
        loginHistory.setDeviceType(deviceType);
        loginHistory.setUserId(user != null ? user.getUserId() : null);
        loginHistory.setLoginStatus(loginHistoryDTO.isSuccess() ? LoginEnums.Status.SUCCESS.name() : LoginEnums.Status.FAILURE.name());
        
        if (!loginHistoryDTO.isSuccess()) {
            loginHistory.setFailReason(loginHistoryDTO.getFailureMessage());
        }

        // 비동기 로그인 기록 저장
        CompletableFuture.runAsync(() -> {
            int maxRetries = 3;
            int retryCount = 0;

            while (retryCount < maxRetries) {
                try {
                    userDao.saveLoginHistory(loginHistory);
                    log.info("로그인 기록 저장 완료 - 성공여부: {}, 이메일: {}{}", 
                        loginHistoryDTO.isSuccess(), 
                        loginHistoryDTO.getBasicUserDTO().getEmail(),
                        loginHistoryDTO.isSuccess() ? "" : ", 실패사유: " + loginHistoryDTO.getFailureMessage()
                    );
                    return;
                } catch (Exception e) {
                    retryCount++;
                    log.error("로그인 기록 저장 실패 - 성공여부: {}, 이메일: {}, 실패사유: {}", 
                    loginHistoryDTO.isSuccess(), loginHistoryDTO.getBasicUserDTO().getEmail(), loginHistoryDTO.getFailureMessage(), e);

                    if (retryCount >= maxRetries) {                        
                        log.error("로그인 기록 저장 실패 - 최대 재시도 횟수 초과");

                        try {
                            Thread.sleep(1000 * retryCount);
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                            break;
                        }
                    }
                }
            }

            if (retryCount == maxRetries) {
                // 전용 로그 파일에 JSON 형태로 저장
                saveFailedLoginHistoryToFile(loginHistoryDTO);
            }
        });
    }

    // 로그인 실패 기록 파일 저장
    private void saveFailedLoginHistoryToFile(LoginHistoryDTO loginHistoryDTO) {
        try {
            String logEntry = String.format(
                "{\"timestamp\":\"%s\",\"email\":\"%s\",\"success\":%b,\"ipAddress\":\"%s\",\"userAgent\":\"%s\"}\n",
                LocalDateTime.now(),
                loginHistoryDTO.getBasicUserDTO().getEmail(),
                loginHistoryDTO.isSuccess(),
                loginHistoryDTO.getIpAddress(),
                loginHistoryDTO.getUserAgent()
            );
            
            Path logFile = Paths.get("logs/failed_login_history.log");
            Files.createDirectories(logFile.getParent());
            Files.write(
                logFile, 
                logEntry.getBytes(), 
                StandardOpenOption.CREATE, 
                StandardOpenOption.APPEND
            );
            
            log.warn("DB 저장 실패로 인해 로그인 기록을 파일에 저장: {}", 
                loginHistoryDTO.getBasicUserDTO().getEmail());
                
        } catch (IOException e) {
            log.error("로그인 기록 파일 저장 실패", e);
        }
    }

    // 로그아웃
    public void logout(String refreshToken) {
        // 토큰이 있으면 블랙리스트에 추가 시도
        if (refreshToken != null) {
            try {
                tokenBlacklistSupport.addToBlacklist(
                    refreshToken, 
                    jwtSupport.getTokenRemainingTime(refreshToken)
                );
                
                // 저장 확인
                boolean isBlacklisted = tokenBlacklistSupport.isBlacklisted(refreshToken);
                log.info("Token blacklist status: {}", isBlacklisted);
            
            } catch (Exception e) {
                log.warn("Failed to add token to blacklist", e);
            }
        }
    }
    
    // 이메일로 사용자 정보 조회
    @Transactional(
        isolation = Isolation.REPEATABLE_READ,
        timeout = 5
    )
    public User findByEmail(BasicUserDTO basicUserDTO) {
        // 필요한 정보 추출
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = auth.getName();
        User currentUser = userDao.findByEmailForUpdate(currentUserEmail);

        // 조회할 사용자 정보 조회
        User findUser = userDao.findByEmailForUpdate(basicUserDTO.getEmail());
        if (findUser == null) {
            throw new UserException.UserNotFoundException();
        }
        
        // 관리자 or 사용자 일치 여부 확인
        UserSupport.validateNonAdminUserAccess(
            auth, 
            currentUser.getUserId(), 
            findUser.getUserId()
        );

        // 전화번호 복호화
        if (findUser.getPhone() != null && !findUser.getPhone().trim().isEmpty()) {
            try {
                findUser.setPhone(phoneEncryptionUtil.decrypt(findUser.getPhone()));
            } catch (Exception e) {
                log.error("전화번호 복호화 실패 - 사용자 ID: {}", findUser.getUserId(), e);
                findUser.setPhone("복호화 실패");
            }
        }

        return findUser;
    }

    // 사용자 일반 정보 수정
    @Transactional(
        isolation = Isolation.REPEATABLE_READ,
        timeout = 5
    )
    public void updateUser(BasicUserDTO basicUserDTO) {
        // SecurityContext에 인증된 사용자가 없다면 예외 발생
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            throw new UserException.LoginRequiredException();
        }

        // SecurityContext에서 현재 인증된 사용자 이메일 가져오기
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        // 이메일 일치 여부 확인
        if (!basicUserDTO.getEmail().equals(email)) {
            throw new UserException.AccessDeniedException();
        }
        
        // 현재 사용자 정보 조회
        User currentUser = userDao.findByEmailForUpdate(email);
        if (currentUser == null) {
            throw new UserException.UserNotFoundException();
        }

        // user 클래스 생성
        User user = new User(); 
        user.setName(basicUserDTO.getName());
        user.setPostcode(basicUserDTO.getPostcode());
        user.setBaseAddress(basicUserDTO.getBaseAddress());
        user.setDetailAddress(basicUserDTO.getDetailAddress());
        user.setPhone(phoneEncryptionUtil.encrypt(basicUserDTO.getPhone().trim()));
        user.setVersion(basicUserDTO.getVersion());
        user.setEmail(email);
        updateUserWithOptimisticLock(user);
    }

    // 사용자 비밀번호 수정
    @Transactional(
        isolation = Isolation.REPEATABLE_READ,
        timeout = 5
    )
    public void updatePassword(PasswordUpdateDTO passwordUpdateDTO) {
        // SecurityContext에 인증된 사용자가 없다면 예외 발생
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            throw new UserException.LoginRequiredException();
        }

        // SecurityContext에서 현재 인증된 사용자 이메일 가져오기
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        
        // 현재 사용자 정보 조회
        User currentUser = userDao.findByEmailForUpdate(email);
        if (currentUser == null) {
            throw new UserException.UserNotFoundException();
        }

        // 현재 비밀번호 일치 여부 확인
        if (!passwordEncoder.matches(passwordUpdateDTO.getCurrentPassword(), currentUser.getPassword())) {
            throw new UserException.PasswordMismatchException();
        }

        // 새 비밀번호 유효성 검사
        if (!UserSupport.isValidPassword(passwordUpdateDTO.getNewPassword())) {
            throw new UserException.InvalidPasswordException();
        }

        // 새 비밀번호 암호화 및 업데이트
        String encodedPassword = passwordEncoder.encode(passwordUpdateDTO.getNewPassword());
        currentUser.setPassword(encodedPassword);

        userDao.updatePassword(currentUser);
    }

    // 사용자 탈퇴
    @Transactional(
        isolation = Isolation.REPEATABLE_READ,
        timeout = 5
    )
    public void deleteUser(BasicUserDTO basicUserDTO) {
        // SecurityContext에 인증된 사용자가 없다면 예외 발생
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            throw new UserException.LoginRequiredException();
        }
        
        // SecurityContext에서 현재 인증된 사용자 이메일 가져오기
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userDao.findByEmailForUpdate(email);

        // 사용자 존재 여부 확인
        if (user == null) {
            throw new UserException.UserNotFoundException();
        }

        // 비밀번호 확인 (보안을 위해)
        if (!passwordEncoder.matches(basicUserDTO.getPassword(), user.getPassword())) {
            throw new UserException.PasswordMismatchException();
        }

        // 사용자 삭제
        userDao.deleteUser(email);
    }

    // 비밀번호 재설정 토큰 생성 및 이메일 발송
    @Transactional(
        isolation = Isolation.REPEATABLE_READ,
        timeout = 5
    )
    public void sendPasswordResetEmail(BasicUserDTO basicUserDTO) {
        User user = userDao.findByEmailForUpdate(basicUserDTO.getEmail());

        // 사용자 존재 여부 확인
        if (user == null) {
            throw new UserException.UserNotFoundException();
        }
        
        // 재설정 토큰 생성(UUID) & 유효시간 설정 (30분)
        String resetToken = UUID.randomUUID().toString();
        LocalDateTime expiryDate = LocalDateTime.now().plusMinutes(30);

        user.setResetToken(resetToken);
        user.setResetTokenExpiry(expiryDate);
        userDao.updateResetToken(user);

        emailSender.sendPasswordResetEmail(user.getEmail(), resetToken);
    }

    // 비밀번호 재설정
    @Transactional(
        isolation = Isolation.REPEATABLE_READ,
        timeout = 5
    )
    public void resetPassword(PasswordResetDTO passwordResetDTO) {
        User user = userDao.findByResetToken(passwordResetDTO.getResetToken());
        
        if (user == null || 
            user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new UserException.InvalidResetTokenException();
        }
        
        if (!UserSupport.isValidPassword(passwordResetDTO.getNewPassword())) {
            throw new UserException.InvalidPasswordException();
        }
        
        String encodedPassword = passwordEncoder.encode(passwordResetDTO.getNewPassword());
        user.setPassword(encodedPassword);
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        
        userDao.updatePassword(user);
    }

    // 회원 수 조회
    public int getUserCount() {
        return userDao.getUserCount();
    }

    // 회원 목록 조회
    @Transactional(readOnly = true)
    public List<User> getUserList(UserListDTO userListDTO) {
        List<User> users = userDao.getUserList(userListDTO);
        
        // 각 사용자의 전화번호 복호화
        for (User user : users) {
            if (user.getPhone() != null && !user.getPhone().trim().isEmpty()) {
                try {
                    user.setPhone(phoneEncryptionUtil.decrypt(user.getPhone()));
                } catch (Exception e) {
                    log.error("전화번호 복호화 실패 - 사용자 ID: {}", user.getUserId(), e);
                    user.setPhone("복호화 실패");
                }
            }
        }
        
        return users;
    }

    // 회원 활성화/비활성화 상태 수정
    @Transactional(
        isolation = Isolation.REPEATABLE_READ,
        timeout = 5
    )
    public void updateUserDeletedForAdmin(BasicUserDTO basicUserDTO) {
        User user = new User();
        user.setUserId(basicUserDTO.getUserId());
        user.setIsDeleted(basicUserDTO.getIsDeleted());
        userDao.updateUserDeletedForAdmin(user);
    }

    // 로그인 기록 조회
    @Transactional(readOnly = true)
    public List<LoginHistory> getLoginHistory(Integer userId) {
        return userDao.getLoginHistory(userId);
    }

    // 비밀번호 일치여부로 회원 당사자 확인
    public boolean checkPassword(BasicUserDTO basicUserDTO) {
        // SecurityContext에 인증된 사용자가 없다면 예외 발생
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            throw new UserException.LoginRequiredException();
        }

        // SecurityContext에서 현재 인증된 사용자 이메일 가져오기
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userDao.findByEmailForUpdate(email);

        // 사용자 존재 여부 확인
        if (user == null) {
            throw new UserException.UserNotFoundException();
        }

        // 비밀번호 일치여부 확인
        boolean isPasswordCorrect = passwordEncoder.matches(basicUserDTO.getPassword(), user.getPassword());
        if (!isPasswordCorrect) {
            throw new UserException.PasswordMismatchException();
        }

        return true;
    }
}
