import React, { useState, useCallback, useContext, useEffect } from 'react';
import { modalSizeStyle, modalCommonStyle } from '../styles/modalStyles';
import { useResponsive } from '../contexts/ResponsiveContext';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { usePayment } from '../contexts/PaymentContext';
import { AuthContext } from '../contexts/AuthContext';
import { getImageUrl } from '../utils/imageUtils';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
    Form, Input, Button, Table,
    Row, Col, Divider, Typography,
    Spin, App, Card, Tooltip, Modal,
} from 'antd';

const { Text } = Typography;


//#region Styled Components
// 페이지 타이틀 스타일
const PageTitle = styled(Typography.Title)`
    text-align: center;
    margin-top: 0px;
    margin-bottom: 20px !important;
`;

// 스타일 컴포넌트
const OrderContainer = styled.div`
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
    padding: 0;

    .ant-form-item-label {
        padding-bottom: 0px !important;
    }
`;

// 타이틀 스타일
const Title = styled(Typography.Title)`
    margin-top: 0px;
`;

// 주문 섹션 스타일
const OrderSection = styled.div`
    margin-bottom: 24px;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    @media (max-width: 768px) {
        padding: 15px;
    }

    h3 {
        font-size: 20px;
    }
`;

// 상품 정보 칼럼 스타일
const ProductColumn = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
`;

// 상품 이미지 스타일
const ProductImage = styled.img`
    width: 80px;
    height: 96px;
    object-fit: cover;
    border-radius: 4px;
`;

// 상품 정보 칼럼 스타일
const ProductInfo = styled.div`
    flex: 1;
    min-width: 0;
    text-align: left;
`;

// 상품 이름 스타일
const ProductName = styled.div`
    font-weight: bold;
    margin-bottom: 4px;
    word-break: break-word;
    line-height: 1.4;
`;

// 상품 옵션 스타일
const ProductOption = styled.div`
    color: #8c8c8c;
    font-size: 14px;
`;

// 주소 검색 스타일
const AddressContainer = styled.div`
    .ant-space {
        width: 100%;
    }
    
    .search-btn {
        width: 120px;
    }
`;

// 배송주소 검색 버튼 스타일
const AddressTopLine = styled.div`
    display: flex;
    gap: 3px;
`;

// 모바일 주문 상품 카드 스타일
const MobileOrderCard = styled(Card)`
    margin-bottom: 12px;
    
    .card-header {
        display: flex;
        gap: 12px;
        margin-bottom: 12px;
    }
    
    .card-info {
        flex: 1;
        min-width: 0;
    }
    
    .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid #f0f0f0;
    }
`;

// 결제 수단 모달 스타일
const PaymentMethodModal = styled(Modal)`
    ${modalSizeStyle(400)}
    ${modalCommonStyle}

    .ant-modal-body {
        padding-top: 10px;
    }
`;

// 결제 수단 버튼 스타일
const PaymentMethodButton = styled(Button)`
    height: 80px;
    width: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 14px;
    font-weight: bold;
    border-radius: 8px;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: all 0.2s ease;
    }
`;

// 테스트 결제 안내 문구 스타일
const PaymentMethodInfo = styled.div`
    margin-top: 20px;
    padding: 12px;
    background-color: #fff2f0;
    border: 1px solid #ffccc7;
    border-radius: 6px;
    text-align: center;
