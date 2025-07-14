import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { modalCommonStyle, modalSizeStyle } from '../styles/modalStyles';
import { useResponsive } from '../contexts/ResponsiveContext';
import { AuthContext } from '../contexts/AuthContext';
import styled from 'styled-components';
import { 
    Table, Tag, Button, Space, Modal, 
    Timeline, App, DatePicker, Form,
    Descriptions, Select, Alert,
    Input, Spin, Empty, Card, List,
    Rate, Popconfirm,
} from 'antd';
import {
    EyeOutlined,
    TruckOutlined,
    ReloadOutlined,
    SearchOutlined,
    QuestionOutlined,
    RollbackOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons';

const { RangePicker } = DatePicker;


//#region Styled Components
// 주문 관리 페이지 컨테이너
const OrderContainer = styled.div`
    padding: 0;
    background: white;

    .error-container {
        text-align: center;
        padding: 40px 20px;
    }

    .detail-product-table {
        .ant-table-cell {
            white-space: nowrap;
            padding: 8px 16px;
        }
    }

    .ant-table-pagination {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        width: 100% !important;

        .ant-pagination-total-text {
            float: left;
            margin-right: auto;
        }

        .ant-pagination-options {
            float: right;
            margin-left: auto;
        }

        .ant-pagination-prev,
        .ant-pagination-next,
        .ant-pagination-item {
            position: relative;
            left: 0;
            transform: none;
        }
    }
`;

// 페이지 제목
const PageTitle = styled.h2`
    text-align: center;
    margin-top: 0;
    margin-bottom: 12px;
`;

// 검색 영역
const SearchContainer = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 16px;
    margin-bottom: 6px;
`;

// 주문 콘텐츠 컨테이너
const OrderContentContainer = styled.div`
    padding: 0 8px;
`;

// 로딩 컨테이너
const LoadingContainer = styled.div`
    text-align: center;
    padding: 40px 0;
`;

// 모바일 페이지 리스트 스타일
const StyledList = styled(List)`
    .ant-list-pagination {
        margin-top: 16px !important;
        position: relative;
        width: 100%;

        .ant-pagination {
            width: 100% !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
        }

        .ant-pagination-total-text {
            position: absolute;
            left: 0;
        }
            
        &::before {
            content: '';
            position: absolute;
            right: 0;
            width: 150px;
            display: block;
        }

        .ant-pagination-prev,
        .ant-pagination-next,
        .ant-pagination-item {
            margin: 0 4px;
        }
    }
`;

// 모바일 주문 카드 컨테이너
const OrderCardContainer = styled(Card)`
    margin-bottom: 16px;
    border: 1px solid #d9d9d9;
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
`;

// 주문 카드 정보
const OrderCardInfo = styled.div`
    margin-bottom: 5px;
    padding-left: 5px;
`;

// 주문 카드 정보 그리드
const OrderCardInfoGrid = styled.div`
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 8px 12px;
    align-items: center;
`;

// 주문 카드 라벨
const OrderCardLabel = styled.span`
    color: #8c8c8c;
`;

// 주문 카드 값
const OrderCardValue = styled.span`
    font-weight: 500;
`;

// 주문 카드 가격
const OrderCardPrice = styled.span`
    font-weight: 600;
    color: #1890ff;
    font-size: 1.1em;
`;

// 주문 카드 품목
const OrderCardProductItemList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
`;

// 주문 카드 상품
const OrderCardProductItem = styled.div`
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    padding: 12px;
    background-color: #fafafa;
`;

// 주문 카드 상품 정보
const OrderCardProductItemInfo = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

// 주문 카드 상품 이름
const OrderCardProductItemName = styled.div`
    font-weight: 500;
    margin-left: 2px;
`;

// 주문 카드 상품 옵션
const OrderCardProductItemOption = styled.div`
    color: #666;
    font-size: 0.9em;
    margin-left: 2px;
    margin-bottom: 5px;
`;

// 주문 카드 상품 버튼 영역
const OrderCardProductItemButtonSpace = styled(Space)`
    gap: 2px;
`;

// 주문 카드 상품 버튼
const OrderCardProductItemButton = styled(Button)`
    width: 100%;
    border-radius: 6px;
`;

// 주문 카드 하단 영역
const OrderCardFooter = styled.div`
    margin-top: 10px;
    padding: 0 16px 0px 16px;
`;

// 상품 정보 칼럼 렌더링 컨테이너
const ProductInfoColumnContainer = styled.div`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

// 주문 상세정보 버튼
const OrderCardDetailButton = styled(Button)`
    width: 100%;
    border-radius: 6px;
    margin-top: 10px;
`;

// 작업 칼럼 버튼 컨테이너
const OrderActionColumnContainer = styled(Space)`
    width: 100%;
    justify-content: center;
    display: flex;
`;

// 주문 상세 모달
const OrderDetailModal = styled(Modal)`
    ${modalSizeStyle(800)}
    ${modalCommonStyle}

    .ant-modal-body {
        padding: 0;
        max-height: calc(100vh - 120px);
        overflow: auto;
        display: flex;
        flex-direction: column;
    }

    .ant-modal-content {
        overflow: visible;
    }
`;

// 주문 상세 모달 컨테이너 헤더
const OrderDetailModalHeader = styled.div`
    padding: 12px 24px;
    display: flex;
    justify-content: center;
    align-items: center;

    @media (max-width: 768px) {
        padding: 8px 12px;
    }
`;

// 주문 상세 모달 타이틀
const OrderDetailModalTitle = styled.div`
    font-size: clamp(14px, 2.5vw, 18px);
    font-weight: bold;
    overflow: hidden;
    text-align: center;
`;

// 주문 상세 모달 컨테이너
const OrderDetailModalContainer = styled.div`
    flex: 1;
    overflow: auto;
    padding: 0;
`;

// 배송 조회 모달
const DeliveryModal = styled(Modal)`
    ${modalSizeStyle(400)}
    ${modalCommonStyle}

    .ant-modal-content {
        max-height: calc(100vh - 100px);
        display: flex;
        flex-direction: column;
    }

    .ant-modal-body {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        max-height: calc(100vh - 200px);
    }

    .ant-descriptions-item-label {
        width: 100px !important;
    }

    .ant-timeline-item-last {
        padding-bottom: 0px !important;
    }
`;

// 교환/반품/취소 신청 모달
const RequestModal = styled(Modal)`
    ${modalSizeStyle(300)}
    ${modalCommonStyle}
`;

// 신청 모달 컨테이너
const RequestContainer = styled.div`
    .ant-form-item-label {
        padding-bottom: 0px !important;
        margin-bottom: 0px !important;
    }
`;

// 리뷰 모달
const ReviewModal = styled(Modal)`
    ${modalSizeStyle(300)}
    ${modalCommonStyle}
`;

// 리뷰 모달 컨테이너
const ReviewContainer = styled.div`
    .ant-rate {
        font-size: 32px;
    }

    .ant-form-item-label {
        padding-bottom: 4px;
    }
`;
//#endregion Styled Components


//#region Constants
// 주문 상태 상수 정의
const ORDER_STATUS = {
    PAYMENT_PENDING: 'PAYMENT_PENDING',
    PAYMENT_COMPLETED: 'PAYMENT_COMPLETED',
    PREPARING: 'PREPARING',
    DELIVERING: 'DELIVERING',
    DELIVERED: 'DELIVERED',
    DELIVERY_CONFIRMED: 'DELIVERY_CONFIRMED',
    CANCEL_REQUESTED: 'CANCEL_REQUESTED',
    CANCELLED: 'CANCELLED',
    RETURN_REQUESTED: 'RETURN_REQUESTED',
    RETURNING: 'RETURNING',
    RETURNED: 'RETURNED',
    EXCHANGE_REQUESTED: 'EXCHANGE_REQUESTED',
    EXCHANGE_RETURNING: 'EXCHANGE_RETURNING',
    EXCHANGE_PREPARING: 'EXCHANGE_PREPARING',
    EXCHANGE_DELIVERING: 'EXCHANGE_DELIVERING',
    EXCHANGE_DELIVERED: 'EXCHANGE_DELIVERED'
};

// 배송 타입 상수
const DELIVERY_TYPE = {
    ORDER_OUT: 'ORDER_OUT',
    EXCHANGE_OUT: 'EXCHANGE_OUT',
    EXCHANGE_IN: 'EXCHANGE_IN',
    RETURN_IN: 'RETURN_IN'
};

// 배송 상태 상수
const DELIVERY_STATUS = {
    PREPARING: 'PREPARING',
    DELIVERING: 'DELIVERING',
    DELIVERED: 'DELIVERED',
    CONFIRMED: 'CONFIRMED',
    RETURN: 'RETURN'
};

// 배송 조회 가능한 상태
const DELIVERY_TRACKABLE_STATUS = [
    ORDER_STATUS.DELIVERING,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.DELIVERY_CONFIRMED,
    ORDER_STATUS.EXCHANGE_PREPARING,
    ORDER_STATUS.EXCHANGE_DELIVERING,
    ORDER_STATUS.EXCHANGE_DELIVERED,
    ORDER_STATUS.RETURNING,
    ORDER_STATUS.RETURNED,
    ORDER_STATUS.EXCHANGE_RETURNING
];

// 주문 취소 가능한 상태
const CANCELABLE_STATUS = [
    ORDER_STATUS.PAYMENT_PENDING,
    ORDER_STATUS.PAYMENT_COMPLETED
];

// 주문 상태에 따른 태그 색상
const STATUS_CONFIG = {
    [ORDER_STATUS.PAYMENT_PENDING]: { color: 'orange', text: '결제 대기' },
    [ORDER_STATUS.PAYMENT_COMPLETED]: { color: 'geekblue', text: '결제 완료' },
    [ORDER_STATUS.PREPARING]: { color: 'processing', text: '배송 준비중' },
    [ORDER_STATUS.DELIVERING]: { color: 'blue', text: '배송중' },
    [ORDER_STATUS.DELIVERED]: { color: 'green', text: '배송 완료' },
    [ORDER_STATUS.DELIVERY_CONFIRMED]: { color: 'success', text: '구매 확정' },
    [ORDER_STATUS.CANCEL_REQUESTED]: { color: 'red', text: '취소 요청' },
    [ORDER_STATUS.CANCELLED]: { color: 'error', text: '취소 완료' },
    [ORDER_STATUS.RETURN_REQUESTED]: { color: 'volcano', text: '반품 요청' },
    [ORDER_STATUS.RETURNING]: { color: 'purple', text: '반품중' },
    [ORDER_STATUS.RETURNED]: { color: 'default', text: '반품 완료' },
    [ORDER_STATUS.EXCHANGE_REQUESTED]: { color: 'magenta', text: '교환 요청' },
    [ORDER_STATUS.EXCHANGE_RETURNING]: { color: 'purple', text: '교환 반품중' },
    [ORDER_STATUS.EXCHANGE_PREPARING]: { color: 'processing', text: '교환 준비중' },
    [ORDER_STATUS.EXCHANGE_DELIVERING]: { color: 'blue', text: '교환 배송중' },
    [ORDER_STATUS.EXCHANGE_DELIVERED]: { color: 'green', text: '교환 완료' }
};

// 신청 이유 옵션
const REQUEST_REASON_OPTIONS = {
    exchange: [
        { value: 'unlike_option', label: '색상/사이즈가 마음에 들지 않습니다' },
        { value: 'defective_product', label: '불량품/파손된 상품을 받았습니다' },
        { value: 'wrong_product', label: '주문한 상품과 다른 상품이 왔습니다' },
        { value: 'other', label: '기타 이유(직접 작성)' }
    ],
    return: [
        { value: 'unlike_option', label: '색상/사이즈가 마음에 들지 않습니다' },
        { value: 'defective_product', label: '불량품/파손된 상품을 받았습니다' },
        { value: 'delivery_delayed', label: '배송이 너무 늦었습니다' },
        { value: 'not_needed', label: '필요 없어졌습니다' },
        { value: 'other', label: '기타 이유(직접 작성)' }
    ],
    cancel: [
        { value: 'mind_changed', label: '마음이 바뀌었습니다' },
        { value: 'delivery_delayed', label: '배송 시작이 너무 늦었습니다' },
        { value: 'payment_issue', label: '다른 결제 방법을 사용하고 싶습니다' },
        { value: 'other', label: '기타 이유(직접 작성)' }
    ]
};
//#endregion Constants


// 주문 관리 페이지
const OrderManagement = () => {


    //#region Hooks & States
    const { message } = App.useApp();
    const { isMobile } = useResponsive();
    const { authRequest, user } = useContext(AuthContext);

    const [reviewForm] = Form.useForm();
    const [requestForm] = Form.useForm();
    const [error, setError] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState(null);
    const [reviewType, setReviewType] = useState(null);
    const [userReviews, setUserReviews] = useState([]);
    const [requestType, setRequestType] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [deliveryHistory, setDeliveryHistory] = useState([]);
    const [appliedDateRange, setAppliedDateRange] = useState(null);
    const [showCustomReason, setShowCustomReason] = useState(false);
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
    const [requestModalVisible, setRequestModalVisible] = useState(false);
    const [selectedOrderProduct, setSelectedOrderProduct] = useState(null);
    //#endregion Hooks & States

    
    //#region API Functions
    // 주문 목록 조회
    const fetchOrders = useCallback(async (showLoading = true) => {
        if (!user) return;

        try {
            if (showLoading) setLoading(true);
            setError(null);

            const response = await authRequest('get', '/order/orderList');
            
            setOrders(response.data);
        } catch (error) {
            setError(error);
            console.error('주문 목록 조회 에러:', error);
        
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '예기치 못한 오류로 주문 목록 조회에 실패했습니다.');
            }
        } finally {
            if (showLoading) setLoading(false);
        }
    }, [authRequest, message, user]);

    // 주문 상세 정보 조회
    const fetchOrderDetail = useCallback(async (orderId) => {
        if (!orderId || !user) return;
        
        try {
            setModalLoading(true);
            
            const response = await authRequest('get', '/order/orderDetail', {
                orderId: orderId
            });
            
            setSelectedOrderDetail(response.data);
            setDetailModalVisible(true);
        } catch (error) {
            console.error('주문 상세 정보 조회 에러:', error);
        
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '예기치 못한 오류로 주문 상세 정보 조회에 실패했습니다.');
            }
        } finally {
            setModalLoading(false);
        }
    }, [authRequest, message, user]);

    // 배송 이력 조회
    const fetchDeliveryHistory = useCallback(async (orderProductId) => {
        if (!orderProductId || !user) return;
        
        try {
            const response = await authRequest('get', '/order/getDeliveryHistory', {
                orderProductId: orderProductId
            });
            
            setDeliveryHistory(response.data);
            setModalVisible(true);
        } catch (error) {
            console.error('배송 이력 조회 에러:', error);
        
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '예기치 못한 오류로 배송 이력 조회에 실패했습니다.');
            }
        }
    }, [authRequest, message, user]);

    // 리뷰 조회
    const fetchUserReviews = useCallback(async () => {
        if (!user) return;
        
        try {
            const response = await authRequest('get', '/review/listByUserId');

            setUserReviews(response.data);
        } catch (error) {        
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '리뷰 조회 중 오류가 발생했습니다.');
            }
        }
    }, [authRequest, message, user]);

    // 구매확정 버튼 클릭 핸들러
    const handleConfirmDelivery = useCallback(async (orderProductId) => {
        if (!user) return;
        
        try {
            const response = await authRequest(
                'post', '/order/updateOrderStatusToDeliveryConfirmed', 
                {
                    orderProductId,
                    orderId: selectedOrderDetail.orderId,
                    version: selectedOrderProduct.version
                }
            );
            
            message.success(response.data);
            await fetchOrderDetail(selectedOrderDetail.orderId);
        } catch (error) {
            console.error('구매 확정 처리 에러:', error);
        
            if (error.response?.status === 409) {
                message.error('주문 정보가 변경되었습니다. 페이지를 새로고침 해주세요.');
            } else if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '예기치 못한 오류로 구매 확정 처리에 실패했습니다.');
            }
        }
    }, [
        authRequest, 
        message, 
        selectedOrderDetail, 
        fetchOrderDetail, 
        selectedOrderProduct, 
        user
    ]);

    // 주문취소, 교환, 환불 신청 핸들러
    const handleRequestSubmit = useCallback(async (values) => {
        if (!user) return;
        
        try {
            let status;
            const reasonText = values.reason === 'other' 
                ? values.customReason
                : REQUEST_REASON_OPTIONS[requestType].find(option => 
                    option.value === values.reason
                ).label;
            
            switch (requestType) {
                case 'exchange':
                    status = 'EXCHANGE_REQUESTED';
                    break;
                case 'return':
                    status = 'RETURN_REQUESTED';
                    break;
                case 'cancel':
                    status = 'CANCEL_REQUESTED';
                    break;
                default:
                    throw new Error('잘못된 요청 타입입니다.');
            }

            const response = await authRequest('post', '/order/updateOrderProductRequest', {
                orderProductId: selectedOrderProduct.orderProductId,
                orderId: selectedOrderDetail.orderId,
                status: status,
                requestReason: reasonText,
                requestQuantity: values.quantity,
                version: selectedOrderProduct.version
            });

            message.success(response.data);
            setRequestModalVisible(false);
            requestForm.resetFields();
            await fetchOrderDetail(selectedOrderDetail.orderId);
        } catch (error) {
            console.error('주문 취소/반품/교환 요청 에러:', error);
        
            if (error.response?.status === 409) {
                message.error('주문 정보가 변경되었습니다. 페이지를 새로고침 해주세요.');
            } else if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '예기치 못한 오류로 주문 취소/반품/교환 요청에 실패했습니다.');
            }
        }
    }, [
        authRequest, 
        message, 
        selectedOrderDetail, 
        fetchOrderDetail, 
        selectedOrderProduct, 
        requestForm,
        requestType,
        user
    ]);

    // 리뷰 등록/수정 핸들러
    const handleReviewSubmit = useCallback(async (values) => {
        if (!user) return;
        
        try {
            const existingReview = userReviews.find(review => 
                review.orderProductId === selectedOrderProduct?.orderProductId
            );
            const isUpdate = existingReview && !existingReview.isDeleted;

            const response = await authRequest('post', isUpdate ? '/review/updateReview' : '/review/insertReview', {
                orderProductId: selectedOrderProduct.orderProductId,
                productItemId: selectedOrderProduct.productItemId,
                reviewId: isUpdate ? existingReview.reviewId : undefined,
                rating: values.rating,
                comment: values.comment,
                version: isUpdate ? existingReview.version : 0
            });

            message.success(response.data);

            setReviewModalVisible(false);
            
            await Promise.all([
                fetchUserReviews(),
                fetchOrders()
            ]);
            
            setTimeout(() => {
                reviewForm.resetFields();
            }, 100);
        } catch (error) {
            console.error('리뷰 저장 에러:', error);
        
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '예기치 못한 오류로 리뷰 저장에 실패했습니다.');
            }
        }
    }, [
        authRequest, 
        message, 
        userReviews, 
        selectedOrderProduct, 
        fetchOrders,
        fetchUserReviews,
        reviewForm,
        user
    ]);

    // 리뷰 삭제 핸들러
    const handleReviewDelete = useCallback(async () => {
        if (!user) return;
        
        try {
            const existingReview = userReviews.find(review => 
                review.orderProductId === selectedOrderProduct?.orderProductId
            );

            const response = await authRequest('post', '/review/deleteReview', {
                reviewId: existingReview.reviewId
            });
            
            message.success(response.data);

            setReviewModalVisible(false);

            await Promise.all([
                fetchUserReviews(),
                fetchOrders()
            ]);

            setTimeout(() => {
                reviewForm.resetFields();
            }, 100);
        } catch (error) {
            console.error('리뷰 삭제 에러:', error);
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '예기치 못한 오류로 리뷰 삭제에 실패했습니다.');
            }
        }
    }, [
        message, 
        reviewForm, 
        authRequest, 
        userReviews, 
        selectedOrderProduct, 
        fetchOrders,
        fetchUserReviews, 
        user
    ]);
    //#endregion API Functions


    //#region Event Handlers
    // 조회 버튼 클릭 핸들러 수정
    const handleSearch = () => {
        setAppliedDateRange(dateRange);
        fetchOrders();
    };
    //#endregion Event Handlers


    //#region Utility Functions
    // 가격 포맷팅
    const formatPrice = (price) => {
        if (typeof price !== 'number') return '₩0';
        return `₩${price.toLocaleString()}`;
    };

    // 날짜 포맷팅
    const formatDate = (date) => {
        if (!date) return '-';
        const dateObj = new Date(date);
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth() + 1;
        const day = dateObj.getDate();
        
        const datePart = `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}`;
        
        return (
            <div style={{ whiteSpace: 'normal' }}>
                <div>{datePart}</div>
            </div>
        );
    };

    // 주문 상태 태그 색상 조회
    const getStatusTagColor = (status) => {
        const config = STATUS_CONFIG[status];
        return config ? config.color : 'default';
    };

    // 배송 타입 정보 조회
    const getDeliveryTypeInfo = (type) => {
        const typeConfig = {
            [DELIVERY_TYPE.ORDER_OUT]: { 
                color: 'blue', 
                label: '배송', 
                icon: <TruckOutlined style={{ fontSize: '24px', color: 'black' }}/> 
            },
            [DELIVERY_TYPE.EXCHANGE_OUT]: { 
                color: 'green', 
                label: '교환 상품 배송', 
                icon: <TruckOutlined style={{ fontSize: '24px', color: 'black' }}/> 
            },
            [DELIVERY_TYPE.EXCHANGE_IN]: { 
                color: 'orange', 
                label: '교환 회수', 
                icon: <RollbackOutlined style={{ fontSize: '24px', color: 'black' }}/> 
            },
            [DELIVERY_TYPE.RETURN_IN]: { 
                color: 'red', 
                label: '반품 회수', 
                icon: <RollbackOutlined style={{ fontSize: '24px', color: 'black' }}/> 
            }
        };
        
        return typeConfig[type] || { 
            color: 'gray', 
            label: type || '알 수 없음', 
            icon: <QuestionOutlined style={{ fontSize: '24px', color: 'black' }}/> 
        };
    };

    // 주문 데이터 변환(orderProductDTOList 평탄화)
    const transformOrdersData = (orders) => {
        return orders.flatMap(order => {
            return order.orderProductDTOList.map((orderProduct, index) => ({
                key: `${order.orderId}_${orderProduct.orderProductId}`,
                orderId: order.orderId,
                merchantUid: order.merchantUid,
                createdAt: order.createdAt,
                currentTotalPrice: order.currentTotalPrice,
                orderProduct: orderProduct,
                isFirstInOrder: index === 0,
                orderProductCount: order.orderProductDTOList.length
            }));
        });
    };

    // 날짜 범위로 주문 필터링
    const ordersByDateRange = useMemo(() => {
        if (!appliedDateRange || !appliedDateRange[0] || !appliedDateRange[1]) {
            return orders;
        }

        const startDate = appliedDateRange[0].startOf('day');
        const endDate = appliedDateRange[1].endOf('day');

        return orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= startDate.toDate() && orderDate <= endDate.toDate();
        });
    }, [orders, appliedDateRange]);
    //#endregion Utility Functions


    //#region Component Renderers    
    // 주문 상태 태그
    const OrderStatusTag = React.memo(({ status }) => {
        const config = STATUS_CONFIG[status] || { color: 'default', text: status };
                return (
            <Tag 
                color={config.color}
                aria-label={`주문 상태: ${config.text}`}
            >
                {config.text}
            </Tag>
        );
    });

    // 주문 카드 상품 상태 태그
    const OrderCardProductItemStatusTag = React.memo(({ status }) => (
        <Tag 
            color={getStatusTagColor(status)}
            style={{ margin: 0 }}
        >
            {STATUS_CONFIG[status]?.text || status}
        </Tag>
    ));
    
    // 오류 처리
    const ErrorFallback = ({ error, onRetry }) => (
        <div className="error-container">
            <Alert
                message="오류가 발생했습니다"
                description={
                    typeof error?.message === 'string' 
                        ? error.message 
                        : '알 수 없는 오류가 발생했습니다.'
                }
                type="error"
                action={
                    <Button size="small" danger onClick={onRetry}>
                        <ReloadOutlined /> 다시 시도
                    </Button>
                }
            />
        </div>
    );

    // 상품 정보 칼럼 렌더링
    const OrderProductInfoColumn = React.memo(({ orderProduct }) => {
        return (
            <ProductInfoColumnContainer>
                {`${orderProduct.productName} (${orderProduct.size}/${orderProduct.color}, ${orderProduct.changedQuantity}개)`}
            </ProductInfoColumnContainer>
        );
    });

    // 주문 상태 칼럼 렌더링
    const OrderStatusColumn = React.memo(({ status }) => {
        return (
            <Space direction="vertical">
                <OrderStatusTag status={status} />
                </Space>
        );
    });

    // 작업 칼럼 렌더링
    const OrderActionColumn = React.memo(({ 
        orderProduct, 
        onDeliveryCheck, 
        onConfirmDelivery,
        onRequestAction,
        onReviewAction,
        userReviews
    }) => {
        const actions = [];
        
        // 배송조회 버튼
        if (DELIVERY_TRACKABLE_STATUS.includes(orderProduct.status)) {
            actions.push(
                <Button
                    key="delivery-check"
                    size="small"
                    onClick={() => onDeliveryCheck(orderProduct.orderProductId)}
                >
                    배송조회
                </Button>
            );
        }
    
        // 주문 취소 버튼
        if (CANCELABLE_STATUS.includes(orderProduct.status)) {
            actions.push(
                <Button
                    key="cancel"
                    size="small"
                    danger
                    onClick={() => onRequestAction('cancel', orderProduct)}
                >
                    주문취소
                </Button>
            );
        }
    
        // 배송 완료 상태의 작업 버튼들
        if (orderProduct.status === ORDER_STATUS.DELIVERED) {
            actions.push(
                <Button
                    key="confirm"
                    type="primary"
                    size="small"
                    onClick={() => onConfirmDelivery(orderProduct.orderProductId)}
                >
                    구매확정
                </Button>,
                <Button
                    key="exchange"
                    size="small"
                    onClick={() => onRequestAction('exchange', orderProduct)}
                >
                    교환신청
                </Button>,
                <Button
                    key="return"
                    size="small"
                    onClick={() => onRequestAction('return', orderProduct)}
                >
                    반품신청
                </Button>
            );
        }

        // 구매확정 상태의 작업 버튼들
        if (orderProduct.status === ORDER_STATUS.DELIVERY_CONFIRMED) {
            const review = userReviews.find(review => 
                review.orderProductId === orderProduct.orderProductId
            );

            if (review === undefined || review === null) {
                // 리뷰가 없는 경우에만 작성 버튼 표시
                actions.push(
                    <Button
                        key="review"
                        size="small"
                        onClick={() => onReviewAction('create', orderProduct)}
                    >
                        리뷰작성
                    </Button>
                );
            } else if (review.isDeleted) {
                // 삭제된 리뷰인 경우
                actions.push(
                    <Button
                        key="review"
                        size="small"
                        disabled
                    >
                        리뷰 삭제됨
                    </Button>
                );
            } else {
                // 존재하는 리뷰인 경우
                actions.push(
                    <Button
                        key="review"
                        size="small"
                        onClick={() => onReviewAction('update', orderProduct)}
                    >
                        리뷰수정
                    </Button>
                );
            }
        }
    
        return actions.length > 0 ? (
            <OrderActionColumnContainer 
                size={[4, 4]} 
                wrap
            >
                {actions}
            </OrderActionColumnContainer>
        ) : (
            <span style={{ color: '#999' }}>-</span>
        );
    }, (prevProps, nextProps) => {
        // userReviews가 변경되면 다시 렌더링하도록 비교 함수 추가
        return prevProps.orderProduct === nextProps.orderProduct &&
            prevProps.userReviews === nextProps.userReviews;
    });

    // 주문 상세 버튼 칼럼 렌더링
    const OrderDetailColumn = React.memo(({ 
        isFirstInOrder, 
        orderId, 
        onDetailClick 
    }) => {
        if (!isFirstInOrder) return null;

        return (
                    <Button 
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                    onDetailClick(orderId);
                        }}
                        icon={<EyeOutlined />}
                    />
        );
    });

    // 주문 상세 모달 상품 상태 칼럼 렌더링
    const OrderDetailStatusColumn = React.memo(({ status }) => (
        <Tag 
            color={getStatusTagColor(status)}
            style={{ margin: 0 }}
        >
            {STATUS_CONFIG[status]?.text || status}
        </Tag>
    ));
    
    // 주문 상세 모달 상품 옵션 칼럼 렌더링
    const OrderDetailOptionColumn = React.memo(({ size, color }) => (
        `${size} / ${color}`
    ));

    // 모바일용 주문 카드 컴포넌트
    const OrderCard = ({ 
        orderMaster, 
        onDetailClick, 
        onDeliveryCheck, 
        onRequestAction,
        onConfirmDelivery,
        onReviewAction,
        userReviews
    }) => {
        return (
            <OrderCardContainer 
                size="small" 
            >
                <OrderCardInfo>
                    <OrderCardInfoGrid>
                        <OrderCardLabel>주문일자</OrderCardLabel>
                        <OrderCardValue>
                            {formatDate(orderMaster.createdAt)}
                        </OrderCardValue>
                        
                        <OrderCardLabel>주문번호</OrderCardLabel>
                        <OrderCardValue>
                            {orderMaster.merchantUid}
                        </OrderCardValue>
                        
                        <OrderCardLabel>결제금액</OrderCardLabel>
                        <OrderCardPrice>
                            {formatPrice(orderMaster.currentTotalPrice)}
                        </OrderCardPrice>
                    </OrderCardInfoGrid>
                </OrderCardInfo>

                <OrderCardProductItemList>
                    {orderMaster.orderProductDTOList.map(orderProduct => (
                        <OrderCardProductItem 
                            key={orderProduct.orderProductId}
                        >
                            <OrderCardProductItemInfo>
                                <div>
                                    <OrderCardProductItemName>{orderProduct.productName}</OrderCardProductItemName>
                                    <OrderCardProductItemOption>
                                        {`${orderProduct.size} / ${orderProduct.color}`}
                                    </OrderCardProductItemOption>
                                    <OrderCardProductItemStatusTag status={orderProduct.status} />
                                </div>
                                
                                <OrderCardProductItemButtonSpace 
                                    direction="vertical" 
                                    size={8}
                                >
                                    {/* 배송조회 버튼 */}
                                    {DELIVERY_TRACKABLE_STATUS.includes(orderProduct.status) && (
                                        <OrderCardProductItemButton
                                            size="small"
                                            block
                                            onClick={() => onDeliveryCheck(orderProduct.orderProductId)}
                                        >
                                            배송조회
                                        </OrderCardProductItemButton>
                                    )}

                                    {/* 주문취소 버튼 */}
                                    {CANCELABLE_STATUS.includes(orderProduct.status) && (
                                        <OrderCardProductItemButton
                                            size="small"
                                            danger
                                            block
                                            onClick={() => onRequestAction('cancel', orderProduct)}
                                        >
                                            주문취소
                                        </OrderCardProductItemButton>
                                    )}

                                    {/* 배송 완료 상태의 작업 버튼들 */}
                                    {orderProduct.status === ORDER_STATUS.DELIVERED && (
                                        <>
                                            <OrderCardProductItemButton
                                                type="primary"
                                                size="small"
                                                block
                                                onClick={() => onConfirmDelivery(orderProduct.orderProductId)}
                                            >
                                                구매확정
                                            </OrderCardProductItemButton>
                                            
                                            <OrderCardProductItemButton
                                                size="small"
                                                block
                                                onClick={() => onRequestAction('exchange', orderProduct)}
                                            >
                                                교환신청
                                            </OrderCardProductItemButton>
                                            
                                            <OrderCardProductItemButton
                                                size="small"
                                                block
                                                onClick={() => onRequestAction('return', orderProduct)}
                                            >
                                                반품신청
                                            </OrderCardProductItemButton>
                                        </>
                                    )}

                                    {/* 구매확정 상태의 작업 버튼들 */}
                                    {orderProduct.status === ORDER_STATUS.DELIVERY_CONFIRMED && (
                                        <>
                                            {(() => {
                                                const review = userReviews.find(review => 
                                                    review.orderProductId === orderProduct.orderProductId
                                                );

                                                if (review === undefined || review === null) {
                                                    return (
                                                        <OrderCardProductItemButton
                                                            size="small"
                                                            block
                                                            onClick={() => onReviewAction('create', orderProduct)}
                                                        >
                                                            리뷰작성
                                                        </OrderCardProductItemButton>
                                                    );
                                                } else if (review.isDeleted) {
                                                    return (
                                                        <OrderCardProductItemButton
                                                            size="small"
                                                            block
                                                            disabled
                                                        >
                                                            리뷰 삭제됨
                                                        </OrderCardProductItemButton>
                                                    );
                                                } else {
                                                    return (
                                                        <OrderCardProductItemButton
                                                            size="small"
                                                            block
                                                            onClick={() => onReviewAction('update', orderProduct)}
                                                        >
                                                            리뷰수정
                                                        </OrderCardProductItemButton>
                                                    );
                                                }
                                            })()}
                                        </>
                                    )}
                                </OrderCardProductItemButtonSpace>
                            </OrderCardProductItemInfo>
                        </OrderCardProductItem>
                    ))}
                </OrderCardProductItemList>
                
                <OrderCardFooter>
                    <OrderCardDetailButton 
                        type="default"
                        icon={<EyeOutlined />}
                        onClick={() => onDetailClick(orderMaster.orderId)}
                    >
                        주문 상세정보 보기
                    </OrderCardDetailButton>
                </OrderCardFooter>
            </OrderCardContainer>
        );
    };

    // 배송 이력 타임라인 아이템 생성
    const createDeliveryHistoryTimelineItems = (deliveryHistory) => {
        return deliveryHistory.map(history => {
            const typeInfo = getDeliveryTypeInfo(history.deliveryType);
            
            return {
                color: typeInfo.color,
                dot: history.deliveryStatus === DELIVERY_STATUS.DELIVERED ? 
                    <CheckCircleOutlined /> : typeInfo.icon,
                children: (
                    <>
                        <div style={{ marginBottom: 5 }}>
                            <Tag color={typeInfo.color} style={{ padding: '4px 8px' }}>
                                {typeInfo.label}
                            </Tag>
                        </div>
                        {history.invoiceNumber && (
                            <Descriptions
                                size="small"
                                column={1}
                                bordered
                                style={{ 
                                    backgroundColor: '#fafafa',
                                    borderRadius: '4px',
                                    marginBottom: 8 
                                }}
                            >
                                <Descriptions.Item 
                                    label={<span style={{ fontWeight: 500 }}>택배사</span>}
                                >
                                    {history.deliveryCompany}
                                </Descriptions.Item>
                                <Descriptions.Item 
                                    label={<span style={{ fontWeight: 500 }}>운송장번호</span>}
                                >
                                    {history.invoiceNumber}
                                </Descriptions.Item>
                                <Descriptions.Item 
                                    label={<span style={{ fontWeight: 500 }}>배송 시작</span>}
                                >
                                    {formatDate(history.deliveryStartDate)}
                                </Descriptions.Item>
                                <Descriptions.Item 
                                    label={<span style={{ fontWeight: 500 }}>배송 완료</span>}
                                >
                                    {history.deliveryCompleteDate ? 
                                        formatDate(history.deliveryCompleteDate) : 
                                        '-'
                                    }
                                </Descriptions.Item>
                            </Descriptions>
                        )}
                    </>
                )
            };
        });
    };
    //#endregion Component Renderers


    //#region Table Column Definitions    
    // 주문 목록 컬럼
    const columns = useMemo(() => [
        {
            title: '주문일자',
            dataIndex: 'createdAt',
            key: 'createdAt',
            align: 'center',
            width: 100,
            render: (date) => formatDate(date),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            onCell: (record) => ({
                rowSpan: record.isFirstInOrder ? record.orderProductCount : 0
            })
        },
        {
            title: '주문번호',
            dataIndex: 'merchantUid',
            key: 'merchantUid',
            align: 'center',
            width: 110,
            ellipsis: true,
            onCell: (record) => ({
                rowSpan: record.isFirstInOrder ? record.orderProductCount : 0
            })
        },
        {
            title: '주문금액',
            dataIndex: 'currentTotalPrice',
            key: 'currentTotalPrice',
            align: 'center',
            width: 100,
            render: (price) => formatPrice(price),
            sorter: (a, b) => a.currentTotalPrice - b.currentTotalPrice,
            onCell: (record) => ({
                rowSpan: record.isFirstInOrder ? record.orderProductCount : 0
            })
        },
        {
            title: '상품정보',
            dataIndex: 'orderProductDTOList',
            key: 'orderProductDTOList',
            align: 'center',
            render: (_, record) => <OrderProductInfoColumn orderProduct={record.orderProduct} />
        },
        {
            title: '주문상태',
            dataIndex: 'orderProductDTOList',
            key: 'status',
            align: 'center',
            width: 100,
            render: (_, record) => <OrderStatusColumn status={record.orderProduct.status} />,
                filters: Object.entries(STATUS_CONFIG).map(([value, config]) => ({
                    text: config.text,
                    value
                })),
            onFilter: (value, record) => record.orderProduct.status === value
        },
        {
            title: '작업',
            key: 'action',
            align: 'center',
            width: 100,
            render: (_, record) => (
                <OrderActionColumn
                    orderProduct={record.orderProduct}
                    onDeliveryCheck={fetchDeliveryHistory}
                    onConfirmDelivery={handleConfirmDelivery}
                    onRequestAction={(type, orderProduct) => {
                        setRequestType(type);
                        setSelectedOrderProduct(orderProduct);
                        setRequestModalVisible(true);
                    }}
                    onReviewAction={(type, orderProduct) => {
                        setReviewType(type);
                        setSelectedOrderProduct(orderProduct);
                        setReviewModalVisible(true);
                    }}
                    userReviews={userReviews}
                />
            )
        },
        {
            title: '상세',
            key: 'detail',
            align: 'center',
            width: 60,
            render: (_, record) => (
                <OrderDetailColumn
                    isFirstInOrder={record.isFirstInOrder}
                    orderId={record.orderId}
                    onDetailClick={fetchOrderDetail}
                />
            ),
            onCell: (record) => ({
                rowSpan: record.isFirstInOrder ? record.orderProductCount : 0
            })
        }
    ], [fetchDeliveryHistory, handleConfirmDelivery, fetchOrderDetail, userReviews]);
    
    // 주문 상세 모달 컬럼 정의
    const orderDetailColumns = useMemo(() => [
        {
            title: '상품명',
            dataIndex: 'orderProduct.productName',
            key: 'orderProduct.productName',
            align: 'center',
        },
        {
            title: '상품 옵션',
            key: 'option',
            align: 'center',
            render: (_, record) => (
                <OrderDetailOptionColumn 
                    size={record.size} 
                    color={record.color} 
                />
            )
        },
        {
            title: '수량',
            dataIndex: 'changedQuantity',
            key: 'quantity',
            align: 'center',
        },
        {
            title: '상태',
            key: 'status',
            align: 'center',
            render: (_, record) => (
                <OrderDetailStatusColumn status={record.status} />
            )
        }
    ], []);
    //#endregion Table Column Definitions


    //#region Effect Hooks
    // 데이터 로드
    useEffect(() => {
        fetchOrders();
        fetchUserReviews();
    }, [fetchOrders, fetchUserReviews]);

    // 리뷰 모달 초기 값 설정
    useEffect(() => {
        if (reviewModalVisible && selectedOrderProduct) {
            const existingReview = userReviews.find(
                review => review.orderProductId === selectedOrderProduct.orderProductId
            );
            
            reviewForm.setFieldsValue({
                rating: existingReview?.rating || 5,
                comment: existingReview?.comment || ''
            });
        }
    }, [reviewModalVisible, selectedOrderProduct, userReviews, reviewForm]);
    //#endregion Effect Hooks


    //#region Render Logic
    // 에러 상태 처리
    if (error && !orders.length) {
        return (
            <OrderContainer>
                <ErrorFallback 
                    error={error} 
                    onRetry={() => fetchOrders()} 
                />
            </OrderContainer>
        );
    }

    // 로그인 상태가 아니면 빈 페이지 반환
    if (!user) {
        return null;
    }

    return (
        <OrderContainer>
            <PageTitle>주문 관리</PageTitle>
            
            <SearchContainer>
                <RangePicker 
                    value={dateRange}
                    onChange={setDateRange}
                    format="YYYY-MM-DD"
                    placeholder={['조회 시작일', '조회 종료일']}
                />
                <Button 
                    type="primary" 
                    onClick={handleSearch}
                    loading={loading}
                    icon={<SearchOutlined />}
                >
                    조회
                </Button>
            </SearchContainer>

            {isMobile ? (
                <OrderContentContainer>
                    {loading ? (
                        <LoadingContainer>
                            <Spin size="large" />
                        </LoadingContainer>
                    ) : ordersByDateRange.length > 0 ? (
                        <StyledList
                            dataSource={ordersByDateRange}
                            renderItem={order => (
                                <OrderCard
                                    key={order.orderId}
                                    orderMaster={order}
                                    onDetailClick={fetchOrderDetail}
                                    onDeliveryCheck={fetchDeliveryHistory}
                                    onConfirmDelivery={handleConfirmDelivery}
                                    onRequestAction={(type, orderProduct) => {
                                        setRequestType(type);
                                        setSelectedOrderProduct(orderProduct);
                                        setRequestModalVisible(true);
                                    }}
                                    onReviewAction={(type, orderProduct) => {
                                        setReviewType(type);
                                        setSelectedOrderProduct(orderProduct);
                                        setReviewModalVisible(true);
                                    }}
                                    userReviews={userReviews}
                                />
                            )}
                            pagination={{
                                total: ordersByDateRange.length,
                                pageSize: 10,
                                showTotal: (total, range) => 
                                    `${range[0]}-${range[1]} / 총 ${total}건`,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                hideOnSinglePage: false,
                                size: 'small',
                            }}
                            locale={{
                                emptyText: <Empty description="주문 내역이 없습니다." />
                            }}
                        />
                    ) : (
                        <Empty description="주문 내역이 없습니다." />
                    )}
                </OrderContentContainer>
            ) : (
                <Table
                    loading={loading}
                    columns={columns}
                    dataSource={transformOrdersData(ordersByDateRange)}
                    scroll={{ x: 'max-content' }}
                    size="small"
                    rowKey="key"
                    locale={{
                        emptyText: loading ? <Spin /> : <Empty description="주문 내역이 없습니다." />
                    }}
                    pagination={{
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => 
                            `${range[0]}-${range[1]} / 총 ${total}건`,
                        position: ['bottomRight'],
                        itemRender: (page, type, originalElement) => {
                            if (type === 'prev') {
                                return <Button type="link" size="small">이전</Button>;
                            }
                            if (type === 'next') {
                                return <Button type="link" size="small">다음</Button>;
                            }
                            return originalElement;
                        },
                        style: { 
                            marginTop: 16,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }
                    }}
                />
            )}

            {/* 주문 상세 모달 */}
            <OrderDetailModal
                title={null}
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
            >
                <OrderDetailModalHeader>
                    <OrderDetailModalTitle>
                            주문 상세 정보
                    </OrderDetailModalTitle>
                </OrderDetailModalHeader>

                <OrderDetailModalContainer>
                    {modalLoading ? (
                        <LoadingContainer>
                            <Spin size="large" />
                        </LoadingContainer>
                    ) : selectedOrderDetail && (
                    <div>
                        <Descriptions
                            bordered
                            column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
                            size="small"
                            style={{
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-all'
                            }}
                        >
                            <Descriptions.Item label="주문 번호">{selectedOrderDetail.merchantUid}</Descriptions.Item>
                            <Descriptions.Item label="주문 일시">{formatDate(selectedOrderDetail.createdAt)}</Descriptions.Item>
                            <Descriptions.Item label="결제 방법">{selectedOrderDetail.paymentMethod}</Descriptions.Item>
                            <Descriptions.Item label="총 금액">
                                {`₩${Number(selectedOrderDetail.currentTotalPrice + selectedOrderDetail.deliveryFee).toLocaleString()}`}
                                {` (${selectedOrderDetail.deliveryFee > 0 
                                    ? `배송비 ₩${Number(selectedOrderDetail.deliveryFee).toLocaleString()} 포함` 
                                    : '무료배송'
                                })`}
                            </Descriptions.Item>
                            <Descriptions.Item label="수령인">{selectedOrderDetail.recipientName}</Descriptions.Item>
                            <Descriptions.Item label="연락처">{selectedOrderDetail.recipientPhone}</Descriptions.Item>
                            <Descriptions.Item 
                                label="배송지" 
                                span={2}
                                style={{
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-all'
                                }}
                            >
                                {selectedOrderDetail.recipientAddress}
                            </Descriptions.Item>
                            <Descriptions.Item 
                                label="배송 요청사항" 
                                span={2}
                                style={{
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-all',
                                    maxWidth: '100%'
                                }}
                            >
                                {selectedOrderDetail.deliveryRequest || '-'}
                            </Descriptions.Item>
                        </Descriptions>

                        <Table
                            rowKey="orderProductId"
                            dataSource={selectedOrderDetail.orderProductDTOList}
                            columns={orderDetailColumns}
                            pagination={false}
                            style={{ marginTop: 16 }}
                            className="detail-product-table"
                            size="small"
                            scroll={{ x: 'max-content' }}
                        />
                    </div>
                )}
                </OrderDetailModalContainer>
            </OrderDetailModal>

            {/* 배송 조회 모달 */}
            <DeliveryModal
                title="배송 조회"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
            >
                <Timeline items={createDeliveryHistoryTimelineItems(deliveryHistory)} />
            </DeliveryModal>

            {/* 교환/반품/취소 신청 모달 */}
            <RequestModal
                title={`${
                    requestType === 'exchange' ? '교환' : 
                    requestType === 'return' ? '반품' : 
                    requestType === 'cancel' ? '주문 취소' : '알 수 없음'
                } 신청`}
                open={requestModalVisible}
                onCancel={() => {
                    setRequestModalVisible(false);
                    requestForm.resetFields();
                }}
                footer={null}
            >
                <RequestContainer>
                    <Form
                        form={requestForm}
                        layout="vertical"
                        onFinish={handleRequestSubmit}
                        initialValues={{
                            quantity: selectedOrderProduct?.changedQuantity,
                            reasonType: undefined,
                            customReason: ''
                        }}
                    >
                        {/* 수량 선택 */}
                        <Form.Item
                            name="quantity"
                            label="수량"
                            style={{ marginBottom: '6px' }}
                            rules={[{ required: true, message: '수량을 입력해주세요' }]}
                        >
                            <Select 
                                style={{ width: '100px' }}
                                disabled={requestType === 'cancel'}
                                className="right-aligned-select"
                            >
                                {Array.from(
                                    { length: selectedOrderProduct?.changedQuantity || 0 }, 
                                    (_, i) => i + 1
                                ).map(num => (
                                    <Select.Option key={num} value={num}>
                                        {num}개
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        {/* 이유 선택 */}
                        <Form.Item
                            name="reason"
                            label="이유"
                            style={{ marginBottom: '6px' }}
                            rules={[{ required: true, message: '이유를 입력해주세요' }]}
                        >
                            <Select
                                style={{ width: '100%' }}
                                placeholder="이유를 선택해주세요"
                                onChange={(value) => {
                                    setShowCustomReason(value === 'other');
                                    if (value !== 'other') {
                                        requestForm.setFieldValue('customReason', '');
                                    }
                                }}
                            >
                                {REQUEST_REASON_OPTIONS[requestType]?.map(option => (
                                    <Select.Option key={option.value} value={option.value}>
                                        {option.label}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        {/* 기타 이유 입력폼 */}
                        {showCustomReason && (
                            <Form.Item
                                name="customReason"
                                style={{ marginBottom: '6px' }}
                                rules={[{ required: true, message: '이유를 직접 입력해주세요' }]}
                            >
                                <Input.TextArea 
                                    rows={4}
                                    placeholder="이유를 직접 입력해주세요"
                                />
                            </Form.Item>
                        )}

                        {/* 신청 버튼 */}
                        <Form.Item 
                            style={{ 
                                textAlign: 'center', 
                                marginTop: '12px', 
                                marginBottom: '0px' 
                            }}
                        >
                            <Space>
                                <Button onClick={() => {
                                    setRequestModalVisible(false);
                                    requestForm.resetFields();
                                }}>
                                    취소
                                </Button>
                                <Button type="primary" htmlType="submit">
                                    신청
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </RequestContainer>
            </RequestModal>

            {/* 리뷰 등록/수정 모달 */}
            <ReviewModal
                title={`리뷰 ${reviewType === 'update' ? '수정' : '작성'}`}
                open={reviewModalVisible}
                onCancel={() => {
                    setReviewModalVisible(false);
                    reviewForm.resetFields();
                }}
                footer={null}
            >
                <ReviewContainer>
                    <Form
                        form={reviewForm}
                        layout="vertical"
                        onFinish={handleReviewSubmit}
                    >
                        {/* 별점 */}
                        <Form.Item
                            name="rating"
                            label="별점"
                            rules={[{ required: true, message: '별점을 선택해주세요' }]}
                        >
                            <Rate />
                        </Form.Item>

                        {/* 리뷰 내용 */}
                        <Form.Item
                            name="comment"
                            label="리뷰 내용"
                            rules={[{ required: true, message: '리뷰 내용을 입력해주세요' }]}
                        >
                            <Input.TextArea 
                                rows={4}
                                placeholder="상품에 대한 평가를 작성해주세요"
                                maxLength={500}
                                showCount
                            />
                        </Form.Item>

                        {/* 버튼 영역 */}
                        <Form.Item style={{ textAlign: 'center', marginBottom: 0 }}>
                            <Space>
                                {reviewType === 'update' ? (
                                    <>
                                        <Popconfirm
                                            title="정말로 이 리뷰를 삭제하시겠습니까?"
                                            onConfirm={handleReviewDelete}
                                            okText="삭제"
                                            cancelText="취소"
                                            okButtonProps={{ danger: true }}
                                        >
                                            <Button danger>
                                                삭제
                                            </Button>
                                        </Popconfirm>
                                        <Button type="primary" htmlType="submit">
                                            수정
                                        </Button>
                                    </>
                                ) : (
                                    <Button type="primary" htmlType="submit">
                                        등록
                                    </Button>
                                )}
                            </Space>
                        </Form.Item>
                    </Form>
                </ReviewContainer>
            </ReviewModal>
        </OrderContainer>
    );
    //#endregion Render Logic
};

export default OrderManagement;