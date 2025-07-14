import React, { useState, useEffect, useCallback, useContext } from 'react';
import { modalSizeStyle, modalCommonStyle } from '../styles/modalStyles';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
    App, Table, Button, Input, Select,
    Modal, Tag, Rate, Popconfirm
} from 'antd';
import {
    SearchOutlined, EyeOutlined, 
    DeleteOutlined, ShopOutlined
} from '@ant-design/icons';


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
    align-items: center;
    justify-content: flex-end;
    padding: 8px 8px 0 8px;
    background: #ffffff;
    gap: 8px;
`;

// 검색 입력 필드 스타일
const SearchInput = styled(Input)`
    width: 250px;
    
    @media (max-width: 768px) {
        width: 100%;
    }
`;

// 테이블 컨테이너
const TableContainer = styled.div`
    flex: 1;
    overflow: auto;
    margin-top: 10px;

    .ant-table-cell {
        white-space: nowrap;
    }
`;

// 리뷰 상세 정보 모달
const ReviewDetailModal = styled(Modal)`
    ${modalSizeStyle(400)}
    ${modalCommonStyle}

    .ant-modal-body {
        padding: 0;
        max-height: calc(100vh - 120px);
        overflow: auto;
        display: flex;
        flex-direction: column;
    }
`;

// 모달 헤더 컨테이너
const ModalHeader = styled.div`
    padding: 0;
    margin-bottom: 10px;
`;

// 모달 헤더 내부
const ModalHeaderContent = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`;

// 모달 타이틀 텍스트
const ModalTitleText = styled.div`
    font-size: clamp(14px, 2.5vw, 18px);
    font-weight: bold;
    overflow: hidden;
`;

// 모달 컨텐츠 컨테이너
const ModalContent = styled.div`
    flex: 1;
    overflow: auto;
`;

// 모달 컨텐츠 테이블
const ModalContentTable = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

// 리뷰 내용 섹션
const ReviewContentSection = styled.div`
    margin-bottom: 20px;
`;

// 리뷰 내용 타이틀
const ReviewContentTitle = styled.h3`
    font-size: 16px;
    margin-bottom: 12px;
`;


// 리뷰 내용 텍스트 영역
const ReviewContentArea = styled.div`
    border: 1px solid #f0f0f0;
    border-radius: 4px;
    padding: 12px;
    min-height: 100px;
    background-color: #fafafa;
    white-space: pre-wrap;
    word-break: break-all;
`;

// 버튼 컨테이너
const ButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 20px;
`;

// 클릭 가능한 셀 버튼 스타일 (테이블 내부에서만 사용)
const ClickableCellButton = styled(Button)`
    &.ant-btn {
        padding: 2px 4px;
        margin: 0;
        height: auto;
        line-height: inherit;
    }
