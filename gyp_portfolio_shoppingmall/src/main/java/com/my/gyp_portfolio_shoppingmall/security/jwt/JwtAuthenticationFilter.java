package com.my.gyp_portfolio_shoppingmall.security.jwt;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import com.my.gyp_portfolio_shoppingmall.dao.UserDao;
import com.my.gyp_portfolio_shoppingmall.support.TokenBlacklistSupport;
import com.my.gyp_portfolio_shoppingmall.vo.User;

import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtSupport jwtSupport;
    private final TokenBlacklistSupport tokenBlacklistService;
    private final UserDao userDao;

    // 토큰 검증 및 인증 처리
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        
        // 로그아웃 요청은 토큰 상태와 관계없이 필터 체인 통과
        if (request.getRequestURI().endsWith("/api/user/logout")) {
            log.debug("JwtAuthenticationFilter - Logout request");
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String accessToken = jwtSupport.extractAccessToken(request.getHeader(JwtConstants.ACCESS_TOKEN_HEADER));
            
            // 엑세스 토큰이 없는 경우 필터 체인 통과
            if (accessToken == null) {
                log.debug("JwtAuthenticationFilter - Access token is null");
                filterChain.doFilter(request, response);
                return;
            }
    
            // 엑세스 토큰이 만료된 경우
            if (jwtSupport.isTokenExpired(accessToken, true)) {
                if (!tryRefreshToken(request, response)) {
                    handleExpiredAccessToken(response);
                    return;
                }
            } else {
                handleValidAccessToken(accessToken);
            }
    
            filterChain.doFilter(request, response);
        } catch (JwtException e) {
            handleJwtException(response, e);
        }
    }

    // 리프레시 토큰 검증 및 갱신 시도
    private boolean tryRefreshToken(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String refreshToken = jwtSupport.extractRefreshToken(request);
        
        // 리프레시 토큰 유효성 검사
        if (refreshToken != null && 
            !jwtSupport.isTokenExpired(refreshToken, false) && 
            !tokenBlacklistService.isBlacklisted(refreshToken)) {
            
            try {
                // 리프레시 토큰 검증 및 사용자 이메일 추출
                String userEmail = jwtSupport.validateAndGetUsername(refreshToken, false);
                User user = userDao.findByEmailForUpdate(userEmail);

                // 사용자 정보 조회 실패 시 처리
                if (user == null) {
                    log.warn("User not found during token refresh: {}", userEmail);
                    handleRefreshTokenFailure(response);
                    return false;
                }

                // 관리자 여부 확인
                boolean isAdmin = user.getIsAdmin() == 1;

                // 토큰 세트 갱신
                TokenPair tokenPair = jwtSupport.rotateTokens(userEmail, isAdmin);
                
                // 새로 생성된 토큰 세트의 엑세스 토큰 유효성 검사
                String newAccessToken = tokenPair.getAccessToken();
                if (newAccessToken == null) {
                    log.error("Generated access token is null");
                    handleRefreshTokenFailure(response);
                    return false;
                }
                
                // 새로운 토큰 세트를 헤더에 추가
                jwtSupport.setTokenHeaders(response, tokenPair);

                // 기존 리프레시 토큰을 블랙리스트에 추가
                tokenBlacklistService.addToBlacklist(refreshToken, jwtSupport.getTokenRemainingTime(refreshToken));
                
                // 사용자 인증 처리 (한 번만 수행)
                handleValidAccessToken(tokenPair.getAccessToken());
                log.debug("Token refresh successful");
                return true;
            } catch (JwtException e) {
                log.error("Token refresh failed", e);
                handleRefreshTokenFailure(response);
                return false;
            }
        }
        
        log.error("Invalid refresh token");
        handleInvalidRefreshToken(response);
        return false;
    }

    // 유효한 액세스 토큰 처리
    private void handleValidAccessToken(String accessToken) {
        // JWT에서 사용자 정보와 권한 추출
        String userEmail = jwtSupport.validateAndGetUsername(accessToken, true);
        String role = jwtSupport.getRole(accessToken);
        
        // 인증 처리 (권한 정보 포함)
        processAuthentication(userEmail, role);
    }

    // JWT 예외 처리
    private void handleJwtException(HttpServletResponse response, JwtException e) throws IOException {
        SecurityContextHolder.clearContext();
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");        
        response.getWriter().write("{\"message\": \"JWT 예외가 발생했습니다.\"}");
    }

    // 리프레시 토큰 갱신 실패 처리
    private void handleRefreshTokenFailure(HttpServletResponse response) throws IOException {
        SecurityContextHolder.clearContext();
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"message\": \"리프레시 토큰 갱신에 실패했습니다.\"}");
    }

    // 만료된 엑세스 토큰 처리
    private void handleExpiredAccessToken(HttpServletResponse response) throws IOException {
        SecurityContextHolder.clearContext();
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"message\": \"엑세스 토큰이 만료되었습니다. 다시 로그인해주세요.\"}");
    }

    // 만료된 리프레시 토큰 처리
    private void handleInvalidRefreshToken(HttpServletResponse response) throws IOException {
        SecurityContextHolder.clearContext();
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"message\": \"리프레시 토큰이 만료되었습니다. 다시 로그인해주세요.\"}");
    }

    // 사용자 인증 처리
    private void processAuthentication(String userEmail, String role) {
        // 권한 정보 생성
        List<SimpleGrantedAuthority> authorities = Collections.singletonList(
            new SimpleGrantedAuthority(role)
        );

        // 인증 객체 생성 (권한 정보 포함)
        UsernamePasswordAuthenticationToken authentication = 
            new UsernamePasswordAuthenticationToken(
                userEmail,          // principal (사용자 식별자)
                null,   // credentials (비밀번호, JWT 방식에서는 불필요)
                authorities         // 권한 목록
            );

        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}