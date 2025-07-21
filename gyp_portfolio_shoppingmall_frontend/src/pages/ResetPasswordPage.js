import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LockOutlined, HomeOutlined } from '@ant-design/icons';
import { AuthContext } from '../contexts/AuthContext';
import React, { useState, useContext } from 'react';
import { Form, Input, Button, App } from 'antd';
import styled from 'styled-components';

//#region Styled Components
// 컨테이너
const Container = styled.div`
    max-width: 300px;
    margin: 40px auto;
    padding: 20px;
    position: relative;

    @media (max-width: 768px) {
        padding: 20px 15px;
    }
`;

// 홈 버튼
const HomeButton = styled(Link)`
    position: absolute;
    top: 0;
    left: 0;
    color: #666;
    font-size: 20px;
    
    &:hover {
        color: #000;
    }
`;

// 타이틀
const Title = styled.div`
    text-align: center;
    margin-bottom: 30px;

    h2 {
        font-size: 18px;
        margin-bottom: 0;
    }

    h1 {
        font-size: 24px;
        margin: 0;
    }
`;

// 설명 텍스트
const Description = styled.p`
    text-align: center;
    color: #666;
    margin-bottom: 20px;
    font-size: 14px;
`;

// 폼
const StyledForm = styled(Form)`
    .ant-form-item {
        margin-bottom: 20px;
    }

    .ant-btn {
        width: 100%;
        height: 40px;
    }
`;

// 푸터
const Footer = styled.footer`
    text-align: center;
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #eee;
    color: #666;
    font-size: 12px;
`;
//#endregion Styled Components


const ResetPasswordPage = () => {
    const navigate = useNavigate();

    const { message } = App.useApp();
    const { resetPassword } = useContext(AuthContext);

    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);

    // URL에서 토큰 가져오기
    const token = searchParams.get('token');

    // 토큰이 없으면 에러 페이지 표시
    if (!token) {
        return (
            <Container>
                <HomeButton to="/" aria-label="홈으로 이동">
                    <HomeOutlined />
                </HomeButton>
                <Title>
                    <h2>Shopping Mall</h2>
                    <h1>비밀번호 재설정</h1>
                </Title>
                <Description>
                    유효하지 않은 접근입니다.<br />
                    비밀번호 재설정 이메일을 다시 요청해주세요.
                </Description>
                <Button type="primary" onClick={() => navigate('/forgot-password')}>
                    비밀번호 찾기
                </Button>
            </Container>
        );
    }

    // 비밀번호 재설정
    const onFinish = async (values) => {
        setLoading(true);
        try {
            const response = await resetPassword(token, values.newPassword);
            message.success(response.data);
            navigate('/login');
        } catch (error) {
            console.error('비밀번호 재설정 에러:', error);
            
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '예기치 못한 오류로 비밀번호 재설정에 실패했습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    // 비밀번호 확인 검증
    const validateConfirmPassword = ({ getFieldValue }) => ({
        validator(_, value) {
            if (!value || getFieldValue('newPassword') === value) {
                return Promise.resolve();
            }
            return Promise.reject(new Error('비밀번호가 일치하지 않습니다.'));
        }
    });

    return (
        <Container>
            <HomeButton to="/" aria-label="홈으로 이동">
                <HomeOutlined />
            </HomeButton>
            <Title>
                <h2>Shopping Mall</h2>
                <h1>비밀번호 재설정</h1>
            </Title>
            <Description>
                영문 대/소문자, 숫자, 특수문자를 포함하여<br />
                8-20자로 새로운 비밀번호를 입력해주세요.
            </Description>
            <StyledForm
                name="resetPassword"
                onFinish={onFinish}
            >
                <input 
                    type="email" 
                    autoComplete="username"
                    style={{ display: 'none' }}
                    aria-hidden="true"
                />
                <Form.Item
                    name="newPassword"
                    rules={[
                        { required: true, message: '새 비밀번호를 입력해주세요.' },
                        { min: 8, message: '비밀번호는 8자 이상이어야 합니다.' },
                        { max: 20, message: '비밀번호는 20자 이하여야 합니다.' },
                        { 
                            pattern: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
                            message: '비밀번호는 영문 대/소문자, 숫자, 특수문자를 모두 포함해야 합니다.'
                        }
                    ]}
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="새 비밀번호 입력"
                        size="large"
                        autoComplete="new-password"
                    />
                </Form.Item>

                <Form.Item
                    name="confirmPassword"
                    dependencies={['newPassword']}
                    rules={[
                        { required: true, message: '비밀번호를 다시 입력해주세요.' },
                        validateConfirmPassword
                    ]}
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="새 비밀번호 확인"
                        size="large"
                        autoComplete="new-password"
                    />
                </Form.Item>

                <Form.Item>
                    <Button 
                        type="primary" 
                        htmlType="submit"
                        loading={loading}
                    >
                        비밀번호 변경
                    </Button>
                </Form.Item>
            </StyledForm>

            <Footer>
                GYP Portfolio ShoppingMall &copy; {new Date().getFullYear()}
            </Footer>
        </Container>
    );
};

export default ResetPasswordPage;