`;

// 테이블 셀 스타일
const TABLE_CELL_STYLES = {
    labelCell: {
        padding: '10px',
        backgroundColor: '#fafafa',
        fontWeight: 'bold',
        border: '1px solid #f0f0f0'
    },
    valueCell: {
        padding: '10px',
        border: '1px solid #f0f0f0'
    }
};
//#endregion


const AdminReviews = () => {
    

    //#region Hooks & States
    const navigate = useNavigate();
    const { message } = App.useApp();
    const { authRequest, user } = useContext(AuthContext);

    const [reviews, setReviews] = useState([]);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchType, setSearchType] = useState('productCode');
    const [selectedReview, setSelectedReview] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    //#endregion Hooks & States


    //#region API Functions
    // 리뷰 목록 가져오기
    const fetchReviews = useCallback(async (customParams) => {
        if (!user) return;
        
        try {
            setLoading(true);

            const response = await authRequest('get', '/review/list', {
                offset: (currentPage - 1) * pageSize,
                size: pageSize,
                ...customParams
            });

            setReviews(response.data);
        } catch (error) {
            console.error('리뷰 목록 조회 에러:', error);
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '예기치 못한 오류로 리뷰 목록 조회에 실패했습니다.');
            }
        } finally {
            setLoading(false);
        }
    }, [authRequest, message, currentPage, pageSize, user]);

    // 리뷰 삭제 처리
    const handleDeleteReview = useCallback(async (reviewId) => {
        if (!user) return;
        
        try {
            const response = await authRequest('post', '/review/deleteReview', {
                reviewId: reviewId
            });

            message.success(response.data);
        
            if (detailModalVisible && selectedReview?.reviewId === reviewId) {
                setDetailModalVisible(false);
                setSelectedReview(null);
            }

            fetchReviews();
        } catch (error) {
            console.error('리뷰 삭제 에러:', error);            
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '예기치 못한 오류로 리뷰 삭제에 실패했습니다.');
            }
        }
    }, [authRequest, message, fetchReviews, detailModalVisible, selectedReview, user]);
    //#endregion API Functions

    
    //#region Event Handlers
    // 리뷰 상세 정보 모달 열기
    const showReviewDetail = (review) => {
        setSelectedReview(review);
        setDetailModalVisible(true);
    };

    // 상품 관리 페이지로 이동
    const navigateToProduct = (productName) => {
        navigate('/admin/products', { state: { searchText: productName } });
    };

    // 검색 처리
    const handleSearch = (type, keyword) => {
        const params = {
            offset: (currentPage - 1) * pageSize,
            size: pageSize,
        };
        
        const searchValue = String(keyword || '');
        if (searchValue.trim()) {
            params[type] = searchValue;
        }       
        
        setSearchType(type);
        setSearchKeyword(searchValue);
        setCurrentPage(1);
        fetchReviews(params); 
    };
    //#endregion Event Handlers


    //#region Effect Hooks
    // 초기 데이터 로딩
    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    // 검색 초기화
    useEffect(() => {
        setSearchKeyword('');
        setCurrentPage(1);
    }, []);

    // 페이지 변경시 데이터 로딩
    useEffect(() => {
        if (currentPage > 1) {
            fetchReviews();
        }
    }, [currentPage, pageSize, fetchReviews]);
    //#endregion Effect Hooks


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
    //#endregion Utility Functions


    //#region Table Definitions
    // 테이블 컬럼 정의
    const columns = [
        {
            title: '리뷰 ID',
            dataIndex: 'reviewId',
            key: 'reviewId',
            align: 'center',
            sorter: (a, b) => a.reviewId - b.reviewId,
        },
        {
            title: '상품 코드',
            dataIndex: 'productCode',
            key: 'productCode',
            align: 'center',
            render: (productCode, record) => (
                <ClickableCellButton
                    type="link" 
                    onClick={() => {handleSearch('productCode', record.productCode);}}
                >
                    {productCode}
                </ClickableCellButton>
            ),
        },
        {
            title: '회원 이메일',
            dataIndex: 'userEmail',
            key: 'userEmail',
            align: 'center',
            render: (userEmail, record) => (
                <ClickableCellButton 
                    type="link" 
                    onClick={() => handleSearch('userEmail', record.userEmail)}
                >
                    {userEmail}
                </ClickableCellButton>
            ),
            sorter: (a, b) => a.userEmail.localeCompare(b.userEmail),
        },
        {
            title: '평점',
            dataIndex: 'rating',
            key: 'rating',
            align: 'center',
            render: (rating) => 
                <Rate 
                    disabled 
                    defaultValue={Number(rating)}
                    style={{ fontSize: 15 }} 
                />,
            sorter: (a, b) => a.rating - b.rating,
        },
        {
            title: '내용',
            dataIndex: 'comment',
            key: 'comment',
            align: 'left',
            render: (comment) => {
                const truncatedComment = comment.length > 50 ? `${comment.substring(0, 50)}...` : comment;
                return truncatedComment;
            },
        },
        {
            title: '작성일',
            dataIndex: 'createdAt',
            key: 'createdAt',
            align: 'center',
            render: (date) => formatDate(date, false),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
            title: '상태',
            dataIndex: 'isDeleted',
            key: 'isDeleted',
            align: 'center',
            render: (isDeleted) => Number(isDeleted) === 0 ? 
                <Tag color="success" style={{ margin: 0 }}>활성</Tag> : 
                <Tag color="error" style={{ margin: 0 }}>삭제됨</Tag>,
            filters: [
                { text: '활성', value: 0 },
                { text: '삭제됨', value: 1 },
            ],
            onFilter: (value, record) => record.isDeleted === value,
        },
        {
            title: '작업',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Button
                    icon={<EyeOutlined />}
                    onClick={() => showReviewDetail(record)}
                    size="small"
                >
                    상세보기
                </Button>
            ),
        },
    ];

    // 리뷰 상세 정보 테이블 렌더링
    const renderDetailTable = useCallback(() => {
        if (!selectedReview) return null;

        const detailItems = [
            { label: '리뷰 ID', value: selectedReview.reviewId },
            { 
                label: '상품 코드(상품명)', 
                value: `${selectedReview.productCode}(${selectedReview.productName})`
            },
            { label: '회원 이메일', value: selectedReview.userEmail },
            { 
                label: '평점', 
                value: <Rate disabled defaultValue={Number(selectedReview.rating)} />
            },
            { 
                label: '상태',
                value: selectedReview.isDeleted === 0 ? 
                    <Tag color="success">활성</Tag> : 
                    <Tag color="error">삭제됨</Tag>
            },
            { 
                label: '작성일',
                value: formatDate(selectedReview.createdAt, true)
            },
            { 
                label: '수정일',
                value: formatDate(selectedReview.updatedAt, true)
            }
        ];

        return (
            <ModalContentTable>
                <tbody>
                    {detailItems.map(({ label, value }) => (
                        <tr key={label}>
                            <td style={TABLE_CELL_STYLES.labelCell}>
                                {label}
                            </td>
                            <td style={TABLE_CELL_STYLES.valueCell}>
                                {value}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </ModalContentTable>
        );
    }, [selectedReview]);
    //#endregion Table Definitions

    
    //#region Render Functions
    return (
        <PageContainer>
            <div>
                <PageTitle>리뷰 관리</PageTitle>

                {/* 검색 영역 */}
                <SearchContainer>
                    <Select
                        value={searchType}
                        onChange={setSearchType}
                        style={{ width: 120 }}
                    >
                        <Select.Option value="productCode">상품 코드</Select.Option>
                        <Select.Option value="userEmail">회원 이메일</Select.Option>
                    </Select>
                    <SearchInput
                        placeholder={`${searchType === 'productCode' ? '상품 코드' : '회원 이메일'} 검색`}
                        value={searchKeyword}
                        onChange={e => setSearchKeyword(e.target.value)}
                        onPressEnter={() => handleSearch(searchType, searchKeyword)}  // 파라미터 추가
                        allowClear
                    />
                    <Button
                        type="primary"
                        icon={<SearchOutlined />}
                        onClick={() => handleSearch(searchType, searchKeyword)}
                    >
                        검색
                    </Button>
                </SearchContainer>
            </div>

            <TableContainer>
                <Table
                    columns={columns}
                    dataSource={reviews}
                    loading={loading}
                    rowKey="reviewId"
                    scroll={{ x: 'max-content' }}
                    size="small"
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        onChange: (page, pageSize) => {
                            setCurrentPage(page);
                            setPageSize(pageSize);
                        },
                        position: ['bottomCenter'],
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                    }}
                />
            </TableContainer>

            {/* 리뷰 상세 정보 모달 */}
            <ReviewDetailModal
                title={null}
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
            >
                <ModalHeader>
                    <ModalHeaderContent>
                        <ModalTitleText>
                            리뷰 상세 정보
                        </ModalTitleText>
                    </ModalHeaderContent>
                </ModalHeader>
                {selectedReview && (
                    <ModalContent>
                        {renderDetailTable()}                        
                        <ReviewContentSection>
                            <ReviewContentTitle>리뷰 내용</ReviewContentTitle>
                            <ReviewContentArea>
                                {selectedReview.comment}
                            </ReviewContentArea>
                        </ReviewContentSection>
                        
                        <ButtonContainer>
                            <Button 
                                type="primary" 
                                onClick={() => navigateToProduct(selectedReview.productName)}
                                icon={<ShopOutlined />}
                            >
                                상품 보기
                            </Button>
                            <Popconfirm
                                title="이 리뷰를 삭제하시겠습니까?"
                                onConfirm={() => {
                                    handleDeleteReview(selectedReview.reviewId);
                                    setDetailModalVisible(false);
                                }}
                                okText="예"
                                cancelText="아니오"
                            >
                                <Button 
                                    danger
                                    icon={<DeleteOutlined />}
                                >
                                    리뷰 삭제
                                </Button>
                            </Popconfirm>
                        </ButtonContainer>
                    </ModalContent>
                )}
            </ReviewDetailModal>
        </PageContainer>
    );
    //#endregion Render Functions
};

export default AdminReviews;