import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, App } from 'antd';
import styled from 'styled-components';
import { 
    UserOutlined, LockOutlined, MailOutlined, 
    PhoneOutlined, HomeOutlined
} from '@ant-design/icons';


//#region Styled Components
// 컨테이너
const Container = styled.div`
    max-width: 400px;
    margin: 40px auto;
    padding: 20px;
    position: relative;
    max-height: calc(100vh - 80px);
    overflow-y: auto;
    box-sizing: border-box;

    @media (max-width: 768px) {
        max-width: 300px;
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

// 폼
const StyledForm = styled(Form)`
    .ant-form-item {
        margin-bottom: 10px;
    }

    .ant-btn {
        width: 100%;
        height: 40px;
    }
`;

// 주소 컨테이너
const AddressContainer = styled.div`
    .ant-space {
        width: 100%;
    }
    
    .search-btn {
        width: 120px;
    }
`;

// 링크 컨테이너
const LinkContainer = styled.div`
    text-align: center;
    margin-top: 20px;

    a {
        color: #1890ff;
        text-decoration: none;
        font-weight: 500;
        
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


// 회원가입 페이지
const RegisterPage = () => {
    const navigate = useNavigate();

    const { message } = App.useApp();
    const { register } = useContext(AuthContext);

    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // 주소 검색
    const handleAddressSearch = () => {
        new window.daum.Postcode({
            oncomplete: (data) => {
                form.setFieldsValue({
                    postcode: data.zonecode,
                    baseAddress: data.address
                });
                const addressDetailField = form.getFieldInstance('addressDetail');
                if (addressDetailField) {
                    addressDetailField.focus();
                }
            }
        }).open();
    };

    // 회원가입 처리
    const onFinish = async (values) => {
        if (values.password !== values.confirmPassword) {
            message.error('비밀번호가 일치하지 않습니다.');
            return;
        }

        setLoading(true);
        message.loading('회원가입 처리 중...');

        try {
            const response = await register({
                email: values.email,
                password: values.password,
                name: values.name,
                phone: values.phone,
                postcode: values.postcode,
                baseAddress: values.baseAddress,
                detailAddress: values.addressDetail
            });
            
            message.destroy();
            message.success(response.data);
            navigate('/login');
        } catch (error) {
            console.error('회원가입 에러:', error);
            message.destroy();
            
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '예기치 못한 오류로 회원가입에 실패했습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    // 비밀번호 확인 검증
    const validateConfirmPassword = ({ getFieldValue }) => ({
        validator(_, value) {
            if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
            }
            return Promise.reject(new Error('비밀번호가 일치하지 않습니다.'));
        }
    });

    // 회원가입 페이지 렌더링
    return (
        <Container>
            <HomeButton to="/" aria-label="홈으로 이동">
                <HomeOutlined />
            </HomeButton>
            <Title>
                <h2>Shopping Mall</h2>
                <h1>회원가입</h1>
            </Title>
            <StyledForm
                form={form}
                name="register"
                onFinish={onFinish}
                scrollToFirstError
                onFinishFailed={({ errorFields }) => {
                    message.error('회원가입을 할 수 없습니다. 조건을 확인해주세요.');
                }}
            >
                <Form.Item
                    name="email"
                    rules={[
                        { required: true, message: '이메일을 입력해주세요.' },
                        { type: 'email', message: '올바른 이메일 형식이 아닙니다.' }
                    ]}
                >
                    <Input 
                        prefix={<MailOutlined />}
                        placeholder="이메일"
                        size="large"
                        autoComplete="username"
                    />
                </Form.Item>

                <Form.Item
                    name="name"
                    rules={[
                        { required: true, message: '이름을 입력해주세요.' },
                        { min: 2, message: '이름은 2자 이상이어야 합니다.' }
                    ]}
                >
                    <Input 
                        prefix={<UserOutlined />}
                        placeholder="이름"
                        size="large"
                        autoComplete="name"
                    />
                </Form.Item>

                <Form.Item
                    name="phone"
                    rules={[
                        { required: true, message: '전화번호를 입력해주세요.' },
                        { pattern: /^[0-9]{10,11}$/, message: '올바른 전화번호 형식이 아닙니다.' }
                    ]}
                >
                    <Input
                        prefix={<PhoneOutlined />}
                        placeholder="전화번호 ('-' 제외)"
                        size="large"
                        autoComplete="tel" 
                    />
                </Form.Item>

                <AddressContainer>
                    <div style={{ display: 'flex', gap: '3px', marginBottom: '3px' }}>
                        <Form.Item
                            name="postcode"
                            rules={[
                                { required: true, message: '우편번호를 입력해주세요.' }
                            ]}
                            style={{ margin: 0, flex: 1 }}
                        >
                            <Input
                                prefix={<HomeOutlined />}
                                placeholder="우편번호"
                                readOnly
                                size="large"
                                onClick={handleAddressSearch}
                                style={{ cursor: 'pointer' }}
                                autoComplete="postal-code"
                            />
                        </Form.Item>
                        <Form.Item style={{ margin: 0 }}>
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
                        name="baseAddress"
                        rules={[
                            { required: true, message: '주소를 입력해주세요.' }
                        ]}
                        style={{ marginBottom: '3px' }}
                    >
                        <Input
                            prefix={<HomeOutlined />}
                            placeholder="기본주소"
                            readOnly
                            size="large"
                            onClick={handleAddressSearch}
                            style={{ cursor: 'pointer' }}
                            autoComplete="street-address"
                        />
                    </Form.Item>

                    <Form.Item
                        name="addressDetail"
                        rules={[
                            { required: true, message: '상세주소를 입력해주세요.' },
                            { whitespace: true, message: '공백만으로는 상세주소를 입력할 수 없습니다.' }
                        ]}
                    >
                        <Input
                            prefix={<HomeOutlined />}
                            placeholder="상세주소 (직접 입력)"
                            size="large"
                            autoComplete="address-line2"
                        />
                    </Form.Item>
                </AddressContainer>

                <Form.Item
                    name="password"
                    rules={[
                        { required: true, message: '비밀번호를 입력해주세요.' },
                        { min: 8, message: '비밀번호는 8자 이상이어야 합니다.' },
                        { max: 20, message: '비밀번호는 20자 이하여야 합니다.' },
                        { 
                            pattern: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
                            message: '비밀번호는 영문 대/소문자, 숫자, 특수문자(@$!%*?&)를 모두 포함해야 합니다.'
                        }
                    ]}
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="비밀번호"
                        size="large"
                        autoComplete="new-password"
                    />
                </Form.Item>

                <Form.Item
                    name="confirmPassword"
                    dependencies={['password']}
                    rules={[
                        { required: true, message: '비밀번호를 다시 입력해주세요.' },
                        validateConfirmPassword
                    ]}
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="비밀번호 확인"
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
                        가입하기
                    </Button>
                </Form.Item>
            </StyledForm>

            <LinkContainer>
                이미 계정이 있으신가요? <Link to="/login">로그인</Link>
            </LinkContainer>

            <Footer>
                GYP Portfolio ShoppingMall &copy; {new Date().getFullYear()}
            </Footer>
        </Container>
    );
};

export default RegisterPage;