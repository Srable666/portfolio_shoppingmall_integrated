import React, { useState, useEffect, useContext, useCallback } from 'react';
import { modalCommonStyle, modalSizeStyle } from '../styles/modalStyles';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
    Card, Form, Input, Button,
    App, Descriptions, Modal, Space, Spin
} from 'antd';

//#region Styled Components
// 본인 확인 폼 컨테이너
const VerifyFormContainer = styled.div`
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
`;

// 카드 컨테이너
const CenteredCard = styled(Card)`
    .ant-card-head-title {
        text-align: center;
    }
`;

// 폼 아이템 컨테이너
const CenteredFormItem = styled(Form.Item)`
    text-align: center;
`;

// 텍스트 컨테이너
const CenteredText = styled.div`
    text-align: center;
    margin-top: 16px;
    color: #666;
`;

// 페이지 컨테이너
const PageContainer = styled.div`
    max-width: 400px;
    margin: 0 auto;
`;

// 페이지 타이틀
const PageTitle = styled.h2`
    text-align: center;
    margin-top: 0;
`;

// 정보 섹션
const InfoSection = styled.div`
`;

// 설명 컨테이너
const StyledDescriptions = styled(Descriptions)`
    .ant-descriptions-item-label {
        width: 100px;
        font-weight: bold;
    }
`;

// 액션 버튼 컨테이너
const ActionButtons = styled.div`
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 30px;

    @media (max-width: 480px) {
        flex-direction: column;
        width: 100%;
        align-items: center;

        .ant-btn {
            width: 50%;
        }
    }
`;

// 모달 컨테이너
const StyledModal = styled(Modal)`
    ${modalSizeStyle(400)}
    ${modalCommonStyle}
`;

// 폼 아이템 컨테이너
const CustomFormItem = styled(Form.Item)`    
    .ant-form-item-label {
        padding-bottom: 0px !important;
        margin-bottom: 0px !important;
    }
`;

// 주소 컨테이너
const AddressContainer = styled.div`
    .ant-form-item-label {
        padding-bottom: 0px !important;
        margin-bottom: 0px !important;
    }
    
    .ant-space {
        width: 100%;
    }
    
    .search-btn {
        width: 120px;
    }
`;

