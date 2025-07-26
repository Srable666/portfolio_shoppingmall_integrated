import React, { useState, useCallback, useContext, useEffect, useMemo } from 'react';
import { modalCommonStyle, modalSizeStyle } from '../styles/modalStyles';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import styled from 'styled-components';
import {
    App, Table, Button, Space, Input,
    DatePicker, Select, Tag, Modal, Form,
    Descriptions, Timeline, Spin,
} from 'antd';
import {
    SearchOutlined,
    EyeOutlined,
    SwapRightOutlined,
    CheckCircleOutlined,
    CarOutlined,
    RollbackOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;


//#region Styled Components
// 페이지 컨테이너
const PageContainer = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
`;

// 페이지 타이틀
const PageTitle = styled.h1`
    margin: 0;
    font-size: clamp(16px, 3vw, 20px);
    text-align: center;
    font-weight: bold;
`;

// 검색 영역 컨테이너
const SearchContainer = styled.div`
display: flex;
gap: 8px;
padding: 8px;
background: #ffffff;
flex-wrap: wrap;

@media (max-width: 768px) {
    flex-direction: column;
}
`;

// 날짜 검색 그룹
const DateSearchGroup = styled.div`
flex: 1;
min-width: 240px;

@media (max-width: 768px) {
    width: 100%;
}
`;

// 키워드 검색 그룹
const KeywordSearchGroup = styled.div`
flex: 2;
display: flex;
gap: 8px;
align-items: center;

@media (max-width: 768px) {
    width: 100%;
}
`;

// 날짜 선택기
const StyledRangePicker = styled(RangePicker)`
width: 100%;
`;

// 검색 유형 선택기
const SearchTypeSelect = styled(Select)`
width: 130px;
flex-shrink: 0;

@media (max-width: 768px) {
    width: 110px;
}
`;

// 검색 입력 필드
const SearchInput = styled(Input)`
flex: 1;
min-width: 150px;
`;

// 검색 버튼
const SearchButton = styled(Button)`
flex-shrink: 0;
min-width: 80px;

@media (max-width: 768px) {
    min-width: 70px;
}
`;

// 테이블 컨테이너
const TableContainer = styled.div`
    flex: 1;
    overflow: auto;
`;

// 테이블 셀 클릭 버튼
const ClickableCellButton = styled(Button)`
    padding: 2px 4px;
    margin: 0;
    height: auto;
    line-height: inherit;
    border-radius: 4px;
    transition: all 0.3s;
`;

// 주문 상세 정보 모달
const OrderDetailModal = styled(Modal)`
    ${modalSizeStyle(800)}
    ${modalCommonStyle}

    .ant-modal-content {
        overflow: visible;
    }

    .ant-modal-body {
        padding: 0;
        max-height: calc(100vh - 120px);
        overflow: auto;
        display: flex;
        flex-direction: column;
    }
`;

// 주문 상세 정보 모달 헤더 내부
const OrderDetailHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

// 주문 상세 정보 모달 헤더 텍스트
const OrderDetailTitleText = styled.div`
    font-size: clamp(14px, 2.5vw, 18px);
    font-weight: bold;
    overflow: hidden;
    text-align: center;
    width: 100%;
    padding-bottom: 10px;
`;

// 주문 상세 정보 모달 내용
const OrderDetailContent = styled.div`
    flex: 1;
    overflow: auto;
`;

// 로딩 스피너
const LoadingSpinner = styled(Spin)`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
`;

// 배송 정보 모달
const DeliveryInfoModal = styled(Modal)`
    ${modalSizeStyle(300)}
    ${modalCommonStyle}

    .ant-modal-body {
        max-height: calc(100vh - 120px);
        overflow: auto;
    }
`;

// 배송 정보 모달 폼 푸터
const DeliveryFormFooter = styled(Form.Item)`
    text-align: right;
    margin-top: 24px;
    margin-bottom: 0;
`;

// 배송 정보 모달 날짜 선택기
const DeliveryDatePicker = styled(DatePicker)`
    width: 100%;
`;

// 배송 이력 모달
const DeliveryHistoryModal = styled(Modal)`
    ${modalSizeStyle(250)}
    ${modalCommonStyle}
`;

// 상태 변경 이력 모달
const StatusHistoryModal = styled(Modal)`
    ${modalSizeStyle(600)}
    ${modalCommonStyle}
`;
//#endregion Styled Components


//#region Main Component
const AdminOrders = () => {


    //#region Hooks & States
    const location = useLocation();
    const navigate = useNavigate();

    const { message } = App.useApp();
    const { authRequest, user } = useContext(AuthContext);
    
    const [deliveryForm] = Form.useForm();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchType, setSearchType] = useState('merchantUid');
    const [deliveryHistoryMap, setDeliveryHistoryMap] = useState({});
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedOrderProduct, setSelectedOrderProduct] = useState(null);
    const [deliveryModalVisible, setDeliveryModalVisible] = useState(false);
    const [selectedHistoryRecord, setSelectedHistoryRecord] = useState(null);
    const [statusHistoryModalVisible, setStatusHistoryModalVisible] = useState(false);
    const [deliveryHistoryModalVisible, setDeliveryHistoryModalVisible] = useState(false);
    const [searchConditions, setSearchConditions] = useState({
        merchantUid: '',
        userEmail: '',
        dateRange: null,
    }); 
    //#endregion Hooks & States


    //#region Constants & Utility Functions
    // 주문 품목 상태 옵션
    const orderStatusOptions = useMemo(() => [
        { value: 'all', label: '전체' },
        { value: 'PAYMENT_PENDING', label: '결제대기' },
        { value: 'PAYMENT_COMPLETED', label: '결제완료' },
        { value: 'PREPARING', label: '배송준비중' },
        { value: 'DELIVERING', label: '배송중' },
        { value: 'DELIVERED', label: '배송완료' },
        { value: 'DELIVERY_CONFIRMED', label: '구매확정' },
        { value: 'CANCEL_REQUESTED', label: '취소요청' },
        { value: 'CANCELED', label: '취소완료' },
        { value: 'RETURN_REQUESTED', label: '반품요청' },
        { value: 'RETURNING', label: '반품중' },
        { value: 'RETURNED', label: '반품완료' },
        { value: 'EXCHANGE_REQUESTED', label: '교환요청' },
        { value: 'EXCHANGE_RETURNING', label: '교환반품중' },
        { value: 'EXCHANGE_PREPARING', label: '교환준비중' },
        { value: 'EXCHANGE_DELIVERING', label: '교환배송중' },
        { value: 'EXCHANGE_DELIVERED', label: '교환완료' }
    ], []);
    
    // 배송 정보가 없는 상태
    const NON_DELIVERY_STATUSES = useMemo(() => [
        'PAYMENT_PENDING', 
        'PAYMENT_COMPLETED', 
        'PREPARING'
    ], []);
    
    // 상태별 태그 색상 설정
    const getStatusTagColor = useCallback((status) => {
        const colorMap = {
            'PAYMENT_PENDING': 'default',
            'PAYMENT_COMPLETED': 'processing',
            'PREPARING': 'warning',
            'DELIVERING': 'processing',
            'DELIVERED': 'success',
            'DELIVERY_CONFIRMED': 'success',
            'CANCEL_REQUESTED': 'error',
            'CANCELED': 'default',
            'RETURN_REQUESTED': 'error',
            'RETURNING': 'warning',
            'RETURNED': 'default',
            'EXCHANGE_REQUESTED': 'error',
            'EXCHANGE_RETURNING': 'warning',
            'EXCHANGE_PREPARING': 'processing',
            'EXCHANGE_DELIVERING': 'processing',
            'EXCHANGE_DELIVERED': 'success'
        };
        return colorMap[status] || 'default';
    }, []);

    // 현재 상태에 따른 다음 단계 액션
    const getNextAction = useCallback((currentStatus) => {
        switch(currentStatus) {
            case 'PAYMENT_PENDING':
                return {
                    endpoint: '/updateOrderProductStatusToPaymentCompleted',
                    label: '결제완료 처리',
                    needsDeliveryInfo: false
                };
            case 'PAYMENT_COMPLETED':
                return {
                    endpoint: '/manuallyUpdateOrderProductStatusToPreparing',
                    label: '상품준비 처리',
                    needsDeliveryInfo: false
                };
            case 'PREPARING':
                return {
                    endpoint: '/updateOrderProductStatusToDelivering',
                    label: '배송시작',
                    needsDeliveryInfo: true
                };
            case 'DELIVERING':
                return {
                    endpoint: '/updateOrderStatusToDelivered',
                    label: '배송완료',
                    needsDeliveryInfo: true
                };
            case 'CANCEL_REQUESTED':
                return {
                    endpoint: '/updateOrderProductCancelApproval',
                    label: '취소승인',
                    needsDeliveryInfo: false
                };
            case 'RETURN_REQUESTED':
                return {
                    endpoint: '/updateOrderProductReturnApproval',
                    label: '반품승인',
                    needsDeliveryInfo: true
                };
            case 'RETURNING':
                return {
                    endpoint: '/updateOrderProductReturnComplete',
                    label: '반품완료',
                    needsDeliveryInfo: true
                };
            case 'EXCHANGE_REQUESTED':
                return {
                    endpoint: '/updateOrderProductExchangeApproval',
                    label: '교환승인',
                    needsDeliveryInfo: true
                };
            case 'EXCHANGE_RETURNING':
                return {
                    endpoint: '/updateOrderProductExchangePrepare',
                    label: '교환준비',
                    needsDeliveryInfo: true
                };
            case 'EXCHANGE_PREPARING':
                return {
                    endpoint: '/updateOrderProductExchangeDelivering',
                    label: '교환배송',
                    needsDeliveryInfo: true
                };
            default:
                return null;
        }
    }, []);

    // 날짜 포맷 함수
    const formatDate = useCallback((dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }, []);

    // 배송 유형 정보 조회
    const getDeliveryTypeInfo = useCallback((type) => {
        const typeMap = {
            'ORDER_OUT': { color: 'blue', label: '배송', icon: <CarOutlined /> },
            'EXCHANGE_OUT': { color: 'green', label: '교환 배송', icon: <CarOutlined /> },
            'EXCHANGE_IN': { color: 'orange', label: '교환 반품', icon: <RollbackOutlined /> },
            'RETURN_IN': { color: 'red', label: '반품', icon: <RollbackOutlined /> }
        };
        
        return typeMap[type] || { color: 'gray', label: type, icon: <RollbackOutlined /> };
    }, []);

    // 배송 상태 라벨
    const getDeliveryStatusLabel = useCallback((status) => {
        const statusMap = {
            'PREPARING': '준비중',
            'DELIVERING': '배송중',
            'DELIVERED': '배송완료',
            'CONFIRMED': '구매확정',
            'CANCELED': '취소',
            'RETURN': '반품 처리',
            'EXCHANGE': '교환 처리'
        };
        
        return statusMap[status] || status;
    }, []);
    //#endregion Constants & Utility Functions


    //#region Data Transformation Functions
    //주문 데이터 변환
    const transformOrdersData = useCallback((orders) => {
        return orders.flatMap(order => {
            return order.orderProductDTOList.map((product, index) => ({
                ...order,
                uniqueKey: `${order.orderId}_${product.orderProductId}`,
                productIndex: index,
                product: product
            }));
        });
    }, []);   

    // 전화번호 포맷팅
    const formatPhoneNumber = (phone) => {
        if (!phone) return '';
        
        // 숫자만 추출
        const numbers = phone.replace(/[^0-9]/g, '');
        
        // 핸드폰 번호 패턴 확인 (01로 시작하는지)
        const isMobilePhone = numbers.startsWith('01');
        
        if (isMobilePhone) {
            if (numbers.length === 11) {
                // 11자리 휴대폰 번호 (01012345678 -> 010-1234-5678)
                return numbers.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
            } else if (numbers.length === 10) {
                // 10자리 휴대폰 번호 (0161234567 -> 016-123-4567)
                return numbers.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
            }
        } else {
            if (numbers.length === 10) {
                // 지역 번호가 2자리인 전화번호 (0212345678 -> 02-1234-5678)
                return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
            } else if (numbers.length === 8) {
                // 지역 번호가 없는 전화번호 (12345678 -> 1234-5678)
                return numbers.replace(/(\d{4})(\d{4})/, '$1-$2');
            }
        }
        return phone;
    };
    //#endregion Data Transformation Functions
    

    //#region API Functions
    // 주문 목록 조회
    const fetchOrders = useCallback(async (params) => {
        if (!user) return;

        try {
            setLoading(true);
            
            const requestParams = { 
                merchantUid: params.merchantUid || '',
                userEmail: params.userEmail || '',
                startDate: params.startDate || '',
                endDate: params.endDate || '',
            };
            
            const response = await authRequest(
                'get', 
                '/order/orderListForAdmin', 
                requestParams
            );

            const orderData = response.data || [];
            setOrders(orderData);
        } catch (error) {
            console.error('주문 목록 조회 에러:', error);            
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '예기치 못한 오류로 주문 목록 조회에 실패했습니다.');
            }
        } finally {
            setLoading(false);
        }
    }, [
        authRequest, 
        message, 
        user, 
    ]);

    // 배송 이력 조회
    const fetchOrderDeliveryHistory = useCallback(async (record) => {
        if (!user) return;

        setSelectedOrder(record);
        setDetailModalVisible(true);
        setLoading(true); 
            
        try {
            if (!record.orderProductDTOList?.length) {
                return;
            }

            const newDeliveryHistories = {};
            
            for (const product of record.orderProductDTOList) {
                try {
                    const response = await authRequest('get', '/order/getDeliveryHistory', {
                        orderProductId: product.orderProductId
                    });
                    console.log(response.data);
                
                    newDeliveryHistories[product.orderProductId] = response.data;
                } catch (error) {
                    console.error(`주문 상품 ID ${product.orderProductId}의 배송 이력 조회 에러:`, error);
                    if (!error.response) {
                        message.warning('네트워크 연결을 확인해주세요.');
                    } else {
                        message.error(error.response.data || '예기치 못한 오류로 배송 이력 조회에 실패했습니다.');
                    }
                }
            }
            
            setDeliveryHistoryMap(newDeliveryHistories);
        } catch (error) {
            console.error('배송 이력 조회 전체 에러:', error);
            message.error('예기치 못한 오류로 배송 이력 조회가 중단되었습니다.');
        } finally {
            setLoading(false);
        }
    }, [authRequest, message, user]);
    //#endregion API Functions


    //#region Data Management Functions
    // 현재 검색 조건으로 주문 목록 로드
    const loadOrderList = useCallback(async () => {
        const params = {
            merchantUid: searchConditions.merchantUid,
            userEmail: searchConditions.userEmail,
            startDate: searchConditions.dateRange?.[0] ? searchConditions.dateRange[0].format() : '',
            endDate: searchConditions.dateRange?.[1] ? searchConditions.dateRange[1].format() : '',
        };

        return fetchOrders(params);
    }, [
        fetchOrders, 
        searchConditions, 
    ]);
    
    // 주문 상태 변경 처리
    const handleStatusChange = useCallback(async (record, endpoint, deliveryInfo = null) => {
        try {
            // 배송 정보가 필요한 경우(deliveryInfoDTO 타입)
            if (deliveryInfo) {
                await authRequest('post', `/order${endpoint}`, {
                    ...deliveryInfo,
                    orderProductId: record.product.orderProductId,
                    version: record.product.version
                });
            } 
            // 배송 정보가 필요없는 경우(OrderProductDTO 타입)
            else {
                await authRequest('post', `/order${endpoint}`, {
                    orderProductId: record.product.orderProductId,
                    orderId: record.orderId,
                    status: record.product.status,
                    version: record.product.version
                });
            }

            message.success('주문 상태가 변경되었습니다.');
            await loadOrderList();
            
            if (selectedOrder) {
                const detailResponse = await authRequest('get', '/order/orderDetail', { 
                    orderId: selectedOrder.orderId 
                });
                setSelectedOrder(detailResponse.data);
                await fetchOrderDeliveryHistory(detailResponse.data);
            }
        } catch (error) {
            console.error('주문 상태 변경 에러:', error);
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else if (error.response.status === 409) {
                message.error('주문 상품 정보가 변경되었습니다. 페이지를 새로고침 해주세요.');
                await loadOrderList();
            } else {
                message.error(error.response.data || '예기치 못한 오류로 주문 상태 변경에 실패했습니다.');
            }
        }
    }, [
        authRequest, 
        loadOrderList, 
        selectedOrder, 
        fetchOrderDeliveryHistory, 
        message,
    ]);
    //#endregion Data Management Functions
    

    //#region Event Handlers    
    // 검색 실행 함수
    const handleSearch = () => {
        const conditions = {
            merchantUid: searchType === 'merchantUid' ? searchKeyword : '',
            userEmail: searchType === 'userEmail' ? searchKeyword : '',
            dateRange
        };
        
        setSearchConditions(conditions);

        const params = {
            merchantUid: conditions.merchantUid,
            userEmail: conditions.userEmail,
            startDate: conditions.dateRange?.[0] ? conditions.dateRange[0].format() : '',
            endDate: conditions.dateRange?.[1] ? conditions.dateRange[1].format() : '',
        };
        
        fetchOrders(params);
    }

    // 주문 번호 클릭 핸들러
    const handleOrderNumberClick = useCallback((merchantUid) => {
        setSearchType('merchantUid');
        setSearchKeyword(merchantUid);
        setSearchConditions({
            merchantUid,
            userEmail: '',
            dateRange: null
        });
        setDateRange(null);

        fetchOrders({
            merchantUid,
            userEmail: '',
            startDate: '',
            endDate: '',
        });
    }, [fetchOrders]);

    // 주문 이메일 클릭 핸들러
    const handleEmailClick = useCallback((email) => {
        setSearchType('userEmail');
        setSearchKeyword(email);
        setSearchConditions({
            merchantUid: '',
            userEmail: email,
            dateRange: null
        });
        setDateRange(null);
    
        fetchOrders({
            merchantUid: '',
            userEmail: email,
            startDate: '',
            endDate: '',
        });
    }, [fetchOrders]);

    // 배송 정보 제출 핸들러
    const handleDeliveryFormSubmit = useCallback((values) => {
        let endpoint = '';

        // 다음 단계 액션 결정
        if (selectedOrderProduct) {
            const nextAction = getNextAction(selectedOrderProduct.status);
            if (nextAction) {
                endpoint = nextAction.endpoint;
            }
        }

        // 배송 정보 설정
        const deliveryInfo = {
            orderProductId: selectedOrderProduct.orderProductId,
            invoiceNumber: values.invoiceNumber,
            deliveryCompany: values.deliveryCompany,
            deliveryStartDate: values.deliveryStartDate ? values.deliveryStartDate.format('YYYY-MM-DD HH:mm:ss') : null,
            barcodes: values.barcodes ? values.barcodes.split(',').map(item => item.trim()) : []
        };

        // 배송 완료 정보 설정
        if (endpoint === '/updateOrderStatusToDelivered') {
            deliveryInfo.deliveryCompleteDate = values.deliveryCompleteDate ? values.deliveryCompleteDate.format('YYYY-MM-DD HH:mm:ss') : null;
        }

        handleStatusChange(selectedOrderProduct, endpoint, deliveryInfo);
        setDeliveryModalVisible(false);
        deliveryForm.resetFields();
    }, [selectedOrderProduct, getNextAction, handleStatusChange, deliveryForm]);
    //#endregion Event Handlers


    //#region Table Cell Handlers & Renderers
    // 주문 상품 렌더링 핸들러
    const handleOrderProductRender = useCallback((_, record, index) => {
        const product = record.product;
        return (
            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {`${product.productName} (${product.size}/${product.color}, ${product.originalQuantity}개)`}
            </div>
        );
    }, []);

    // 주문 상태 렌더링 핸들러
    const handleOrderStatusRender = useCallback((_, record) => {
        const product = record.product;
        const nextAction = getNextAction(product.status);
        const currentStatus = orderStatusOptions.find(opt => opt.value === product.status)?.label;
        
        return (
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px',
                justifyContent: 'center'
            }}>
                <Tag 
                    color={getStatusTagColor(product.status)}
                    style={{
                        margin: 0,
                    }}
                >
                    {currentStatus}
                </Tag>
                {nextAction && (
                    <>
                        <SwapRightOutlined style={{ color: '#999999' }} />
                        <span 
                            className="action-button"
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                                if (nextAction.needsDeliveryInfo) {
                                    setSelectedOrderProduct(product);
                                    setDeliveryModalVisible(true);
                                } else {
                                    handleStatusChange(product, nextAction.endpoint);
                                }
                            }}
                        >
                            {nextAction.label}
                        </span>
                    </>
                )}
            </div>
        );
    }, [getStatusTagColor, getNextAction, handleStatusChange, orderStatusOptions]);

    // 작업 렌더링 핸들러
    const handleActionRender = useCallback((_, record) => (
        <Space>
            <Button
                icon={<EyeOutlined />}
                onClick={() => fetchOrderDeliveryHistory(record)}
                size="small"
            >
                상세보기
            </Button>
        </Space>
    ), [fetchOrderDeliveryHistory]);

    // 배송 정보 렌더링 핸들러
    const createDeliveryHistoryItems = useCallback((history, index) => {
        const typeInfo = getDeliveryTypeInfo(history.deliveryType);
        const dot = history.deliveryStatus === 'DELIVERED' ? 
            <CheckCircleOutlined /> : typeInfo.icon;
        
                return {
            color: typeInfo.color,
            dot: dot,
            children: (
                <div key={index} style={{ fontSize: '12px', textAlign: 'left' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                        <Tag color={typeInfo.color}>
                            {typeInfo.label}
                        </Tag>
                        <span style={{ marginLeft: '4px' }}>
                            {getDeliveryStatusLabel(history.deliveryStatus)}
                        </span>
                    </div>
                    {history.invoiceNumber && (
                        <>
                            <div>
                                {history.deliveryCompany} ({history.invoiceNumber})
                            </div>
                            <div>
                                시작: {formatDate(history.deliveryStartDate)}
                            </div>
                            <div>
                                완료: {history.deliveryCompleteDate ? 
                                formatDate(history.deliveryCompleteDate) : '-'}
                            </div>
                        </>
                    )}
                </div>
            )
        };
    }, [getDeliveryTypeInfo, getDeliveryStatusLabel, formatDate]);
    //#endregion Table Cell Handlers & Renderers


    //#region Filter Functions
    // 주문 상태 필터 조회
    const getOrderStatusFilters = useCallback(() => {
        return orderStatusOptions
                .filter(option => option.value !== 'all')
                .map(option => ({
                    text: option.label,
                    value: option.value
            }));
    }, [orderStatusOptions]);

    // 주문 상태 필터 핸들러
    const handleOrderStatusFilter = useCallback((value, record) => {
        return record.product.status === value;
    }, []);
    //#endregion Filter Functions


    //#region Table Column Definitions
    // 주문 목록 테이블 컬럼
    const columns = useMemo(() => [
        {
            title: '주문 일자',
            dataIndex: 'createdAt',
            key: 'createdAt',
            align: 'center',
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            render: (date) => formatDate(date).split('오전').shift().split('오후').shift().trim(),
        },
        {
            title: '주문 번호',
            dataIndex: 'merchantUid',
            key: 'merchantUid',
            align: 'center',
            sorter: (a, b) => a.merchantUid.localeCompare(b.merchantUid),
            render: (merchantUid) => (
                <ClickableCellButton 
                    type="link" 
                    className="clickable-cell"
                    onClick={() => handleOrderNumberClick(merchantUid)}
                >
                    {merchantUid}
                </ClickableCellButton>
            ),
        },
        {
            title: '주문 이메일',
            dataIndex: 'email',
            key: 'email',
            align: 'center',
            render: (email) => (
                <ClickableCellButton 
                    type="link" 
                    className="clickable-cell"
                    onClick={() => handleEmailClick(email)}
                >
                    {email}
                </ClickableCellButton>
            ),
        },
        {
            title: '주문 상품',
            key: 'products',
            align: 'center',
            render: handleOrderProductRender
        },
        {
            title: '주문 상태',
            key: 'status',
            align: 'center',
            render: handleOrderStatusRender,
            filters: getOrderStatusFilters(),
            onFilter: handleOrderStatusFilter,
        },
        {
            title: '작업',
            key: 'action',
            align: 'center',
            render: handleActionRender,
        }
    ], [
        handleOrderNumberClick,
        handleEmailClick,
        formatDate,
        handleOrderProductRender,
        handleOrderStatusRender,
        getOrderStatusFilters,
        handleOrderStatusFilter,
        handleActionRender
    ]);

    // 주문 상세 정보 모달 테이블 컬럼
    const getOrderDetailColumns = useCallback((onDeliveryHistoryClick, onStatusHistoryClick) => [
        {
            title: '상품명',
            dataIndex: 'productName',
            key: 'productName',
            align: 'center',
        },
        {
            title: '상품 옵션',
            key: 'option',
            align: 'center',
            render: (_, record) => `${record.size} / ${record.color}`
        },
        {
            title: '정가',
            dataIndex: 'price',
            key: 'price',
            align: 'center',
            render: (price) => `₩${Number(price).toLocaleString()}`
        },
        {
            title: '할인율',
            dataIndex: 'discountRate',
            key: 'discountRate',
            align: 'center',
            render: (rate) => rate ? `${Number(rate)}%` : '-'
        },
        {
            title: '최종 가격',
            dataIndex: 'finalPrice',
            key: 'finalPrice',
            align: 'center',
            render: (price) => `₩${Number(price).toLocaleString()}`
        },
        {
            title: '수량',
            dataIndex: 'originalQuantity',
            key: 'quantity',
            align: 'center',
        },
        {
            title: '상태',
            key: 'status',
            align: 'center',
            render: (_, record) => (
                <Tag color={getStatusTagColor(record.status)}>
                    {orderStatusOptions.find(opt => opt.value === record.status)?.label}
                </Tag>
            )
        },
        {
            title: '상세보기',
            key: 'details',
            align: 'center',
            render: (_, record) => (
                <Space size="small">
                    {!NON_DELIVERY_STATUSES.includes(record.status) && (
                    <Button
                        size="small"
                            onClick={() => {
                                setSelectedHistoryRecord(record);
                                setDeliveryHistoryModalVisible(true);
                            }}
                        >
                            배송이력
                        </Button>
                    )}
                    <Button
                        size="small"
                        onClick={() => {
                            setSelectedHistoryRecord(record);
                            setStatusHistoryModalVisible(true);
                        }}
                    >
                        상태이력
                    </Button>
                </Space>
            )
        }
    ], [orderStatusOptions, getStatusTagColor, NON_DELIVERY_STATUSES]);
    //#endregion Table Column Definitions


    //#region Effect Hooks
    // 초기 데이터 로딩 - 컴포넌트 마운트 시마다 최신 데이터 로드
    useEffect(() => {
        // 페이지 방문 시마다 기본 검색 조건으로 전체 주문 목록 조회
        const defaultParams = {
            merchantUid: '',
            userEmail: '',
            startDate: '',
            endDate: '',
        };
        
        fetchOrders(defaultParams);
        
        // searchConditions 초기화
        setSearchConditions({
            merchantUid: '',
            userEmail: '',
            dateRange: null,
        });
        setDateRange(null);
        setSearchKeyword('');
        setSearchType('merchantUid');
    }, []); // 빈 의존성 배열로 마운트 시에만 실행

    // 주문 목록 로딩
    useEffect(() => {
        loadOrderList();
    }, [loadOrderList]);

    // 배송 모달 폼 초기화
    useEffect(() => {
        if (deliveryModalVisible && deliveryForm) {
            // 현재 시간을 기본값으로 설정
            const now = new dayjs(); // antd의 DatePicker는 dayjs 객체 사용
            
            deliveryForm.setFieldsValue({
                deliveryStartDate: now
            });
            
            // 배송완료 상태인 경우 배송완료일도 현재 시간으로 설정
            if (selectedOrderProduct?.status === 'DELIVERING') {
                deliveryForm.setFieldsValue({
                    deliveryCompleteDate: now
                });
            }
        }
    }, [deliveryModalVisible, deliveryForm, selectedOrderProduct]);

    // 회원 이메일 검색 조건 처리
    useEffect(() => {
        if (location.state?.searchEmail) {
            setSearchType('userEmail');
            setSearchKeyword(location.state.searchEmail);
            setSearchConditions(prevConditions => ({
                ...prevConditions,
                userEmail: location.state.searchEmail
            }));
            navigate(location.pathname, { replace: true });

            fetchOrders({
                userEmail: location.state.searchEmail,
            });
        }
    }, [location, navigate, fetchOrders]);

    // 주문 번호 검색 조건 처리
    useEffect(() => {
        if (location.state?.searchMerchantUid) {
            setSearchType('merchantUid');
            setSearchKeyword(location.state.searchMerchantUid);
            setSearchConditions(prevConditions => ({
                ...prevConditions,
                merchantUid: location.state.searchMerchantUid
            }));
            navigate(location.pathname, { replace: true });
    
            fetchOrders({
                merchantUid: location.state.searchMerchantUid,
            });
        }
    }, [location, navigate, fetchOrders]);
    //#endregion Effect Hooks


    //#region Render Functions
    // 주문 관리 페이지 렌더링
    return (
        // 주문 관리 페이지 컨테이너
        <PageContainer>
            <div>
                <PageTitle>
                    주문 관리
                </PageTitle>

                {/* 검색 영역 */}
                <SearchContainer>
                    <DateSearchGroup>
                        <StyledRangePicker
                            placeholder={['검색 시작일', '검색 종료일']}
                            value={dateRange}
                            onChange={setDateRange}
                            popupClassName="custom-date-picker"
                        />
                    </DateSearchGroup>
    
                    <KeywordSearchGroup>
                        <SearchTypeSelect
                            value={searchType}
                            onChange={setSearchType}
                            dropdownStyle={{
                                backgroundColor: '#ffffff',
                            }}
                        >
                            <Select.Option value="merchantUid">주문 번호</Select.Option>
                            <Select.Option value="userEmail">회원 이메일</Select.Option>
                        </SearchTypeSelect>
                        <SearchInput
                            placeholder={searchType === 'merchantUid' ? '주문 번호 검색' : '회원 이메일 검색'}
                            value={searchKeyword}
                            onChange={e => setSearchKeyword(e.target.value)}
                            onPressEnter={handleSearch}
                            allowClear
                        />
                    <SearchButton
                        type="primary"
                        icon={<SearchOutlined />}
                        onClick={handleSearch}
                    >
                        검색
                        </SearchButton>
                    </KeywordSearchGroup>
                </SearchContainer>
            </div>

            <TableContainer>
                <Table
                    columns={columns}
                    dataSource={transformOrdersData(orders)}
                    loading={loading}
                    rowKey="uniqueKey"
                    scroll={{ x: 'max-content' }}
                    size="small"
                    pagination={{
                        position: ['bottomCenter'],
                    }}
                />
            </TableContainer>

            {/* 주문 상세 정보 모달 */}
            <OrderDetailModal
                title={null}
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
                destroyOnClose={false}
            >
                <OrderDetailHeader>
                    <OrderDetailTitleText>
                            주문 상세 정보
                    </OrderDetailTitleText>
                </OrderDetailHeader>
                <OrderDetailContent>
                    {loading ? (
                        <LoadingSpinner size="large" tip="데이터를 불러오는 중..." />
                    ) : (
                        selectedOrder && (
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
                                    <Descriptions.Item label="주문 번호">{selectedOrder.merchantUid}</Descriptions.Item>
                                    <Descriptions.Item label="주문 일시">{formatDate(selectedOrder.createdAt)}</Descriptions.Item>
                                    <Descriptions.Item label="주문 이메일">{selectedOrder.email}</Descriptions.Item>
                                    <Descriptions.Item label="결제 방법">{selectedOrder.paymentMethod}</Descriptions.Item>
                                    <Descriptions.Item label="총 금액">
                                        {`₩${Number(selectedOrder.currentTotalPrice + selectedOrder.deliveryFee).toLocaleString()}`}
                                        {` (${selectedOrder.deliveryFee > 0 
                                            ? `배송비 ₩${Number(selectedOrder.deliveryFee).toLocaleString()}` 
                                            : '무료배송'
                                        })`}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="수령인">{selectedOrder.recipientName}</Descriptions.Item>
                                            <Descriptions.Item label="연락처">{formatPhoneNumber(selectedOrder.recipientPhone)}</Descriptions.Item>
                                    <Descriptions.Item 
                                        label="배송지" 
                                        span={2}
                                        style={{
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-all'
                                        }}
                                    >
                                        {selectedOrder.recipientAddress}
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
                                        {selectedOrder.deliveryRequest || '-'}
                                    </Descriptions.Item>
                                </Descriptions>

                                <Table
                                    dataSource={selectedOrder.orderProductDTOList}
                                    pagination={false}
                                            style={{ marginTop: 10 }}
                                    size="small"
                                    scroll={{ x: 'max-content' }}
                                            columns={getOrderDetailColumns()}
                                />
                            </div>
                        )
                    )}
                </OrderDetailContent>
            </OrderDetailModal>

            {/* 배송 정보 입력 모달 */}
            <DeliveryInfoModal
                title="배송 정보 입력"
                open={deliveryModalVisible}
                onCancel={() => {
                    setDeliveryModalVisible(false);
                    deliveryForm.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={deliveryForm}
                    layout="vertical"
                    onFinish={handleDeliveryFormSubmit}
                >
                    <Form.Item
                        name="invoiceNumber"
                        label="송장번호"
                        rules={[{ required: true, message: '송장번호를 입력해주세요' }]}
                    >
                        <Input placeholder="송장번호를 입력해주세요" />
                    </Form.Item>
                    <Form.Item
                        name="deliveryCompany"
                        label="택배사"
                        rules={[{ required: true, message: '택배사를 선택해주세요' }]}
                    >
                        <Select placeholder="택배사를 선택해주세요">
                            <Select.Option value="CJ대한통운">CJ대한통운</Select.Option>
                            <Select.Option value="우체국택배">우체국택배</Select.Option>
                            <Select.Option value="로젠택배">로젠택배</Select.Option>
                            <Select.Option value="한진택배">한진택배</Select.Option>
                            <Select.Option value="롯데택배">롯데택배</Select.Option>
                        </Select>
                    </Form.Item>
                    
                    <Form.Item
                        name="deliveryStartDate"
                        label="배송 시작일시"
                        rules={[{ required: true, message: '배송 시작일시를 선택해주세요' }]}
                    >
                        <DeliveryDatePicker 
                            showTime
                            format="YYYY-MM-DD HH:mm:ss"
                            placeholder="배송 시작일시를 선택해주세요"
                        />
                    </Form.Item>
                    
                    {selectedOrderProduct?.status === 'DELIVERING' && (
                        <Form.Item
                            name="deliveryCompleteDate"
                            label="배송 완료일"
                            rules={[{ required: true, message: '배송 완료일을 선택해주세요' }]}
                        >
                            <DeliveryDatePicker 
                                showTime
                                format="YYYY-MM-DD HH:mm:ss"
                                placeholder="배송 완료일시를 선택해주세요"
                            />
                        </Form.Item>
                    )}
        
                    {selectedOrderProduct?.status === 'EXCHANGE_PREPARING' && (
                        <Form.Item
                            name="barcodes"
                            label="바코드 목록"
                            extra="교환 발송 상품의 바코드를 입력해주세요. 여러 개인 경우 쉼표로 구분해주세요."
                            rules={[{ required: true, message: '바코드를 입력해주세요' }]}
                        >
                            <Input.TextArea 
                                rows={4}
                                placeholder="예: BARCODE001, BARCODE002"
                            />
                        </Form.Item>
                    )}
        
                    <DeliveryFormFooter>
                        <Space>
                            <Button onClick={() => {
                                setDeliveryModalVisible(false);
                                deliveryForm.resetFields();
                            }}>
                                취소
                            </Button>
                            <Button type="primary" htmlType="submit">
                                확인
                            </Button>
                        </Space>
                    </DeliveryFormFooter>
                </Form>
            </DeliveryInfoModal>

            {/* 배송 이력 모달 */}
            <DeliveryHistoryModal
                title="배송 이력"
                open={deliveryHistoryModalVisible}
                onCancel={() => {
                    setDeliveryHistoryModalVisible(false);
                    setSelectedHistoryRecord(null);
                }}
                footer={null}
            >
                <Timeline
                    style={{ margin: '16px 0 0 0' }}
                    items={deliveryHistoryMap[selectedHistoryRecord?.orderProductId]?.map((history, index) => 
                        createDeliveryHistoryItems(history, index)
                    ) || []}
                />
            </DeliveryHistoryModal>

            {/* 상태 변경 이력 모달 */}
            <StatusHistoryModal
                title="상태 변경 이력"
                open={statusHistoryModalVisible}
                onCancel={() => {
                    setStatusHistoryModalVisible(false);
                    setSelectedHistoryRecord(null);
                }}
                footer={null}
            >
                <Table
                    dataSource={(selectedHistoryRecord?.orderProductHistoryDTOList || [])
                        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))}
                    pagination={false}
                    size="small"
                    columns={[
                        {
                            title: '변경일시',
                            dataIndex: 'createdAt',
                            key: 'createdAt',
                            align: 'center',
                            render: (date) => formatDate(date)
                        },
                        {
                            title: '상태 변경',
                            key: 'status',
                            align: 'center',
                            render: (_, record) => (
                                <Space size="small">
                                    <Tag color={getStatusTagColor(record.statusFrom)}>
                                        {orderStatusOptions.find(opt => opt.value === record.statusFrom)?.label || '재고'}
                                    </Tag>
                                    <SwapRightOutlined style={{ color: '#999999' }} />
                                    <Tag color={getStatusTagColor(record.statusTo)}>
                                        {orderStatusOptions.find(opt => opt.value === record.statusTo)?.label}
                                    </Tag>
                                </Space>
                            )
                        },
                        {
                            title: '요청 수량',
                            dataIndex: 'requestQuantityRecord',
                            key: 'requestQuantityRecord',
                            align: 'center',
                            render: (quantity) => quantity ? `${quantity}개` : '-'
                        },
                        {
                            title: '사유',
                            dataIndex: 'reason',
                            key: 'reason',
                            align: 'center',
                            render: (reason) => reason || '-'
                        }
                    ]}
                />
            </StatusHistoryModal>
        </PageContainer>
    );
    //#endregion Render Functions
};
//#endregion Main Component

export default AdminOrders;