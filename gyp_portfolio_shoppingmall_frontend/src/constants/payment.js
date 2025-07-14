// 결제 상태 정의
export const PAYMENT_STATUS = {
    PENDING: 'PENDING',
    PAID: 'PAID',
    CANCELLED: 'CANCELLED',
    FAILED: 'FAILED'
};

// 결제 방법 정의
export const PAYMENT_METHOD = {
    CARD: 'card',
    VIRTUAL_ACCOUNT: 'vbank',
    TRANSFER: 'trans',
    MOBILE: 'phone'
};

// API 엔드포인트 정의
export const API_ENDPOINTS = {
    PREPARE: '/payment/prepare',
    VERIFY: (paymentId) => `/payment/verify/${paymentId}`,
    CANCEL: (paymentId) => `/payment/cancel/${paymentId}`,
    VIRTUAL_ACCOUNT: (paymentId) => `/payment/${paymentId}/virtual-account`,
    WEBHOOK: '/payment/webhook',
    HISTORY: {
        IMP: (impUid) => `/payment/history/imp/${impUid}`,
        MERCHANT: (merchantUid) => `/payment/history/merchant/${merchantUid}`,
        ORDER: (orderId) => `/payment/history/order/${orderId}`,
        ADMIN_LIST: '/payment/historyListForAdmin'
    }
};

// 오류 타입 정의
export const ERROR_TYPES = {
    PAYMENT_REQUEST: 'PAYMENT_REQUEST_ERROR',
    PAYMENT_VERIFICATION: 'PAYMENT_VERIFICATION_ERROR',
    PAYMENT_CANCELLATION: 'PAYMENT_CANCELLATION_ERROR',
    INVALID_AMOUNT: 'INVALID_AMOUNT_ERROR',
    INVALID_PRODUCT: 'INVALID_PRODUCT_ERROR',
    INVALID_BUYER: 'INVALID_BUYER_ERROR',
    NETWORK: 'NETWORK_ERROR'
};