const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
`;
//#endregion Styled Components


const UserInfoManagement = () => {

    
    //#region Hooks & States
    const navigate = useNavigate();

    const { message } = App.useApp();
    const { authRequest, user, logout, isWithdrawing } = useContext(AuthContext);

    const [verifyForm] = Form.useForm();
    const [profileForm] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [userDetail, setUserDetail] = useState(null);
    const [isVerified, setIsVerified] = useState(false);
    const [activeModal, setActiveModal] = useState(null);
    //#endregion Hooks & States

    
    //#region Utility Functions
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


    //#region API Functions
    // 회원 상세 정보 조회
    const fetchUserDetail = useCallback(async () => {
        setLoading(true);

        try {
            const response = await authRequest('get', '/user/find', {
                email: user?.email
            });

            setUserDetail(response.data);
        
            // 프로필 수정 폼 초기값 설정
            profileForm.setFieldsValue({
                email: response.data.email,
                name: response.data.name,
                phone: response.data.phone,
                postcode: response.data.postcode,
                address: response.data.baseAddress,
                addressDetail: response.data.detailAddress
            });
        } catch (error) {
            console.error('회원 정보 조회 에러:', error);
            
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '예기치 못한 오류로 회원 정보 조회에 실패했습니다.');
            }
        } finally {
            setLoading(false);
        }
    }, [authRequest, user, profileForm, message]);

    // 비밀번호 확인
    const verifyPassword = useCallback(async (values) => {
        try {
            setLoading(true);

            const response = await authRequest('post', '/user/checkPassword', {
                password: values.password
            });

            setIsVerified(true);
            message.success(response.data);
        } catch (error) {
            console.error('비밀번호 확인 에러:', error);
            verifyForm.resetFields(['password']);
            
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '예기치 못한 오류로 비밀번호 확인에 실패했습니다.');
            }
        } finally {
            setLoading(false);
        }
    }, [authRequest, message, setIsVerified, setLoading, verifyForm]);

    // 프로필 정보 수정
    const updateProfile = useCallback(async (values) => {
        if (!user?.email) return;

        try {
            setLoading(true);

            const response = await authRequest('post', '/user/update', {
                email: user.email,
                name: values.name,
                phone: values.phone.replace(/-/g, ''),
                postcode: values.postcode,
                baseAddress: values.address,
                detailAddress: values.addressDetail || '',
                version: userDetail.version
            });

            message.success(response.data);
            setActiveModal(null);
            await fetchUserDetail();
        } catch (error) {
            console.error('프로필 수정 에러:', error);
            
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '예기치 못한 오류로 프로필 수정에 실패했습니다.');
            }
        } finally {
            setLoading(false);
        }
    }, [
        authRequest, 
        fetchUserDetail, 
        message, 
        user?.email, 
        setActiveModal, 
        setLoading, 
        userDetail
    ]);

    // 비밀번호 변경
    const updatePassword = useCallback(async (values) => {
        try {
            setLoading(true);

            const response = await authRequest('post', '/user/updatePassword', {
                currentPassword: values.currentPassword,
                newPassword: values.newPassword
            });

            message.success(response.data);
            passwordForm.resetFields();
            setActiveModal(null);
        } catch (error) {
            console.error('비밀번호 변경 에러:', error);
            
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '예기치 못한 오류로 비밀번호 변경에 실패했습니다.');
            }
        } finally {
            setLoading(false);
        }
    }, [authRequest, message, passwordForm, setActiveModal, setLoading]);

    // 회원 탈퇴
    const withdrawUser = useCallback(async (password) => {
        try {
            setLoading(true);

            const response = await authRequest('post', '/user/delete', {
                password: password
            });

            message.success(response.data);
            await logout({ skipApiCall: true, isWithdraw: true, reason: 'withdraw' });
            navigate('/', { replace: true });
        } catch (error) {
            console.error('회원 탈퇴 에러:', error);
            
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '예기치 못한 오류로 회원 탈퇴에 실패했습니다.');
            }
        } finally {
            setLoading(false);
        }
    }, [authRequest, message, logout, navigate, setLoading]);
    //#endregion API Functions

    
    //#region Event Handlers
    // 주소 검색
    const handleAddressSearch = () => {
        new window.daum.Postcode({
            oncomplete: (data) => {
                profileForm.setFieldsValue({
                    postcode: data.zonecode,
                    address: data.address
                });
                const addressDetailField = profileForm.getFieldInstance('addressDetail');
                if (addressDetailField) {
                    addressDetailField.focus();
                }
            }
        }).open();
    };
    //#endregion Event Handlers


    //#region Effect Hooks
    // 초기 데이터 로드
    useEffect(() => {
        if (!user?.email || isWithdrawing) {
            return;
        }

        if (isVerified) {
            fetchUserDetail();
        }
    }, [isVerified, fetchUserDetail, isWithdrawing, user]);
    //#endregion Effect Hooks


    //#region Render Logic
    if (!isVerified) {
        return (
            <VerifyFormContainer>
                <CenteredCard title="본인 확인">
                    <Form
                        form={verifyForm}
                        layout="vertical"
                        onFinish={verifyPassword}
                    >
                        <input
                            type="text"
                            name="username"
                            value={user?.email || ''}
                            autoComplete="username"
                            style={{ display: 'none' }}
                            readOnly
                        />
                        <Form.Item
                            name="password"
                            label="비밀번호"
                            rules={[{ required: true, message: '비밀번호를 입력해주세요' }]}
                        >
                            <Input.Password 
                                placeholder="비밀번호를 입력해주세요" 
                                autoComplete="current-password"
                            />
                        </Form.Item>
                        <CenteredFormItem>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                확인
                            </Button>
                        </CenteredFormItem>
                        <CenteredText>
                            <p>회원정보 관리는 본인 확인이 필요합니다.</p>
                            <p>현재 비밀번호를 입력해주세요.</p>
                        </CenteredText>
                    </Form>
                </CenteredCard>
            </VerifyFormContainer>
        );
    }

    return (
        <PageContainer>
            <PageTitle>회원정보 관리</PageTitle>
            
            <InfoSection>
                {loading ? (
                    <LoadingContainer>
                        <Spin size="large" >
                            <div style={{ minHeight: '200px' }} />
                        </Spin>
                    </LoadingContainer>
                ) : (
                    <>
                        <StyledDescriptions bordered column={1} size="small">
                            <Descriptions.Item label="이메일">{userDetail?.email}</Descriptions.Item>
                            <Descriptions.Item label="이름">{userDetail?.name}</Descriptions.Item>
                            <Descriptions.Item label="연락처">{formatPhoneNumber(userDetail?.phone)}</Descriptions.Item>
                            <Descriptions.Item label="주소">
                                {userDetail ? (
                                    <>
                                        ({userDetail.postcode}) {userDetail.baseAddress}
                                        {userDetail.detailAddress && ` ${userDetail.detailAddress}`}
                                    </>
                                ) : '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="가입일">
                                {userDetail?.createdAt ? new Date(userDetail.createdAt).toLocaleDateString() : '-'}
                            </Descriptions.Item>
                        </StyledDescriptions>

                        <ActionButtons>
                            <Button type="primary" onClick={() => setActiveModal('profile')}>
                                정보 수정
                            </Button>
                            <Button onClick={() => setActiveModal('password')}>
                                비밀번호 변경
                            </Button>
                            <Button danger onClick={() => setActiveModal('withdraw')}>
                                회원 탈퇴
                            </Button>
                        </ActionButtons>
                    </>
                )}
            </InfoSection>

            {/* 정보 수정 모달 */}
            <StyledModal
                title="정보 수정"
                open={activeModal === 'profile'}
                onCancel={() => setActiveModal(null)}
                footer={null}
                width={400}
            >
                <Form
                    form={profileForm}
                    layout="vertical"
                    onFinish={updateProfile}
                    scrollToFirstError
                >
                    <CustomFormItem
                        name="email"
                        label="이메일"
                        style={{ marginBottom: 10 }}
                    >
                        <Input 
                            placeholder="이메일"
                            disabled
                            size="large"
                        />
                    </CustomFormItem>
                    <CustomFormItem
                        name="name"
                        label="이름"
                        rules={[
                            { required: true, message: '이름을 입력해주세요.' },
                            { min: 2, message: '이름은 2자 이상이어야 합니다.' }
                        ]}
                        style={{ marginBottom: 10 }}
                    >
                        <Input 
                            placeholder="이름"
                            size="large"
                        />
                    </CustomFormItem>
                    <CustomFormItem
                        name="phone"
                        label="연락처"
                        rules={[
                            { required: true, message: '전화번호를 입력해주세요.' },
                            { 
                                pattern: /^[0-9]{10,11}$/, 
                                message: '올바른 전화번호 형식이 아닙니다 (예: 01012345678)' 
                            }
                        ]}
                        style={{ marginBottom: 10 }}
                    >
                        <Input
                            placeholder="전화번호 (예: 010-1234-5678)"
                            size="large"
                        />
                    </CustomFormItem>
                    <AddressContainer>
                        <div style={{ display: 'flex', gap: '3px', marginBottom: '3px' }}>
                            <Form.Item
                                name="postcode"
                                label="주소"
                                rules={[
                                    { required: true, message: '우편번호를 입력해주세요.' }
                                ]}
                                style={{ margin: 0, flex: 1 }}
                            >
                                <Input
                                    placeholder="우편번호"
                                    readOnly
                                    size="large"
                                    onClick={handleAddressSearch}
                                    style={{ cursor: 'pointer' }}
                                />
                            </Form.Item>
                            <Form.Item style={{ margin: 0, alignSelf: 'flex-end' }}>
                                <Button
                                    type="default"
                                    onClick={handleAddressSearch}
                                    size="large"
                                >
                                    주소 검색
                                </Button>
                            </Form.Item>
                        </div>

                        <Form.Item
                            name="address"
                            rules={[
                                { required: true, message: '주소를 입력해주세요.' }
                            ]}
                            style={{ marginBottom: '3px' }}
                        >
                            <Input
                                placeholder="기본주소"
                                readOnly
                                size="large"
                                onClick={handleAddressSearch}
                                style={{ cursor: 'pointer' }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="addressDetail"
                            rules={[
                                { required: false }
                            ]}
                        >
                            <Input
                                placeholder="상세주소 (직접 입력)"
                                size="large"
                            />
                        </Form.Item>
                    </AddressContainer>
                    <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                저장
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </StyledModal>

            {/* 비밀번호 변경 모달 */}
            <StyledModal
                title="비밀번호 변경"
                open={activeModal === 'password'}
                onCancel={() => setActiveModal(null)}
                width={300}
                footer={null}
            >
                <Form
                    form={passwordForm}
                    layout="vertical"   
                    onFinish={updatePassword}
                    onFinishFailed={({ errorFields }) => {
                        message.error('비밀번호 변경을 할 수 없습니다. 조건을 확인해주세요.');
                    }}
                >
                    <input
                        type="text"
                        name="username"
                        value={user?.email || ''}
                        autoComplete="username"
                        style={{ display: 'none' }}
                        readOnly
                    />
                    <CustomFormItem
                        name="currentPassword"
                        label="현재 비밀번호"
                        rules={[{ required: true, message: '현재 비밀번호를 입력해주세요' }]}
                        style={{ marginBottom: 10 }}
                    >
                        <Input.Password autoComplete="current-password" />
                    </CustomFormItem>
                    <CustomFormItem
                        name="newPassword"
                        label="새 비밀번호"
                        rules={[
                            { required: true, message: '새 비밀번호를 입력해주세요' },
                            { min: 8, message: '비밀번호는 8자 이상이어야 합니다' },
                            { max: 20, message: '비밀번호는 20자 이하여야 합니다' },
                            { 
                                pattern: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
                                message: '비밀번호는 영문 대/소문자, 숫자, 특수문자를 모두 포함해야 합니다'
                            },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('currentPassword') !== value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject('새 비밀번호는 현재 비밀번호와 같을 수 없습니다');
                                },
                            }),
                        ]}
                        style={{ marginBottom: 10 }}
                    >
                        <Input.Password autoComplete="new-password" />
                    </CustomFormItem>
                    <CustomFormItem
                        name="confirmPassword"
                        label="새 비밀번호 확인"
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: '새 비밀번호 확인을 입력해주세요' },
                            { 
                                pattern: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
                                message: '비밀번호는 영문 대/소문자, 숫자, 특수문자를 모두 포함해야 합니다'
                            },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject('비밀번호가 일치하지 않습니다');
                                },
                            }),
                        ]}
                        style={{ marginBottom: 20 }}
                    >
                        <Input.Password autoComplete="new-password" />
                    </CustomFormItem>
                    <Form.Item style={{ textAlign: 'center', marginBottom: 0 }}>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            변경
                        </Button>
                    </Form.Item>
                </Form>
            </StyledModal>

            {/* 회원 탈퇴 모달 */}
            <StyledModal
                title="회원 탈퇴"
                open={activeModal === 'withdraw'}
                onCancel={() => setActiveModal(null)}
                width={300}
                footer={null}
            >
                <Form 
                    layout="vertical"
                    onFinish={withdrawUser}
                >
                    <input
                        type="text"
                        name="username"
                        value={user?.email || ''}
                        autoComplete="username"
                        style={{ display: 'none' }}
                        readOnly
                    />
                    <p>정말로 탈퇴하시겠습니까?<br />
                    탈퇴 시 모든 정보가 삭제되고, 홈페이지로 이동합니다.</p>
                    <Form.Item
                        name="confirmPassword"
                        label="비밀번호 확인"
                        rules={[{ required: true, message: '비밀번호를 입력해주세요' }]}
                    >
                        <Input.Password autoComplete="current-password" />
                    </Form.Item>
                    <Form.Item style={{ textAlign: 'center', marginBottom: 0 }}>
                        <Button type="primary" danger htmlType="submit" loading={loading}>
                            탈퇴하기
                        </Button>
                    </Form.Item>
                </Form>
            </StyledModal>
        </PageContainer>
    );
    //#endregion Render Logic
};

export default UserInfoManagement;