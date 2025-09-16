import React, { useState, useCallback, useContext, useEffect } from 'react';
import { modalCommonStyle, modalSizeStyle } from '../styles/modalStyles';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
    App, Table, Button, Input,
    DatePicker, Select, Tag, Modal, Descriptions
} from 'antd';

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

// 상세 정보 모달
const DetailModal = styled(Modal)`
    ${modalSizeStyle(800)}
    ${modalCommonStyle}

    .ant-modal-body {
        padding: 0;
        max-height: calc(100vh - 120px);
        overflow: auto;
        display: flex;
        flex-direction: column;
    }
`;

// 모달 헤더
const ModalHeader = styled.div`
    padding: ${props => window.innerWidth <= 768 ? '8px 12px' : '12px 24px'};
    border-bottom: 1px solid #f0f0f0;
    background-color: #fff;
`;

// 모달 헤더 컨텐츠
const ModalHeaderContent = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: ${props => window.innerWidth <= 768 ? '4px' : '8px'};
`;

// 모달 타이틀
const ModalTitle = styled.div`
    font-size: clamp(14px, 2.5vw, 18px);
    font-weight: bold;
    overflow: hidden;
`;

// 모달 컨텐츠
const ModalContent = styled.div`
    flex: 1;
    overflow: auto;
    padding: 16px 24px;
`;

// 주문 상세 버튼 컨테이너
const OrderDetailButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    margin-top: 20px;
    border-top: 1px solid #f0f0f0;
    padding-top: 16px;
`;

// 주문 상세 버튼
const OrderDetailButton = styled(Button)`
    font-size: clamp(12px, 2vw, 14px);
    height: ${props => window.innerWidth <= 768 ? '28px' : '32px'};
    padding: ${props => window.innerWidth <= 768 ? '0 8px' : '4px 15px'};
`;
//#endregion Styled Components


