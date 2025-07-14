import { AuthContext } from '../contexts/AuthContext';
import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { Form, Input, Button, App } from 'antd';
import { UserOutlined, HomeOutlined } from '@ant-design/icons';


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

// 링크 컨테이너
const LinkContainer = styled.div`
    text-align: center;
    margin-top: 20px;
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


const ForgotPasswordPage = () => {
    const { message } = App.useApp();
    const { sendPasswordResetEmail } = useContext(AuthContext);

    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    // 이메일 발송 처리
    const onFinish = async (values) => {
        setLoading(true);

        try {
            message.loading({
                content: '비밀번호 재설정 이메일을 발송 중입니다...',
                key: 'resetEmail',
                duration: 0
            });

            const response = await sendPasswordResetEmail(values.email);
            
            message.destroy('resetEmail');
            message.success({
                content: response.data,
                duration: 3
            });

            setEmailSent(true);
        } catch (error) {
            message.destroy('resetEmail');
            console.error('비밀번호 재설정 이메일 발송 에러:', error);

            if (!error.response) {
                message.error({
                    content: '네트워크 연결을 확인해주세요.',
                    duration: 3
                });
                return;
            }

            message.error({
                content: error.response.data || '예기치 못한 오류로 비밀번호 재설정 이메일 발송에 실패했습니다.',
                duration: 3
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <HomeButton to="/" aria-label="홈으로 이동">
                <HomeOutlined />
            </HomeButton>
            <Title>
                <h2>Shopping Mall</h2>
                <h1>비밀번호 재설정 요청</h1>
            </Title>

            {!emailSent ? (
                <>
                    <Description>
                        가입하신 이메일 주소를 입력하시면,<br />
                        비밀번호 재설정 링크를 보내드립니다.
                    </Description>
                    <StyledForm
                        name="forgotPassword"
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
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button 
                                type="primary" 
                                htmlType="submit"
                                loading={loading}
                            >
                                이메일 발송
                            </Button>
                        </Form.Item>
                    </StyledForm>
                </>
            ) : (
                <>
                    <Description>
                        입력하신 이메일 주소로 비밀번호 재설정 링크를 발송했습니다.<br />
                        이메일을 확인해 주세요.
                    </Description>
                </>
            )}

            <LinkContainer>
                <Link to="/login">로그인 페이지로 돌아가기</Link>
            </LinkContainer>

            <Footer>
                GYP Portfolio ShoppingMall &copy; {new Date().getFullYear()}
            </Footer>
        </Container>
    );
};

export default ForgotPasswordPage;