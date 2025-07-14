import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { 
    PAYMENT_STATUS, 
    API_ENDPOINTS, 
    ERROR_TYPES 
} from '../constants/payment';
    
// 결제 오류 클래스
class PaymentError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'PaymentError';
        this.code = code;
    }
}

// 컨텍스트 생성
const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
    const { authRequest } = useContext(AuthContext);
    
    const [loading, setLoading] = useState(false);
    const [currentPayment, setCurrentPayment] = useState(null);
    const [sdkInitialized, setSdkInitialized] = useState(false);

    // 포트원 SDK 초기화 및 환경변수 검증
    useEffect(() => {
        if (window.IMP && process.env.REACT_APP_PORTONE_IMP) {
            window.IMP.init(process.env.REACT_APP_PORTONE_IMP);
            setSdkInitialized(true);
            console.log('포트원 V1 SDK 초기화 완료');
        }
    }, []);

    // 결제 준비
    const preparePayment = async (paymentData) => {
        try {
            validatePaymentInfo(paymentData);
            setLoading(true);

            const response = await authRequest('post', API_ENDPOINTS.PREPARE, paymentData);
            
            setCurrentPayment(response.data);
            return response.data;
        } catch (error) {
            handlePaymentError(error);
        } finally {
            setLoading(false);
        }
    };

    // 가상계좌 발급
    const requestVirtualAccount = async (paymentId, customerName, bankCode) => {
        try {
            setLoading(true);
            const response = await authRequest('post', API_ENDPOINTS.VIRTUAL_ACCOUNT(paymentId), {
                customerName,
                bankCode
            });
            
            return response.data;
        } catch (error) {
            handlePaymentError(error);
        } finally {
            setLoading(false);
        }
    };

    // 결제 요청
    const requestPayment = (paymentInfo) => {
        return new Promise((resolve, reject) => {
            try {
                const { IMP } = window;
                if (!IMP || !sdkInitialized) {
                    throw new PaymentError('포트원 SDK가 초기화되지 않았습니다.', ERROR_TYPES.PAYMENT_REQUEST);
                }

                validatePaymentInfo(paymentInfo);
                setLoading(true);

                const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

                const paymentData = {
                    pg: 'tosspayments',
                    merchant_uid: paymentInfo.orderCode,
                    name: paymentInfo.productName,
                    amount: paymentInfo.amount,
                    buyer_email: paymentInfo.buyerEmail,
                    buyer_name: paymentInfo.buyerName,
                    buyer_tel: paymentInfo.buyerTel,
                    buyer_addr: paymentInfo.buyerAddr,
                    buyer_postcode: paymentInfo.buyerPostcode,
                    custom_data: paymentInfo.customData,
                    notice_url: paymentInfo.webhookUrl,
                    display: { card_quota: [] }
                };

                // 모바일 환경일 때는 m_redirect_url만 설정
                if (isMobile) {
                    paymentData.m_redirect_url = `${window.location.origin}/order/complete`;
                }

                IMP.request_pay(paymentData, (response) => {
                    if (!isMobile) {
                        if (response.success) {
                            setCurrentPayment(prev => ({
                                ...prev,
                                impUid: response.imp_uid,
                                status: PAYMENT_STATUS.PAID,
                                updatedAt: new Date().toISOString()
                            }));
                            resolve(response);
                        } else {
                            handlePaymentError(new Error(response.error_msg));
                        }
                    }
                });
    
                // 모바일 환경에서는 즉시 resolve
                if (isMobile) {
                    resolve({ success: true });
                }
            } catch (error) {
                handlePaymentError(error);
            } finally {
                setLoading(false);
            }
        });
    };

    // 결제 검증
    const verifyPayment = async (paymentId) => {
        try {
            setLoading(true);

            const response = await authRequest('post', API_ENDPOINTS.VERIFY(paymentId));
            
            setCurrentPayment(prev => ({
                ...prev,
                status: PAYMENT_STATUS.PAID,
                updatedAt: new Date().toISOString()
            }));

            return response.data;
        } catch (error) {
            handlePaymentError(error);
        } finally {
            setLoading(false);
        }
    };

    // 결제 취소
    const cancelPayment = async (paymentId, reason) => {
        try {
            setLoading(true);
            const response = await authRequest('post', API_ENDPOINTS.CANCEL(paymentId), { reason });
            
            setCurrentPayment(prev => ({
                ...prev,
                status: PAYMENT_STATUS.CANCELLED,
                updatedAt: new Date().toISOString()
            }));

            return response.data;
        } catch (error) {
            handlePaymentError(error);
        } finally {
            setLoading(false);
        }
    };

    // 결제 이력 조회 (ImpUid)
    const getPaymentHistoryByImpUid = async (impUid) => {
        try {
            const response = await authRequest('get', API_ENDPOINTS.HISTORY.IMP(impUid));
            return response.data;
        } catch (error) {
            throw new PaymentError(error.message, ERROR_TYPES.PAYMENT_REQUEST);
        }
    };

    // 결제 이력 조회 (MerchantUid)
    const getPaymentHistoryByMerchantUid = async (merchantUid) => {
        try {
            const response = await authRequest('get', API_ENDPOINTS.HISTORY.MERCHANT(merchantUid));
            return response.data;
        } catch (error) {
            throw new PaymentError(error.message, ERROR_TYPES.PAYMENT_REQUEST);
        }
    };

    // 결제 이력 조회 (OrderId)
    const getPaymentHistoryByOrderId = async (orderId) => {
        try {
            const response = await authRequest('get', API_ENDPOINTS.HISTORY.ORDER(orderId));
            return response.data;
        } catch (error) {
            throw new PaymentError(error.message, ERROR_TYPES.PAYMENT_REQUEST);
        }
    };

    // 관리자용 결제 이력 검색
    const searchPaymentHistory = async (searchParams) => {
        try {
            const response = await authRequest('get', API_ENDPOINTS.HISTORY.ADMIN_LIST, searchParams);
            return response.data;
        } catch (error) {
            throw new PaymentError(error.message, ERROR_TYPES.PAYMENT_REQUEST);
        }
    };

    // 결제 상태 초기화
    const resetPaymentState = () => {
        setCurrentPayment(null);
        setLoading(false);
    };

    // 유효성 검사 함수
    const validatePaymentInfo = (paymentInfo) => {
        const errors = [];
    
        if (!paymentInfo.orderCode) {
            errors.push('주문 번호가 없습니다.');
        }

        if (!paymentInfo.productName) {
            errors.push('상품명이 없습니다.');
        }
        
        if (!paymentInfo.amount || paymentInfo.amount <= 0) {
            errors.push('유효하지 않은 결제 금액입니다.');
        }

        if (!paymentInfo.buyerName) {
            errors.push('구매자 이름이 없습니다.');
        }

        if (!paymentInfo.buyerEmail) {
            errors.push('구매자 이메일이 없습니다.');
        }

        if (!paymentInfo.buyerTel) {
            errors.push('구매자 연락처가 없습니다.');
        }
        
        if (errors.length > 0) {
            throw new PaymentError(errors.join(', '), ERROR_TYPES.VALIDATION);
        }
    };

    // 에러 처리 함수
    const handlePaymentError = (error) => {
        console.error('Payment error:', error);
        
        if (error instanceof PaymentError) {
            throw  error;
        }
        if (!error.response) {
            throw new PaymentError('네트워크 연결을 확인해주세요.', ERROR_TYPES.NETWORK);
        }
        throw new PaymentError(
            error.response?.data || '결제 처리 중 오류가 발생했습니다.',
            ERROR_TYPES.PAYMENT_REQUEST
        );
    };

    return (
        <PaymentContext.Provider 
            value={{
                loading,
                currentPayment,
                sdkInitialized,
                verifyPayment,
                cancelPayment,
                preparePayment,
                requestPayment,
                resetPaymentState,
                searchPaymentHistory,
                requestVirtualAccount,
                getPaymentHistoryByImpUid,
                getPaymentHistoryByOrderId,
                getPaymentHistoryByMerchantUid,
            }}
        >
            {children}
        </PaymentContext.Provider>
    );
};

// 커스텀 훅
export const usePayment = () => {
    const context = useContext(PaymentContext);
    if (!context) {
        throw new PaymentError('usePayment must be used within a PaymentProvider', ERROR_TYPES.PAYMENT_REQUEST);
    }
    return context;
};