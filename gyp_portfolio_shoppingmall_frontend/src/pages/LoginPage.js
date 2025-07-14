import { UserOutlined, LockOutlined, HomeOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import React, { useState, useContext } from 'react';
import { Form, Input, Button, App } from 'antd';
import styled from 'styled-components';


//#region Styled Components
// 로그인 컨테이너
const LoginContainer = styled.div`
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

// 로그인 타이틀
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

// 로그인 폼
const StyledForm = styled(Form)`
    .ant-form-item {
        margin-bottom: 10px;
    }

    .login-form-forgot {
        float: right;
    }

    .ant-btn {
        width: 100%;
        height: 40px;
    }

    .login-form-button {
        margin-top: 10px;
    }
`;

// 
const LinkContainer = styled.div`
    text-align: center;
    margin-top: 10px;
    color: #666;

    a {
        margin-left: 8px;
        color: #1890ff;
        font-weight: 500;
        text-decoration: none;
        
        &:hover {
            text-decoration: underline;
        }
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


const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { message } = App.useApp();
    const { login, logout } = useContext(AuthContext);

    const [loading, setLoading] = useState(false);

    // 로그인 처리
    const onFinish = async (values) => {
        setLoading(true);
        try {
            message.loading({
                content: '로그인 처리 중...',
                key: 'login',
                duration: 0
            });

            const userAuthInfo = await login(values.email, values.password);
            
            if (userAuthInfo) {
                if (userAuthInfo.isAdmin === 0) {
                    message.destroy('login');
                    message.success('로그인에 성공했습니다.');

                    const from = location.state?.from || '/';
                    const categoryInfo = location.state?.categoryInfo;
                    
                    navigate(from, { 
                        replace: true,
                        state: categoryInfo ? { categoryInfo } : undefined
                    });
                } else {
                    await logout({ skipApiCall: true, reason: 'unauthorized' });
                    message.destroy('login');
                    message.error('일반 회원 로그인 페이지입니다. 관리자는 관리자 로그인을 이용해주세요.');
                    
                    navigate('/admin/login', { replace: true });
                }
            }
        } catch (error) {
            message.destroy('login');
            console.error('로그인 에러:', error);

            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '예기치 못한 오류로 로그인에 실패했습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    // 로그인 페이지 렌더링
    return (
        <LoginContainer>
            <HomeButton to="/" aria-label="홈으로 이동">
                <HomeOutlined />
            </HomeButton>
            <Title>
                <h2>Shopping Mall</h2>
                <h1>로그인</h1>
            </Title>
            <StyledForm
                name="login"
                onFinish={onFinish}
            >
                <Form.Item
                    name="email"
                    rules={[
                        { required: true, message: '이메일을 입력해주세요.' },
                        { type: 'email', message: '올바른 이메일 형식이 아닙니다.' }
                    ]}
                >
                    <Input 
                        prefix={<UserOutlined />} 
                        placeholder="이메일" 
                        size="large"
                        autoComplete="username"
                    />
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[{ required: true, message: '비밀번호를 입력해주세요.' }]}
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="비밀번호"
                        size="large"
                        autoComplete="current-password"
                    />
                </Form.Item>

                <Form.Item>
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        className="login-form-button"
                        loading={loading}
                    >
                        로그인
                    </Button>
                </Form.Item>
            </StyledForm>

            <LinkContainer>
                계정이 없으신가요? <Link to="/register">회원가입</Link>
            </LinkContainer>

            <LinkContainer>
                비밀번호가 기억나지 않으시나요? <Link to="/forgot-password">비밀번호 재설정</Link>
            </LinkContainer>

            <Footer>
                GYP Portfolio ShoppingMall &copy; {new Date().getFullYear()}
            </Footer>
        </LoginContainer>
    );
};

export default LoginPage;