`;
//#endregion Styled Components


const OrderPage = () => {

    
    //#region Hooks & States
    const navigate = useNavigate();

    const { message } = App.useApp();
    const { isMobile } = useResponsive();
    const { requestPayment, isMobilePayment } = usePayment();
    const { user, authRequest } = useContext(AuthContext);
    const { cartItems, getTotalPrice, clearCart } = useCart();

    const [form] = Form.useForm();
    const [isOrdering, setIsOrdering] = useState(false);
    const [userLoading, setUserLoading] = useState(false);
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    
    const FREE_SHIPPING_THRESHOLD = 50000;
    //#endregion Hooks & States
    
    //#region API Functions
    // 사용자 상세 정보 조회
    const fetchUserDetails = useCallback(async () => {
        setUserLoading(true);
        
        try {
            const response = await authRequest('get', '/user/find', {
                email: user?.email
            });
        
            // 배송 정보 폼에 사용자 정보 자동 입력
            form.setFieldsValue({
                recipientName: response.data.name,
                recipientPhone: response.data.phone,
                recipientPostcode: response.data.postcode,
                recipientAddress: response.data.baseAddress,
                recipientAddressDetail: response.data.detailAddress
            });
        } catch (error) {
            console.error('회원 정보 조회 에러:', error);
            
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '예기치 못한 오류로 회원 정보 조회에 실패했습니다.');
            }
        } finally {
            setUserLoading(false);
        }
    }, [authRequest, user, form, message]);
    //#endregion API Functions


    //#region Event Handlers
    // 주소 검색 핸들러
    const handleAddressSearch = () => {
        new window.daum.Postcode({
            oncomplete: (data) => {
                form.setFieldsValue({
                    recipientPostcode: data.zonecode,
                    recipientAddress: data.address
                });
                const addressDetailField = form.getFieldInstance('recipientAddressDetail');
                if (addressDetailField) {
                    addressDetailField.focus();
                }
            }
        }).open();
    };
    
    // 결제하기 버튼 클릭 (모달 열기)
    const handlePaymentClick = async () => {
        try {
            // 폼 검증 먼저 실행
            await form.validateFields();
            
            // 검증 통과하면 결제 수단 선택 모달 열기
            setPaymentModalVisible(true);
        } catch (error) {
            console.error('폼 검증 실패:', error);
        }
    };

    // 결제 수단 선택 후 포트원 결제창 열기
    const handlePaymentMethodSelect = async (paymentMethod) => {
        try {
            message.loading('결제창을 불러오는 중입니다. 잠시만 기다려주세요...', 5);

            if (!window.IMP) {
                alert('포트원 SDK가 로드되지 않았습니다. 페이지를 새로고침해주세요.');
                return;
            }

            setIsOrdering(true);

            const values = form.getFieldsValue();

            const paymentInfo = {
                amount: getTotalPrice() + calculateShippingFee(getTotalPrice()),
                name: cartItems[0].name + (cartItems.length > 1 ? ` 외 ${cartItems.length - 1}건` : ''),
                buyerName: values.recipientName,
                buyerEmail: user.email,
                buyerTel: values.recipientPhone,
                buyerAddr: `${values.recipientAddress} ${values.recipientAddressDetail || ''}`,
                buyerPostcode: values.recipientPostcode,
                deliveryRequest: values.deliveryRequest,
                paymentMethod
            };

            const orderData = {
                products: cartItems,
                totalPrice: getTotalPrice(),
                shippingFee: calculateShippingFee(getTotalPrice())
            };

            const result = await requestPayment(paymentInfo, orderData);

            if (result.success) {
                setPaymentModalVisible(false);
                if (!isMobilePayment) {
                    message.success(result.order);
                    clearCart();
                    navigate('/order/complete');
                }
            }
        } catch (error) {
            message.destroy();
            console.error('Order Error:', error);

            // 모바일 환경에서는 리디렉션으로 인해 에러 처리가 필요 없음
            if (!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                if (error.name === 'PaymentError') {
                    // PaymentError의 원본 메시지나 코드에 따라 분기
                    if (error.message?.includes('PAY_PROCESS_CANCELED') || 
                        error.message?.includes('사용자가 결제를 취소')) {
                        message.info('결제가 취소되었습니다.');
                    } else if (error.code === 'NETWORK_ERROR') {
                        message.error('네트워크 연결을 확인해주세요.');
                    } else {
                        message.error('결제 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
                    }
                } else {
                    message.error('결제 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
                }
            }
        } finally {
            // 모바일 환경에서는 리디렉션으로 인해 실행되지 않음
            if (!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                setIsOrdering(false);
            }
        }
    };
    //#endregion Event Handlers


    //#region Utility Functions
    // 배송비 계산
    const calculateShippingFee = useCallback((totalPrice) => {
        return totalPrice >= 50000 ? 0 : 3000;
    }, []);
    //#endregion Utility Functions


    //#region Effect Hooks
    // 로그인 여부 확인 및 장바구니 비어있는지 체크
    useEffect(() => {
        if (!user) {
            message.warning('로그인이 필요한 서비스입니다.');
            navigate('/login', { 
                state: { 
                    from: '/order',
                    message: '로그인 후 이용 가능합니다.' 
                } 
            });
            return;
        }

        if (!cartItems || cartItems.length === 0) {
            message.warning('장바구니가 비어있습니다.');
            navigate('/cart');
            return;
        }
    }, [user, navigate, cartItems, message]);

    // 컴포넌트 마운트 시 사용자 정보 조회
    useEffect(() => {
        if (user?.email) {
            fetchUserDetails();
        }
    }, [fetchUserDetails, user]);
    //#endregion Effect Hooks

    
    //#region Table Column Definitions
    // 주문 상품 테이블 컬럼 정의
    const orderProductColumns = [
        {
            title: '상품',
            dataIndex: 'name',
            key: 'name',
            align: 'center',
            render: (text, record) => (
                <ProductColumn>
                    <ProductImage 
                        src={getImageUrl(record.imageUrl)} 
                        alt={record.name}
                        style={{ flexShrink: 0 }}
                    />
                    <ProductInfo>
                        <ProductName>
                            {text}
                        </ProductName>
                        <ProductOption>
                            {record.size} / {record.color}
                        </ProductOption>
                    </ProductInfo>
                </ProductColumn>
            ),
        },
        {
            title: '수량',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'center',
        },
        {
            title: '상품금액',
            dataIndex: 'finalPrice',
            key: 'finalPrice',
            align: 'center',
            render: (finalPrice, record) => (
                <Text strong>
                    ￦{(finalPrice * record.quantity).toLocaleString()}
                </Text>
            ),
        },
    ];
    //#endregion Table Column Definitions
    

    //#region Computed Values
    const totalPrice = getTotalPrice();
    const shippingFee = calculateShippingFee(totalPrice);
    //#endregion Computed Values


    //#region Render Functions
    // 모바일 주문 상품 렌더링
    const renderMobileOrderItems = () => (
        <div>
            {cartItems.map(item => (
                <MobileOrderCard key={item.productItemId} size="small">
                    <div className="card-header">
                        <ProductImage 
                            src={getImageUrl(item.imageUrl)} 
                            alt={item.name}
                            style={{ flexShrink: 0 }}
                        />
                        <div className="card-info">
                            <ProductName>
                                {item.name}
                            </ProductName>
                            <ProductOption>
                                {item.size} / {item.color}
                            </ProductOption>
                        </div>
                    </div>
                    <div className="card-footer">
                        <Text>수량: {item.quantity}개</Text>
                        <Text strong>￦{(item.finalPrice * item.quantity).toLocaleString()}</Text>
                    </div>
                </MobileOrderCard>
            ))}
        </div>
    );

    return (
        <OrderContainer>
            <PageTitle level={3}>주문/결제</PageTitle>

            {/* 1. 주문 상품 정보 섹션 */}
            <OrderSection>
                <Title level={3}>주문상품</Title>
                {isMobile ? (
                    renderMobileOrderItems()
                ) : (
                    <Table 
                        columns={orderProductColumns} 
                        dataSource={cartItems}
                        pagination={false}
                        rowKey="productItemId"
                        size="middle"
                    />
                )}
            </OrderSection>

            {/* 2. 배송 정보 입력 섹션 */}
            <Spin spinning={userLoading} tip="배송 정보를 불러오는 중...">
                <OrderSection>
                    <Title level={3}>배송정보</Title>
                    <Form form={form} layout="vertical">
                        <Form.Item 
                            label="받는 사람" 
                            name="recipientName"
                            style={{ marginBottom: 10 }}
                            rules={[{ required: true, message: '받는 사람을 입력해주세요' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item 
                            label="연락처" 
                            name="recipientPhone"
                            style={{ marginBottom: 10 }}
                            rules={[{ required: true, message: '연락처를 입력해주세요' }]}
                        >
                            <Input />
                        </Form.Item>

                        <AddressContainer>
                            <AddressTopLine>
                                <Form.Item
                                    name="recipientPostcode"
                                    label="배송주소"
                                    rules={[{ required: true, message: '우편번호를 입력해주세요' }]}
                                    style={{ marginBottom: 3, flex: 1 }}
                                >
                                    <Input
                                        readOnly
                                        onClick={handleAddressSearch}
                                        style={{ cursor: 'pointer' }}
                                        placeholder="우편번호"
                                    />
                                </Form.Item>
                                <Form.Item style={{ marginBottom: 3, alignSelf: 'flex-end' }}>
                                    <Button onClick={handleAddressSearch}>
                                        주소 검색
                                    </Button>
                                </Form.Item>
                            </AddressTopLine>

                            <Form.Item
                                name="recipientAddress"
                                rules={[{ required: true, message: '주소를 입력해주세요' }]}
                                style={{ marginBottom: '3px' }}
                            >
                                <Input
                                    readOnly
                                    onClick={handleAddressSearch}
                                    style={{ cursor: 'pointer' }}
                                    placeholder="기본주소"
                                />
                            </Form.Item>

                            <Form.Item
                                name="recipientAddressDetail"
                            style={{ marginBottom: 10 }}
                                rules={[
                                    { required: true, message: '상세주소를 입력해주세요' },
                                    { whitespace: true, message: '공백만으로는 상세주소를 입력할 수 없습니다' }
                                ]}
                            >
                                <Input placeholder="상세주소 (직접 입력)" />
                            </Form.Item>
                        </AddressContainer>
                        <Form.Item 
                            label="배송 요청사항" 
                            name="deliveryRequest"
                            style={{ marginBottom: 10 }}
                        >
                            <Input.TextArea placeholder="배송 시 요청사항을 입력해주세요" />
                        </Form.Item>
                    </Form>
                </OrderSection>
            </Spin>

            {/* 3. 결제 정보 섹션 */}
            <OrderSection>
                <Title level={3}>결제정보</Title>
                <Row justify="space-between" style={{ marginBottom: '12px' }}>
                    <Col>
                        <Text>상품금액</Text>
                    </Col>
                    <Col>
                        <Text>￦{totalPrice.toLocaleString()}</Text>
                    </Col>
                </Row>
                <Row justify="space-between" style={{ marginBottom: '12px' }}>
                    <Col>
                        <Text>배송비</Text>
                        <Tooltip title={`￦${FREE_SHIPPING_THRESHOLD.toLocaleString()} 이상 구매 시 무료배송`}>
                            <QuestionCircleOutlined
                                style={{ 
                                    fontSize: '14px',
                                    color: '#8c8c8c', 
                                    cursor: 'pointer', 
                                    marginLeft: '4px', 
                                }} 
                            />
                        </Tooltip>
                    </Col>
                    <Col>
                        <Text>￦{shippingFee.toLocaleString()}</Text>
                    </Col>
                </Row>
                <Divider />
                <Row justify="space-between">
                    <Col>
                        <Text strong>최종 결제금액</Text>
                    </Col>
                    <Col>
                        <Text strong style={{ color: '#ff4d4f', fontSize: '18px' }}>
                            ￦{(totalPrice + shippingFee).toLocaleString()}
                        </Text>
                    </Col>
                </Row>
            </OrderSection>

            {/* 5. 주문 버튼 */}        
            <Row justify="center" style={{ marginTop: '24px' }}>
                <Button 
                    type="primary" 
                    size="large"
                    onClick={handlePaymentClick}
                    loading={isOrdering}
                >
                    결제하기
                </Button>
            </Row>

            {/* 결제 수단 선택 모달 */}
            <PaymentMethodModal
                title="결제 수단 선택"
                open={paymentModalVisible}
                onCancel={() => setPaymentModalVisible(false)}
                footer={null}
            >
                <Row gutter={[0, 12]} style={{ flexDirection: 'column', alignItems: 'center' }}>
                    <Col span={24}>
                        <PaymentMethodButton 
                            size="large"
                            onClick={() => handlePaymentMethodSelect('kakaopay')}
                            style={{ borderColor: '#FEE500' }}
                        >
                            <img 
                                src="https://developers.kakao.com/tool/resource/static/img/button/pay/payment_icon_yellow_medium.png"
                                alt="카카오페이"
                                className="payment-icon"
                                style={{ width: '64px', objectFit: 'contain' }}
                            />
                        </PaymentMethodButton>
                    </Col>
                    <Col span={24}>
                        <PaymentMethodButton 
                            size="large"
                            onClick={() => handlePaymentMethodSelect('tosspay')}
                            style={{ borderColor: '#4285F4' }}
                        >
                            <img 
                                src="https://framerusercontent.com/images/Drn1qQIO9e99xqU7xmBBG8NjG8.jpg"
                                alt="토스페이"
                                className="payment-icon"
                                style={{ height: '75px', objectFit: 'contain' }}
                            />
                        </PaymentMethodButton>
                    </Col>
                    <Col span={24}>
                        <PaymentMethodButton 
                            size="large"
                            onClick={() => handlePaymentMethodSelect('naverpay')}
                            style={{ borderColor: '#03C75A' }}
                        >
                            <img 
                                src="https://developers.pay.naver.com/img/logo/signature/logo_navergr_small.svg"
                                alt="네이버페이"
                                className="payment-icon"
                                style={{ width: '64px', objectFit: 'contain' }}
                            />
                            <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
                                ※카드결제만 지원
                            </div>
                        </PaymentMethodButton>
                    </Col>
                </Row>
    
                {/* 테스트 결제 안내 문구 */}
                <PaymentMethodInfo>
                    <Text style={{ color: '#ff4d4f', fontSize: '12px', fontWeight: 'bold' }}>
                        ⚠️ 실제 결제되지 않는 테스트 결제입니다. 다만, 실제 결제가 되지 않더라도 선택한 결제 금액만큼의 잔액은 반드시 있어야 정상진행됩니다.
                    </Text>
                </PaymentMethodInfo>
            </PaymentMethodModal>
        </OrderContainer>
    );
    //#endregion Render Functions
};

export default OrderPage;