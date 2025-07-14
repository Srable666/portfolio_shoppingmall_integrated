import { Row, Col, Card, Statistic, Table, Spin, Alert, Button, Tag, App } from 'antd';
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useResponsive } from '../contexts/ResponsiveContext';
import { AuthContext } from '../contexts/AuthContext';
import styled from 'styled-components';
import {
    ShoppingCartOutlined,
    UserOutlined,
    CommentOutlined,
    ReloadOutlined,
} from '@ant-design/icons';


//#region Styled Components
// 페이지 컨테이너
const PageContainer = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    
    @media (min-width: 768px) {
        padding: 0;
    }
    
    @media (max-width: 767px) {
        padding: 16px;
        height: calc(100vh - 48px - 48px);
    }
`;

// 헤더 컨테이너
const HeaderContainer = styled.div`
    flex-shrink: 0;
`;

// 헤더 상단
const HeaderTop = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 10px;
    width: 100%;
    position: relative;

    @media (max-width: 767px) {
        .ant-btn {
            padding: 0 4px !important;
            font-size: 12px !important;
        }
    }
`;

// 타이틀 컨테이너
const TitleContainer = styled.div`
    flex: 1;
    text-align: center;
`;

// 새로고침 버튼 컨테이너
const RefreshButtonContainer = styled.div`
    position: absolute;
    right: 0;
`;

// 페이지 타이틀
const PageTitle = styled.h1`
    margin: 0;
    font-size: 20px;
`;

// 통계 카드 행
const StatsRow = styled(Row)`
    margin: 0 0 10px 0 !important;
    width: 100%;

    .ant-col {
        padding: 0 4px !important;
    }

    @media (max-width: 767px) {
        margin-bottom: 8px;
        row-gap: 8px !important;

        .ant-card {
            .ant-card-body {
                padding: 12px;
            }
        }
    }
`;

// 메인 컨텐츠 컨테이너
const ContentContainer = styled.div`
    flex: 1;
    min-height: 0;
    overflow: hidden;
`;

// 주문 내역 카드
const OrderHistoryCard = styled(Card)`
    height: 100%;
    display: flex;
    flex-direction: column;

    .ant-card-body {
        padding: 10px 15px;
        overflow-y: auto;
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
    }

    .ant-card-head {
        min-height: 40px;
        padding: 0 12px;
        flex-shrink: 0;
    }

    .ant-card-head-title {
        padding: 8px 0;
    }

    .ant-card-extra {
        padding: 8px 0;
    }

    @media (max-width: 767px) {
        .ant-card-body {
            padding: 8px 12px;
        }
        
        .ant-card-head {
            padding: 0 8px;
        }
    }
`;

// 모바일 주문 카드
const MobileOrderCard = styled(Card)`
    margin-bottom: 16px;

    .ant-card-body {
        padding: 15px;
    }
`;

// 모바일 주문 정보 행
const MobileOrderRow = styled.div`
    margin-bottom: 8px;
    
    &:last-child {
        margin-bottom: 0;
    }

    b {
        margin-right: 8px;
    }
`;

// 주문 없음 메시지
const NoOrdersMessage = styled.div`
    text-align: center;
    padding: 20px 0;
`;

// 에러 버튼 컨테이너
const ErrorButtonContainer = styled.div`
    text-align: center;
    margin-top: 16px;
`;
//#endregion Styled Components


