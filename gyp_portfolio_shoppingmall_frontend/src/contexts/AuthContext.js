import { createContext, useState, useEffect, useCallback } from 'react';
import { AUTH_HEADER, BEARER_PREFIX } from '../constants/auth';
import axios from 'axios';

// 인증 컨텍스트 생성
export const AuthContext = createContext();

// 인증 컨텍스트 제공
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accessToken, setAccessToken] = useState(null);
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // API 클라이언트 생성
    const apiClient = axios.create({
        baseURL: '/api',
        headers: {
            'Content-Type': 'application/json',
        },
        // 쿠키 자동 포함
        withCredentials: true,
        paramsSerializer: params => {
            return new URLSearchParams(params).toString();
        }
    });

    // 요청 인터셉터 설정(헤더에 엑세스 토큰 추가)
    apiClient.interceptors.request.use(
        (config) => {
            const token = accessToken || sessionStorage.getItem('accessToken');
            if(token) {
                config.headers[AUTH_HEADER] = `${BEARER_PREFIX}${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    // 응답 인터셉터 설정(토큰 갱신 및 로그아웃 처리)
    apiClient.interceptors.response.use(
        (response) => {
            const newAccessToken = response.headers[AUTH_HEADER];
            if (newAccessToken && newAccessToken.startsWith(BEARER_PREFIX)) {
                const token = newAccessToken.substring(BEARER_PREFIX.length);
                setAccessToken(token);
                sessionStorage.setItem('accessToken', token);

                const decodedInfo = decodeAccessToken(token);
                if (decodedInfo) {
                    const userAuthInfo = {
                        email: decodedInfo.email,
                        isAdmin: decodedInfo.role === 'ROLE_ADMIN' ? 1 : 0
                    };

                    setUser(userAuthInfo);
                    setIsAuthenticated(true);
                    
                    if (userAuthInfo.isAdmin === 1) {
                        localStorage.setItem('isAdmin', 'true');
                    } else {
                        localStorage.removeItem('isAdmin');
                    }
                }
            }
            return response;
        },
        (error) => {
            // 401 에러는 리프레시 토큰도 만료된 경우에만 발생
            if (error.response && error.response.status === 401) {
                console.log('리프레시 토큰 만료로 인한 자동 로그아웃');
                setIsAuthenticated(false);
                setAccessToken(null);
                setUser(null);
                sessionStorage.removeItem('accessToken');
                localStorage.removeItem('isAdmin');

                const currentPath = window.location.pathname;
                const isAdminPage = currentPath === '/admin' || currentPath.startsWith('/admin/');
                window.location.href = isAdminPage ? '/admin/login' : '/login';
                return Promise.reject(error);
            }
            return Promise.reject(error);
        }
    );

    // 회원가입 처리
    const register = async (userData) => {
        try {
            return await apiClient.post('/user/signup', userData);
        } catch (error) {
            console.error('회원가입 처리 에러:', error);
            throw error;
        }
    };

    // 로그인 처리
    const login = async (email, password) => {
        try {
            const response = await apiClient.post('/user/login', { email, password });
            const newAccessToken = response.headers[AUTH_HEADER];

            // 토큰이 없으면 에러 발생
            if(!newAccessToken) {
                console.error('로그인 처리 실패: 토큰이 없습니다.');
                throw new Error('인증 토큰을 받지 못했습니다.');
            }
            
            // 토큰 디코딩
            const token = newAccessToken.substring(BEARER_PREFIX.length);
            const decodedInfo = decodeAccessToken(token);
            
            // 토큰 디코딩 실패 시 에러 발생
            if (!decodedInfo) {
                console.error('로그인 처리 실패: 토큰 디코딩 실패');
                throw new Error('인증 토큰이 유효하지 않습니다.');
            }

            // 사용자 인증 정보 설정
            const userAuthInfo = {
                email: decodedInfo.email,
                isAdmin: decodedInfo.role === 'ROLE_ADMIN' ? 1 : 0
            };

            // 토큰 저장
            setAccessToken(token);
            setIsAuthenticated(true);
            setUser(userAuthInfo);
            sessionStorage.setItem('accessToken', token);

            // 관리자 여부에 따른 리다이렉트 처리
            if (userAuthInfo.isAdmin === 1) {
                localStorage.setItem('isAdmin', 'true');
                // 관리자 로그인 페이지에서 로그인한 경우
                if (window.location.pathname === '/admin/login') {
                    window.location.href = '/admin/dashboard';
                }
            } else {
                localStorage.removeItem('isAdmin');
                // 일반 로그인 페이지에서 로그인한 경우
                if (window.location.pathname === '/login') {
                    window.location.href = '/';
                }
            }

            return userAuthInfo;
        } catch (error) {
            console.error('로그인 처리 에러:', error);
            throw error;
        }
    };

    // 로그아웃 처리
    const logout = useCallback(async (options = {}) => {
        const { 
            skipApiCall = false, 
            isWithdraw = false,
            reason = 'manual' // 'manual', 'tokenExpired', 'unauthorized', 'withdraw'
        } = options;

        // 회원탈퇴 처리 여부 구분
        if (isWithdraw) {
            setIsWithdrawing(true);
        }

        let response = null;

        // 로그아웃 처리
        if (!skipApiCall) {
            try {
                response = await apiClient.post('/user/logout');
            } catch (error) {
                console.warn('서버 로그아웃 API 호출 실패:', error);
            }
        }

        // 상태 초기화
        setAccessToken(null);
        setIsAuthenticated(false);
        setUser(null);
        sessionStorage.removeItem('accessToken');
        localStorage.removeItem('isAdmin');
        
        // 회원탈퇴 처리
        if (isWithdraw) {
            setTimeout(() => {
                setIsWithdrawing(false);
            }, 500);
        }

        // 로그아웃 이유에 따른 추가 처리
        if (reason === 'tokenExpired') {
            console.log('토큰 만료로 인한 자동 로그아웃');
        }

        return response;
    }, [apiClient]);

    // 비밀번호 재설정 이메일 발송
    const sendPasswordResetEmail = async (email) => {
        try {
            return await apiClient.post('/user/sendPasswordResetEmail', { email });
        } catch (error) {
            console.error('비밀번호 재설정 이메일 발송 에러:', error);
            throw error;
        }
    };

    // 비밀번호 재설정
    const resetPassword = async (resetToken, newPassword) => {
        try {
            return await apiClient.post('/user/resetPassword', {
                resetToken,
                newPassword
            });
        } catch (error) {
            console.error('비밀번호 재설정 에러:', error);
            throw error;
        }
    };

    // 인증 상태 확인 및 초기화
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const savedToken = sessionStorage.getItem('accessToken');
                
                // 엑세스 토큰이 있는 경우
                if (savedToken) {   
                    const decodedInfo = decodeAccessToken(savedToken);
                    if (decodedInfo) {
                        // 사용자 인증 정보 설정
                        const userAuthInfo = {
                            email: decodedInfo.email,
                            isAdmin: decodedInfo.role === 'ROLE_ADMIN' ? 1 : 0
                        };
                        
                        setAccessToken(savedToken);
                        setUser(userAuthInfo);
                        setIsAuthenticated(true);

                        // 관리자 여부 설정
                        if (userAuthInfo.isAdmin === 1) {
                            localStorage.setItem('isAdmin', 'true');
                        } else {
                            localStorage.removeItem('isAdmin');
                        }
                    }
                } else {
                    // 엑세스 토큰이 없는 경우
                    console.error('엑세스 토큰이 없습니다.');
                    setAccessToken(null);
                    setIsAuthenticated(false);
                    setUser(null);
                }
            } catch (error) {
                console.error('인증 상태 확인 오류', error);
            } finally {
                setLoading(false);
            }
        };
        checkAuthStatus();
    }, []);

    // 엑세스 토큰 디코딩
    const decodeAccessToken = (token) => {
        try {
            const base64Payload = token.split('.')[1];
            const payload = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'));
            const decodedData = JSON.parse(payload);

            return {
                email: decodedData.sub,
                role: decodedData.role,
                exp: decodedData.exp
            };
        } catch (error) {
            console.error('엑세스 토큰 디코딩 오류', error);
            return null;
        }
    };

    // 요청 처리
    const authRequest = useCallback(async (method, url, data, options = {}) => {
        const methodLower = method.toLowerCase();
        const config = {
            method,
            url,
            ...options
        }

        // GET 요청에서만 params 처리
        if (methodLower === 'get' && data) {   
            config.params = data;
        } else {
            config.data = data;
        }

        // 나머지 요청은 데이터 처리
        return apiClient(config);
    }, [apiClient]);

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            user,
            register,
            login,
            logout,
            authRequest,
            sendPasswordResetEmail,
            resetPassword,
            loading,
            isWithdrawing
        }}>
            {children}
        </AuthContext.Provider>
    );
};