const AdminPayments = () => {

    
    //#region Hooks & States
    const navigate = useNavigate();

    const { message } = App.useApp();
    const { authRequest, user } = useContext(AuthContext);

    const [loading, setLoading] = useState(false);
    const [payments, setPayments] = useState([]);
    const [dateRange, setDateRange] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchType, setSearchType] = useState('merchantUid');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    //#endregion Hooks & States

    
    //#region API Functions
    // 결제 목록 조회
    const fetchPayments = useCallback(async (params) => {
        if (!user) return;
        
        try {
            setLoading(true);

            const requestParams = { 
                impUid: params.impUid || '',
                merchantUid: params.merchantUid || '',
                buyerEmail: params.buyerEmail || '',
                startDate: params.startDate || '',
                endDate: params.endDate || '',
            };
    
            if (params.dateRange?.[0]) {
                requestParams.startDate = params.dateRange[0].startOf('day').format('YYYY-MM-DDTHH:mm:ss');
            }
            if (params.dateRange?.[1]) {
                requestParams.endDate = params.dateRange[1].endOf('day').format('YYYY-MM-DDTHH:mm:ss');
            }

            const response = await authRequest('get', '/payment/historyListForAdmin', requestParams);
            const paymentData = response.data || [];
            setPayments(paymentData);
        } catch (error) {
            console.error('결제 목록 조회 에러:', error);            
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '예기치 못한 오류로 결제 목록 조회에 실패했습니다.');
            }
        } finally {
            setLoading(false);
        }
    }, [
        authRequest, 
        message, 
        user, 
    ]);
    //#endregion API Functions


    //#region Event Handlers
    // 검색 처리
    const handleSearch = () => {
        const searchConditions = {
            dateRange,
        };

        if (searchKeyword) {
            searchConditions[searchType] = searchKeyword;
        }
        
        fetchPayments(searchConditions);
    };

    // 주문 상세 페이지로 이동
    const handleNavigateToOrder = (merchantUid) => {
        navigate('/admin/orders', { 
            state: { searchMerchantUid: merchantUid }
        });
    };
    //#endregion Event Handlers


    //#region Utility Functions
    // 날짜 포맷 함수
    const formatDate = (dateString, showTime = false) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            ...(showTime && {
                hour: '2-digit',
                minute: '2-digit'
            })
        });
    };

    const getPaymentMethodLabel = (paymentMethod) => {
        const labelMap = {
            'KAKAOPAY': '카카오페이',
            'NAVERPAY': '네이버페이',
            'TOSSPAY': '토스페이',
            'CARD': '신용카드',
            'POINT': '포인트'
        };
        return labelMap[paymentMethod] || paymentMethod;
    };

    // 결제 상태에 따른 태그 색상
    const getStatusTagColor = (status) => {
        const colorMap = {
            'READY': 'default',
            'PAID': 'success',
            'CANCELLED': 'error',
            'FAILED': 'error',
            'PARTIAL_CANCELLED': 'warning'
        };
        return colorMap[status] || 'default';
    };

    // 결제 상태 한글화
    const getStatusLabel = (status) => {
        const labelMap = {
            'READY': '결제대기',
            'PAID': '결제완료',
            'CANCELLED': '결제취소',
            'FAILED': '결제실패',
            'PARTIAL_CANCELLED': '부분 취소'
        };
        return labelMap[status] || status;
    };    
    //#endregion Utility Functions


    //#region Table Column Definitions
    // 테이블 컬럼 정의
    const columns = [
        {
            title: '결제요청일',
            dataIndex: 'createdAt',
            key: 'createdAt',
            align: 'center',
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            render: (date) => formatDate(date, false)
        },
        {
            title: '결제번호',
            dataIndex: 'impUid',
            key: 'impUid',
            align: 'center',
            sorter: (a, b) => a.impUid.localeCompare(b.impUid),
            render: (impUid) => (
                <ClickableCellButton 
                    type="link" 
                    className="clickable-cell"
                    onClick={() => {
                        setSearchType('impUid');
                        setSearchKeyword(impUid);
                        fetchPayments({
                            impUid: impUid,
                            merchantUid: '',
                            buyerEmail: '',
                            startDate: '',
                            endDate: ''
                        });
                    }}
                >
                    {impUid}
                </ClickableCellButton>
            )
        },
        {
            title: '주문번호',
            dataIndex: 'merchantUid',
            key: 'merchantUid',
            align: 'center',
            sorter: (a, b) => a.merchantUid.localeCompare(b.merchantUid),
            render: (merchantUid) => (
                <ClickableCellButton 
                    type="link" 
                    className="clickable-cell"
                    onClick={() => {
                        setSearchType('merchantUid');
                        setSearchKeyword(merchantUid);
                        fetchPayments({
                            impUid: '',
                            merchantUid: merchantUid,
                            buyerEmail: '',
                            startDate: '',
                            endDate: ''
                        });
                    }}
                >
                    {merchantUid}
                </ClickableCellButton>
            )
        },
        {
            title: '회원 이메일',
            dataIndex: 'buyerEmail',
            key: 'buyerEmail',
            align: 'center',
            render: (buyerEmail) => (
                <ClickableCellButton 
                    type="link" 
                    className="clickable-cell"
                    onClick={() => {
                        setSearchType('buyerEmail');
                        setSearchKeyword(buyerEmail);
                        fetchPayments({
                            impUid: '',
                            merchantUid: '',
                            buyerEmail: buyerEmail,
                            startDate: '',
                            endDate: ''
                        });
                    }}
                >
                    {buyerEmail}
                </ClickableCellButton>
            )
        },
        {
            title: '결제금액',
            dataIndex: 'paidAmount',
            key: 'paidAmount',
            align: 'center',
            sorter: (a, b) => Number(a.paidAmount) - Number(b.paidAmount),
            render: (paidAmount) => `₩${Number(paidAmount).toLocaleString()}`
        },
        {
            title: '결제수단',
            dataIndex: 'embPgProvider',
            key: 'embPgProvider',
            align: 'center',
            filters: [
                { text: '신용카드', value: 'CARD' },
                { text: '휴대폰', value: 'PHONE' },
                { text: '카카오페이', value: 'KAKAOPAY' },
                { text: '네이버페이', value: 'NAVERPAY' },
                { text: '토스페이', value: 'TOSSPAY' }
            ],
            render: (embPgProvider) => getPaymentMethodLabel(embPgProvider)
        },
        {
            title: '결제상태',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (status) => (
                <Tag color={getStatusTagColor(status)}>
                    {getStatusLabel(status)}
                </Tag>
            ),
            filters: [
                { text: '결제대기', value: 'READY' },
                { text: '결제완료', value: 'PAID' },
                { text: '결제취소', value: 'CANCELLED' },
                { text: '결제실패', value: 'FAILED' },
                { text: '부분 취소', value: 'PARTIAL_CANCELLED' }
            ],
            onFilter: (value, record) => record.status === value
        },
        {
            title: '작업',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Button
                    icon={<EyeOutlined />}
                    onClick={() => {
                        setSelectedPayment(record);
                        setDetailModalVisible(true);
                    }}
                    size="small"
                >
                    상세보기
                </Button>
            )
        }
    ];
    //#endregion Table Column Definitions

    
    //#region Component Definitions
    // 결제 상세 정보 렌더링
    const renderPaymentDetails = (selectedPayment, formatDate) => (
        <Descriptions 
            bordered 
            column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
            size="small"
        >
            <Descriptions.Item label="결제번호">
                {selectedPayment.impUid}
            </Descriptions.Item>
            <Descriptions.Item label="주문번호">
                {selectedPayment.merchantUid}
            </Descriptions.Item>
            <Descriptions.Item label="결제상태">
                <Tag color={getStatusTagColor(selectedPayment.status)}>
                    {getStatusLabel(selectedPayment.status)}
                </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="결제수단">
                {getPaymentMethodLabel(selectedPayment.embPgProvider)}
            </Descriptions.Item>
            <Descriptions.Item label="결제금액">
                ₩{Number(selectedPayment.paidAmount).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="결제요청시간">
                {formatDate(selectedPayment.createdAt, true)}
            </Descriptions.Item>
            <Descriptions.Item label="고객명">
                {selectedPayment.buyerName}
            </Descriptions.Item>
            <Descriptions.Item label="이메일">
                {selectedPayment.buyerEmail}
            </Descriptions.Item>
            <Descriptions.Item label="전화번호">
                {selectedPayment.buyerTel}
            </Descriptions.Item>
            {selectedPayment.errorCode && (
                <>
                    <Descriptions.Item label="오류코드" span={2}>
                        {selectedPayment.errorCode}
                    </Descriptions.Item>
                    <Descriptions.Item label="오류메시지" span={2}>
                        {selectedPayment.errorMessage}
                    </Descriptions.Item>
                </>
            )}
        </Descriptions>
    );
    //#endregion Component Definitions


    //#region Effect Hooks
    // 초기 데이터 로딩
    useEffect(() => {
        fetchPayments({
            impUid: '',
            merchantUid: '',
            buyerEmail: '',
            startDate: '',
            endDate: ''
        });
    }, [fetchPayments]);
    //#endregion Effect Hooks


    //#region Render Functions
    return (
        <PageContainer>            
            <div>
                <PageTitle>결제 관리</PageTitle>

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
                            <Select.Option value="impUid">결제번호</Select.Option>
                            <Select.Option value="merchantUid">주문번호</Select.Option>
                            <Select.Option value="buyerEmail">이메일</Select.Option>
                        </SearchTypeSelect>
                        <SearchInput
                            placeholder={`${
                                searchType === 'impUid' ? '결제번호' : 
                                searchType === 'merchantUid' ? '주문번호' : 
                                '이메일'
                            } 검색`}
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

            {/* 결제 목록 테이블 */}
            <TableContainer>
                <Table
                    columns={columns}
                    dataSource={payments}
                    loading={loading}
                    rowKey="paymentHistoryId"
                    pagination={{
                        position: ['bottomCenter'],
                    }}
                    scroll={{ x: 'max-content' }}
                    size="small"
                />
            </TableContainer>

            {/* 결제 상세 정보 모달 */}
            <DetailModal
                title={null}
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
            >
                <ModalHeader>
                    <ModalHeaderContent>
                        <ModalTitle>결제 상세 정보</ModalTitle>
                    </ModalHeaderContent>
                </ModalHeader>
                <ModalContent>
                    {selectedPayment && (
                        <>
                            {/* 결제 상세 정보 */}
                            {renderPaymentDetails(selectedPayment, formatDate)}

                            {/* 주문 상세 페이지로 이동 */}
                            <OrderDetailButtonContainer>
                                <OrderDetailButton 
                                    type="primary"
                                    onClick={() => handleNavigateToOrder(selectedPayment.merchantUid)}
                                >
                                    해당 주문 바로가기
                                </OrderDetailButton>
                            </OrderDetailButtonContainer>
                        </>
                    )}
                </ModalContent>
            </DetailModal>
        </PageContainer>
    );
    //#endregion Render Functions
};

export default AdminPayments;