const AdminDashboard = () => {


    //#region Hooks & States
    const { message } = App.useApp();
    const { isMobile } = useResponsive();
    const { authRequest, user } = useContext(AuthContext);

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recentOrders, setRecentOrders] = useState([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalReviews: 0,
    });
    //#endregion Hooks & States

    
    //#region Utility Functions
    // 주문 데이터 포맷팅 함수
    const formatOrderData = useCallback((ordersData) => {
        return ordersData.map((order, index) => {
            const firstProduct = order.orderProductDTOList?.[0] || null;
            
            return {
                key: index.toString(),
                merchantUid: order.merchantUid || '없음',
                userEmail: order.email || '없음', 
                amount: order.currentTotalPrice || 0,
                status: firstProduct ? getOrderStatusText(firstProduct.status) : '알 수 없음',
                orderDate: order.createdAt?.substring(0, 10) || '없음'
            };
        });
    }, []);

    // 주문 상태 텍스트 변환
    const getOrderStatusText = (status) => {
        switch (status) {
            case 'PAYMENT_PENDING': return '결제대기';
            case 'PAYMENT_COMPLETED': return '결제완료';
            case 'PREPARING': return '상품준비중';
            case 'DELIVERING': return '배송중';
            case 'DELIVERED': return '배송완료';
            case 'DELIVERY_CONFIRMED': return '구매확정';
            case 'CANCEL_REQUESTED': return '취소요청';
            case 'CANCELLED': return '취소완료';
            case 'RETURN_REQUESTED': return '반품요청';
            case 'RETURNING': return '반품중';
            case 'RETURNED': return '반품완료';
            case 'EXCHANGE_REQUESTED': return '교환요청';
            case 'EXCHANGE_RETURNING': return '교환반품중';
            case 'EXCHANGE_PREPARING': return '교환품준비중';
            case 'EXCHANGE_DELIVERING': return '교환품배송중';
            case 'EXCHANGE_DELIVERED': return '교환품배송완료';
            default: return status || '알 수 없음';
        }
    };

    // 주문 상태 태그 색상 지정
    const getStatusTag = (status) => {
        let color = 'default';
        if (
            status === '상품준비중' || 
            status === '교환품준비중' ||  
            status === '배송중' ||
            status === '교환품배송중' ||
            status === '결제완료'
        ) color = 'processing';
        else if (
            status === '반품중' ||
            status === '교환반품중'
        ) color = 'cyan';
        else if (
            status === '결제대기'
        ) color = 'blue';
        else if (
            status === '배송완료' ||
            status === '교환품배송완료' ||
            status === '반품완료'
        ) color = 'geekblue';
        else if (
            status === '구매확정'
        ) color = 'success';
        else if (
            status === '취소요청' || 
            status === '반품요청' || 
            status === '교환요청'
        ) color = 'warning';
        else if (
            status === '취소완료'
        ) color = 'error';
    
        return <Tag color={color} style={{ marginRight: 0 }}>{status}</Tag>;
    };
    //#endregion Utility Functions

    
    //#region API Functions
    // 총 회원 수 조회
    const fetchTotalUsers = useCallback(async () => {
        if (!user) return;
        
        try {
            const response = await authRequest('get', '/user/count');
            return response.data ?? 0;
        } catch (error) {
            console.error('총 회원 수 조회 에러:', error);
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '예기치 못한 오류로 총 회원 수 조회에 실패했습니다.');
            }
        }
    }, [authRequest, message, user]);
    
    // 총 주문 수 조회
    const fetchTotalOrders = useCallback(async () => {
        if (!user) return;
        
        try {
            const response = await authRequest('get', '/order/count');
            return response.data ?? 0;
        } catch (error) {
            console.error('총 주문 수 조회 에러:', error);
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '예기치 못한 오류로 총 주문 수 조회에 실패했습니다.');
            }
        }
    }, [authRequest, message, user]);

    // 최근 주문 목록 조회
    const fetchRecentOrders = useCallback(async () => {
        if (!user) return;
        
        try {
            const response = await authRequest('get', '/order/orderListForAdmin', {
                merchantUid: '',
                userEmail: '',
                startDate: '',
                endDate: '',
                page: 1,
                size: 5,
                sortField: 'createdAt',
                sortOrder: 'DESC'
            });
            return response.data;
        } catch (error) {
            console.error('최근 주문 목록 조회 에러:', error);
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '예기치 못한 오류로 최근 주문 목록 조회에 실패했습니다.');
            }
        }
    }, [authRequest, message, user]);

    // 총 매출 조회
    const fetchTotalRevenue = useCallback(async () => {
        if (!user) return;
        
        try {
            const response = await authRequest('get', '/payment/totalRevenue');
            return response.data ?? 0;
        } catch (error) {
            console.error('총 매출 조회 에러:', error);
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '예기치 못한 오류로 총 매출 조회에 실패했습니다.');
            }
        }
    }, [authRequest, message, user]);

    // 총 리뷰 수 조회
    const fetchTotalReviews = useCallback(async () => {
        if (!user) return;
        
        try {
            const response = await authRequest('get', '/review/count');
            return response.data ?? 0;
        } catch (error) {
            console.error('총 리뷰 수 조회 에러:', error);
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '예기치 못한 오류로 총 리뷰 수 조회에 실패했습니다.');
            }
        }
    }, [authRequest, message, user]);
    
    // 대시보드 데이터 로드
    const fetchDashboardData = useCallback(async () => {
        if (!user) return;
        
        setLoading(true);
        setError(null);

        try {
            // 데이터 로드
            const [
                totalUsers,
                totalOrders,
                recentOrders,
                totalRevenue,
                totalReviews
            ] = await Promise.all([
                fetchTotalUsers(),
                fetchTotalOrders(),
                fetchRecentOrders(),
                fetchTotalRevenue(),
                fetchTotalReviews()
            ]);
                
            // 주문 데이터 포맷팅
            const formattedOrders = formatOrderData(recentOrders);

            // 통계 데이터 설정
            setStats({
                totalUsers,
                totalOrders,
                totalRevenue,
                totalReviews,
            });
            
            // 최근 주문 데이터 설정
            setRecentOrders(formattedOrders);
        } catch (error) {
            console.error('Dashboard 데이터 로드 오류:', error);
            setError(error.message || '예기치 못한 오류로 대시보드 데이터 로드에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, [
        fetchTotalUsers, 
        fetchTotalOrders, 
        fetchRecentOrders, 
        fetchTotalRevenue, 
        fetchTotalReviews, 
        formatOrderData,
        user
    ]);
    //#endregion API Functions

    
    //#region Effect Hooks
    // 대시보드 데이터 로드
    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);
    //#endregion Effect Hooks

    
    //#region Table Column Definitions
    // 주문 내역 테이블 컬럼 설정
    const columns = [
        {
            title: '주문번호',
            dataIndex: 'merchantUid',
            key: 'merchantUid',
            align: 'center',
        },
        {
            title: '회원',
            dataIndex: 'userEmail',
            key: 'userEmail',
            align: 'center',
        },
        {
            title: '금액',
            dataIndex: 'amount',
            key: 'amount',
            align: 'center',
            render: (amount) => `₩${amount.toLocaleString()}`,
        },
        {
            title: '상태',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (status) => getStatusTag(status),
        },
        {
            title: '주문일자',
            dataIndex: 'orderDate',
            key: 'orderDate',
            align: 'center',
        },
    ];
    //#endregion Table Column Definitions


    //#region Render Functions
    // 모바일 대시보드 렌더링
    const renderMobileCards = () => {
        if (recentOrders.length === 0) {
            return <NoOrdersMessage>주문 내역이 없습니다.</NoOrdersMessage>;
        }

        return (
            <div>
                {recentOrders.map((order) => (
                    <MobileOrderCard 
                        key={order.key} 
                    >
                        <MobileOrderRow>
                            <b>주문번호:</b> {order.merchantUid}
                        </MobileOrderRow>
                        <MobileOrderRow>
                            <b>회원:</b> {order.userEmail}
                        </MobileOrderRow>
                        <MobileOrderRow>
                            <b>금액:</b> {order.amount.toLocaleString()}원
                        </MobileOrderRow>
                        <MobileOrderRow>
                            <b>상태:</b> {getStatusTag(order.status)}
                        </MobileOrderRow>
                        <MobileOrderRow>
                            <b>주문일자:</b> {order.orderDate}
                        </MobileOrderRow>
                    </MobileOrderCard>
                ))}
            </div>
        );
    };

    // 에러 메시지 렌더링
    if (error) {
        return (
            <Alert 
                message="데이터를 로드하는 중 오류가 발생했습니다." 
                description={
                    <>
                        {error}
                        <ErrorButtonContainer>
                            <Button 
                                type="primary" 
                                icon={<ReloadOutlined />}
                                onClick={fetchDashboardData}
                            >
                                다시 시도
                            </Button>
                        </ErrorButtonContainer>
                    </>
                } 
                type="error" 
                showIcon
            />
        );
    }

    // 대시보드 렌더링
    return (
        <Spin 
            spinning={loading}
            tip="데이터를 로드하고 있습니다..." 
            size="large"
        >
            <PageContainer>
                <HeaderContainer>
                    <HeaderTop>
                        <TitleContainer>
                            <PageTitle>대시보드</PageTitle>
                        </TitleContainer>
                        <RefreshButtonContainer>
                            <Button 
                                type="primary"
                                icon={<ReloadOutlined />}
                                onClick={fetchDashboardData}
                            >
                                새로고침
                            </Button>
                        </RefreshButtonContainer>
                    </HeaderTop>

                    <StatsRow gutter={[16, 16]}>
                        <Col xs={12} sm={12} lg={6}>
                            <Card>
                                <Statistic 
                                    title="총 회원 수" 
                                    value={stats.totalUsers} 
                                    prefix={<UserOutlined />}
                                    valueStyle={{ color: '#52c41a' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={12} sm={12} lg={6}>
                            <Card>
                                <Statistic 
                                    title="총 주문 수"
                                    value={stats.totalOrders} 
                                    prefix={<ShoppingCartOutlined />}
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={12} sm={12} lg={6}>  
                            <Card>
                                <Statistic 
                                    title="총 매출"
                                    value={stats.totalRevenue} 
                                    prefix={<>₩</>}
                                    valueStyle={{ color: '#faad14' }}
                                    formatter={(value) => `${value.toLocaleString()}`}
                                />
                            </Card>
                        </Col>
                        <Col xs={12} sm={12} lg={6}>
                            <Card>
                                <Statistic 
                                    title="총 리뷰 수" 
                                    value={stats.totalReviews} 
                                    prefix={<CommentOutlined />}
                                    valueStyle={{ color: '#722ed1' }}
                                />
                            </Card>
                        </Col>
                    </StatsRow>
                </HeaderContainer>
                
                <ContentContainer>
                    <OrderHistoryCard
                        title="최근 주문 내역" 
                        extra={
                            <Button type="link" href="/admin/orders">
                                모든 주문 보기
                            </Button>}
                    >
                        {isMobile ? (
                            renderMobileCards()
                        ) : (
                            <Table 
                                columns={columns}
                                dataSource={recentOrders}
                                size="small"
                                pagination={false}
                                scroll={{ x: 'max-content' }}
                                locale={{
                                    emptyText: '주문 내역이 없습니다.'
                                }}
                            />
                        )}
                    </OrderHistoryCard>
                </ContentContainer>
            </PageContainer>
        </Spin>
    );
    //#endregion Render Functions
};

export default AdminDashboard;
