import React, { useState, useEffect, useCallback, useContext } from 'react';
import { modalCommonStyle, modalSizeStyle } from '../styles/modalStyles';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
    App, Table, Button, Input, 
    Modal, Tag, Descriptions, Tooltip
} from 'antd';
import {
    SearchOutlined, UserOutlined, 
    EyeOutlined, SwapRightOutlined, InfoCircleOutlined
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
`;

// 회원 상세 정보 모달
const UserDetailModal = styled(Modal)`
    ${modalSizeStyle(600)}
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

// 비활성화 버튼
const DeactivateButton = styled(Button)`
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    padding: 0 8px;
    height: 20px;
    background-color: #ff4d4f;
    border-color: #ff4d4f;
    box-shadow: none;

    &:hover {
        background-color: #ff7875 !important;
        border-color: #ff7875 !important;
    }
`;

// 활성화 버튼
const ActivateButton = styled(Button)`
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    padding: 0 8px;
    height: 20px;
    background-color: #52c41a;
    border-color: #52c41a;
    box-shadow: none;

    &:hover {
        background-color: #73d13d !important;
        border-color: #73d13d !important;
    }
`;

// 로그인 기록 컨테이너
const LoginHistoryContainer = styled.div`
    margin-top: 20px;
`;

// 로그인 기록 타이틀
const LoginHistoryTitle = styled.h3`
    font-size: 16px;
    margin-bottom: 5px;
    font-weight: bold;
`;

// 주문 내역 버튼 컨테이너
const OrderButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    padding-top: 5px;
`;

// 주문 내역 버튼
const ViewOrdersButton = styled(Button)`
    font-size: clamp(12px, 2vw, 14px);
    height: ${props => window.innerWidth <= 768 ? '28px' : '32px'};
    padding: ${props => window.innerWidth <= 768 ? '0 8px' : '4px 15px'};
`;
//#endregion Styled Components


const AdminUsers = () => {


    //#region Hooks & States
    const navigate = useNavigate();
    const { message } = App.useApp();
    const { authRequest, user } = useContext(AuthContext);

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [inputEmail, setInputEmail] = useState('');
    const [searchEmail, setSearchEmail] = useState('');
    const [loginHistory, setLoginHistory] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [userDetailLoading, setUserDetailLoading] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    //#endregion Hooks & States


    //#region API Functions
    // 회원 목록 로딩
    const fetchUsers = useCallback(async () => {
        if (!user) return;
        
        try {
            setLoading(true);

            // 검색어가 있으면 검색어를 설정
            const params = {
                email: searchEmail || ''
            };

            const response = await authRequest('get', '/user/list', params);
            const userData = Array.isArray(response.data) ? response.data : [];
            setUsers(userData);
        } catch (error) {
            console.error('회원 목록 조회 에러:', error);            
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '예기치 못한 오류로 회원 목록 조회에 실패했습니다.');
            }
        } finally {
            setLoading(false);
        }
    }, [
        authRequest, 
        searchEmail, 
        message, 
        user, 
    ]);

    // 로그인 기록 조회
    const fetchLoginHistory = useCallback(async (userId) => {
        if (!user) return;
        
        if (!userId) return;

        setHistoryLoading(true);
        
        try {
            const response = await authRequest('get', '/user/loginHistory', {
                userId: userId
            });

            setLoginHistory(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('로그인 기록 조회 에러:', error);            
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '예기치 못한 오류로 로그인 기록 조회에 실패했습니다.');
            }
        } finally {
            setHistoryLoading(false);
        }
    }, [authRequest, message, user]);

    // 회원 상세 정보 조회
    const fetchUserDetail = useCallback(async (user) => {
        setSelectedUser({
            email: user.email,
            isAdmin: user.isAdmin,
            isDeleted: user.isDeleted
        });
        setDetailModalVisible(true);
        setUserDetailLoading(true);
        setHistoryLoading(true);

        try {
            const response = await authRequest('get', '/user/find', {
                email: user.email
            });
        
            setSelectedUser(response.data);
    
            if (response.data && response.data.userId) {
                fetchLoginHistory(response.data.userId);
            }
        } catch (error) {
            console.error('회원 상세 정보 조회 에러:', error);            
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '예기치 못한 오류로 회원 상세 정보 조회에 실패했습니다.');
            }
        } finally {
            setUserDetailLoading(false);
        }
    }, [authRequest, fetchLoginHistory, message]);

    // 회원 활성화/비활성화 상태 변경
    const toggleUserDeleted = useCallback(async (user) => {
        try {
            const newStatus = user.isDeleted === 0 ? 1 : 0;

            const response = await authRequest('post', '/user/updateUserDeletedForAdmin', {
                userId: user.userId,
                isDeleted: newStatus
            });

            message.success(response.data);
            
            setSelectedUser(prev => ({
                ...prev,
                isDeleted: newStatus
            }));
            
            fetchUsers();
        } catch (error) {
            console.error('회원 상태 변경 에러:', error);            
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '예기치 못한 오류로 회원 상태 변경에 실패했습니다.');
            }
        }
    }, [authRequest, message, fetchUsers]);
    //#endregion API Functions


    //#region Event Handlers
    // 검색 처리
    const handleSearch = async () => {
        setSearchEmail(inputEmail);
    };
    
    // 주문 내역 보기 버튼 클릭 핸들러
    const handleViewOrders = (email) => {
        navigate('/admin/orders', { state: { searchEmail: email } });
    };
    //#endregion Event Handlers


    //#region Utility Functions
    // 날짜 포맷 함수
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };

    // 날짜/시간 포맷 함수
    const formatDateDetail = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    // IP 주소 마스킹
    const maskIpAddress = (ip) => {
        if (!ip) return '-';
        
        // IPv4 주소인 경우 (예: 192.168.1.1)
        if (ip.includes('.')) {
            const parts = ip.split('.');
            return `${parts[0]}.${parts[1]}.${parts[2]}.*`;
        }
        
        // IPv6 주소인 경우 (예: 2001:0db8:85a3:0000:0000:8a2e:0370:7334)
        if (ip.includes(':')) {
            const parts = ip.split(':');
            const visibleParts = parts.slice(0, 4);
            return `${visibleParts.join(':')}:****:****`;
        }
        
        return ip;
    };

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
    //#endregion Utility Functions


    //#region Effect Hooks
    // 검색 초기화
    useEffect(() => {
        setInputEmail('');
        setSearchEmail('');
    }, []);

    // 초기 데이터 로딩
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    //#endregion Effect Hooks


    //#region Table Column Definitions
    // 테이블 컬럼 정의
    const columns = [
        {
            title: '이메일',
            dataIndex: 'email',
            key: 'email',
            align: 'center',
            sorter: (a, b) => a.email.localeCompare(b.email),
        },
        {
            title: '이름',
            dataIndex: 'name',
            key: 'name',
            align: 'center',
        },
        {
            title: '연락처',
            dataIndex: 'phone',
            key: 'phone',
            align: 'center',
            render: (phone) => formatPhoneNumber(phone),
        },
        {
            title: '가입일',
            dataIndex: 'createdAt',
            key: 'createdAt',
            align: 'center',
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            render: (date) => formatDate(date),
        },
        {
            title: '권한',
            dataIndex: 'isAdmin',
            key: 'isAdmin',
            align: 'center',
            render: (isAdmin) => isAdmin === 1 ? 
                <Tag color="red" style={{ margin: 0 }}>관리자</Tag> : 
                <Tag color="blue" style={{ margin: 0 }}>일반회원</Tag>,
            filters: [
                { text: '관리자', value: 1 },
                { text: '일반회원', value: 0 },
            ],
            onFilter: (value, record) => record.isAdmin === value,
        },
        {
            title: '상태',
            dataIndex: 'isDeleted',
            key: 'isDeleted',
            align: 'center',
            render: (isDeleted) => isDeleted === 0 ? 
                <Tag color="success" style={{ margin: 0 }}>활성</Tag> : 
                <Tag color="error" style={{ margin: 0 }}>비활성화</Tag>,
            filters: [
                { text: '활성', value: 0 },
                { text: '비활성화', value: 1 },
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
                    onClick={() => fetchUserDetail(record)}
                    size="small"
                >
                    상세보기
                </Button>
            ),
        },
    ];

    // 로그인 기록 테이블 컬럼 정의
    const historyColumns = [
        {
            title: '날짜/시간',
            dataIndex: 'loginDatetime',
            key: 'loginDatetime',
            align: 'center',
            render: (date) => formatDateDetail(date),
        },
        {
            title: '상태',
            dataIndex: 'loginStatus',
            key: 'loginStatus',
            align: 'center',
            render: (status) => status === 'SUCCESS' ? 
                <Tag color="success" style={{ margin: 0 }}>성공</Tag> : 
                <Tag color="error" style={{ margin: 0 }}>실패</Tag>,
        },
        {
            title: (
                <span>
                    IP 주소
                    <Tooltip title="보안 및 부정 로그인 방지 목적으로만 활용됩니다">
                        <InfoCircleOutlined style={{ marginLeft: 4 }} />
                    </Tooltip>
                </span>
            ),
            dataIndex: 'ipAddress',
            key: 'ipAddress',
            align: 'center',
            render: (ip) => maskIpAddress(ip),
        },
        {
            title: '기기 유형',
            dataIndex: 'deviceType',
            key: 'deviceType',
            align: 'center',
        },
        {
            title: '실패 사유',
            dataIndex: 'failReason',
            key: 'failReason',
            align: 'center',
            render: (reason) => reason || '-',
        },
    ];
    //#endregion Table Column Definitions


    //#region Render Functions
    return (
        <PageContainer>
            {/* 페이지 타이틀 */}
            <div>
                <PageTitle>
                    회원 관리
                </PageTitle>

                {/* 검색 영역 */}
                <SearchContainer>
                    <SearchInput
                        placeholder="이메일 검색"
                        value={inputEmail}
                        onChange={e => setInputEmail(e.target.value)}
                        onPressEnter={handleSearch}
                        prefix={<UserOutlined />}
                        allowClear
                    />
                    <Button
                        type="primary"
                        icon={<SearchOutlined />}
                        onClick={handleSearch}
                    >
                        검색
                    </Button>
                </SearchContainer>
            </div>

            {/* 회원 목록 테이블 */}
            <TableContainer>
                <Table
                    columns={columns}
                    dataSource={users}
                    loading={loading}
                    rowKey="userId"
                    scroll={{ x: 'max-content' }}
                    size="small"
                    pagination={{
                        position: ['bottomCenter'],
                    }}
                />
            </TableContainer>

            {/* 회원 상세 정보 모달 */}
            <UserDetailModal
                title={null}
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
            >
                <ModalHeader>
                    <ModalHeaderContent>
                        <ModalTitleText>
                            회원 상세 정보
                        </ModalTitleText>
                    </ModalHeaderContent>
                </ModalHeader>
                <ModalContent>
                {selectedUser && (
                    <div>
                        <Descriptions
                            bordered
                            column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                            size="small"
                            loading={userDetailLoading}
                        >
                            <Descriptions.Item label="이메일">{selectedUser.email}</Descriptions.Item>
                            <Descriptions.Item label="이름">{selectedUser.name}</Descriptions.Item>
                            <Descriptions.Item label="연락처">{formatPhoneNumber(selectedUser.phone)}</Descriptions.Item>
                            <Descriptions.Item label="주소">{selectedUser.address}</Descriptions.Item>
                            <Descriptions.Item label="가입일">{formatDateDetail(selectedUser.createdAt)}</Descriptions.Item>
                            <Descriptions.Item label="권한">
                                {selectedUser.isAdmin === 1 ? 
                                    <Tag color="red">관리자</Tag> : 
                                    <Tag color="blue">일반회원</Tag>
                                }
                            </Descriptions.Item>
                            <Descriptions.Item label="상태">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {selectedUser.isDeleted === 0 ? 
                                    <>
                                        <Tag color="success" style={{ marginRight: 0, fontSize: '14px', padding: '2px 10px' }}>활성</Tag>
                                        {selectedUser.isAdmin !== 1 && (
                                            <DeactivateButton 
                                                type="primary"
                                                icon={<SwapRightOutlined />}
                                                size="small"
                                                disabled={userDetailLoading}
                                                onClick={() => toggleUserDeleted(selectedUser)}
                                            >
                                                비활성화 하기
                                            </DeactivateButton>
                                        )}
                                    </> : 
                                    <>
                                        <Tag color="error" style={{ marginRight: 0, fontSize: '14px', padding: '2px 10px' }}>비활성</Tag>
                                        {selectedUser.isAdmin !== 1 && (
                                            <ActivateButton 
                                                type="primary"
                                                icon={<SwapRightOutlined />}
                                                size="small" 
                                                disabled={userDetailLoading}
                                                onClick={() => toggleUserDeleted(selectedUser)}
                                            >
                                                활성화 하기
                                            </ActivateButton>
                                        )}
                                    </>
                                    }
                                </div>
                            </Descriptions.Item>
                        </Descriptions>

                        <LoginHistoryContainer>
                            <LoginHistoryTitle>
                                로그인 기록
                            </LoginHistoryTitle>
                            <Table
                                columns={historyColumns}
                                dataSource={loginHistory}
                                loading={historyLoading}
                                rowKey="loginHistoryId"
                                size="small"
                                pagination={{ pageSize: 5, position: ['bottomCenter'] }}
                                scroll={{ x: 'max-content' }}
                            />
                        </LoginHistoryContainer>
                        
                        <OrderButtonContainer>
                            <ViewOrdersButton 
                                type="primary"
                                onClick={() => handleViewOrders(selectedUser.email)}
                                disabled={userDetailLoading}
                            >
                                이 회원의 주문 내역 보기
                            </ViewOrdersButton>
                        </OrderButtonContainer>
                    </div>
                )}
                </ModalContent>
            </UserDetailModal>
        </PageContainer>
    );
    //#endregion Render Functions
};

export default AdminUsers;