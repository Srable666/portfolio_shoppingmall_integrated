import React, { useState, useContext } from 'react';
import { Form, Input, Button, Card, App } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { AuthContext } from '../contexts/AuthContext';


//#region Styled Components
// 로그인 컨테이너 스타일링
const LoginContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f0f2f5;

    .ant-form-item {
        margin-bottom: 12px;
    }
`;

// 로그인 카드 스타일링
const LoginCard = styled(Card)`
    width: min(300px, 90%);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

// 로고 스타일링
const Logo = styled.div`
    text-align: center;
    margin: 16px 0;
    font-size: clamp(18px, 4vw, 20px);
    font-weight: bold;
    word-break: keep-all;
    line-height: 1.3;
`;
//#endregion Styled Components


// 로그인 페이지 컴포넌트
const AdminLogin = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const { message } = App.useApp();

    // 로그인 처리
    const handleLogin = async (values) => {
        setLoading(true);
        try {
            // 로그인 시도
            const userAuthInfo = await login(values.email, values.password);
            
            // 관리자 권한 확인
            if (userAuthInfo && userAuthInfo.isAdmin === 1) {
                message.success('관리자 로그인에 성공했습니다.'); 
                setTimeout(() => {
                    navigate('/admin/dashboard', { replace: true });
                }, 100);
            } else {
                message.error('존재하지 않는 관리자 계정입니다.');
            }
        } catch (error) {
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

    return (
        <LoginContainer>
            <LoginCard title={<Logo>GYP ShoppingMall<br />관리자 로그인</Logo>}>
                <Form
                    name="admin-login"
                    initialValues={{
                        remember: true,
                    }}
                    onFinish={handleLogin}
                >
                    <Form.Item
                        name="email"
                        rules={[{ required: true, message: '이메일을 입력해주세요.' }]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="이메일"
                            autoComplete="email"
                        />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: '비밀번호를 입력해주세요.' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="비밀번호"
                            autoComplete="current-password"
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>
                            로그인
                        </Button>
                    </Form.Item>
                </Form>
            </LoginCard>
        </LoginContainer>
    );
};

export default AdminLogin;
