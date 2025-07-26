package com.my.gyp_portfolio_shoppingmall.security.config;

import javax.servlet.http.HttpServletResponse;

// 스프링의 빈(Bean) 설정을 위한 어노테이션들을 import
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.access.expression.method.DefaultMethodSecurityExpressionHandler;
import org.springframework.security.access.expression.method.MethodSecurityExpressionHandler;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
// 스프링 시큐리티 관련 클래스들을 import
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

import com.my.gyp_portfolio_shoppingmall.dao.UserDao;
import com.my.gyp_portfolio_shoppingmall.security.jwt.JwtAuthenticationFilter;
import com.my.gyp_portfolio_shoppingmall.security.jwt.JwtSupport;
import com.my.gyp_portfolio_shoppingmall.support.TokenBlacklistSupport;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtSupport jwtSupport;
        private final TokenBlacklistSupport tokenBlacklistService;
        private final UserDao userDao;
        
        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http)
                        throws Exception {
                http
                                .csrf(csrf -> csrf.disable())
                                .formLogin(form -> form.disable())
                                .httpBasic(basic -> basic.disable())                                
                                // .requiresChannel(channel -> channel.anyRequest().requiresSecure()) // 모든 요청을 HTTPS로 강제(개발시에는 주석처리)
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .exceptionHandling(exception -> exception
                                        // 인증 실패 시 처리
                                        .authenticationEntryPoint((request, response, e) -> {
                                                response.setContentType("application/json;charset=UTF-8");
                                                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                                                response.getWriter().write("{\"message\": \"인증되지 않은 접근입니다.\"}");
                                        })
                                        // 권한 부족 시 처리
                                        .accessDeniedHandler((request, response, e) -> {
                                                response.setContentType("application/json;charset=UTF-8");
                                                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                                                response.getWriter().write("{\"message\": \"권한이 없는 URL 접근입니다.\"}");
                                        })
                                )
                                .authorizeHttpRequests(auth -> auth
                                        .requestMatchers(new AntPathRequestMatcher("/shopping-mall/admin/**"))
                                        .hasRole("ADMIN")
                                        .anyRequest().permitAll())
                                .addFilterBefore(
                                        new JwtAuthenticationFilter(jwtSupport, tokenBlacklistService, userDao),
                                        UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        // 메서드 보안 표현식 핸들러 설정
        @Bean
        public MethodSecurityExpressionHandler methodSecurityExpressionHandler() {
                DefaultMethodSecurityExpressionHandler expressionHandler = new DefaultMethodSecurityExpressionHandler();
                return expressionHandler;
        }
}
