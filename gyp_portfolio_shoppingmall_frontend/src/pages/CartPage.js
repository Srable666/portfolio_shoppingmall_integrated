import { DeleteOutlined, ShoppingOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import React, { useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getImageUrl, DEFAULT_PRODUCT_IMAGE } from '../utils/imageUtils';
import { useResponsive } from '../contexts/ResponsiveContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import styled from 'styled-components';
import {
    Table, Button, Typography, Empty, 
    App, Row, Col, Card, Tooltip, Spin
} from 'antd';

const { Text } = Typography;


//#region Styled Components
// 카트 컨테이너
const CartContainer = styled.div`
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    padding: 0;
`;

const Title = styled(Typography.Title)`
    text-align: center;
    margin-top: 0px;
`;

// 로딩 컨테이너
const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    padding: 40px 0;
`;

// 모바일 카드 스타일
const MobileCartItem = styled(Card)`
    margin-bottom: 12px;
    
    .item-header {
        display: flex;
        gap: 12px;
        margin-bottom: 12px;
    }
    
    .item-info {
        flex: 1;
        min-width: 0;
    }
    
    .item-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid #f0f0f0;
    }
    
    .quantity-control {
        display: flex;
        align-items: center;
        gap: 8px;
    }
`;

// 총 금액 섹션
const TotalSection = styled(Card)`
    margin-top: 20px;
    
    .total-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        
        &:last-child {
            margin-bottom: 0;
            padding-top: 12px;
            border-top: 1px solid #f0f0f0;
        }
    }
`;

// 배송비 정보 컨테이너
const ShippingInfoContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
`;

// 상품 이미지
const ProductImage = styled.img`
    width: 80px;
    height: 96px;
    object-fit: cover;
    border-radius: 4px;
`;

// 상품 이름
const ProductName = styled.div`
    cursor: pointer;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-height: 1.4;
`;

//#endregion Styled Components


// 장바구니 페이지
const CartPage = () => {
    
    //#region Hooks & States
    const navigate = useNavigate();
    const location = useLocation();

    const { message } = App.useApp();
    const { isMobile } = useResponsive();
    const { isAuthenticated, authRequest } = useContext(AuthContext);
    const { cartItems, updateQuantity, removeFromCart } = useCart();

    const [isLoading, setIsLoading] = useState(false);

    const SHIPPING_FEE = 3000;
    const FREE_SHIPPING_THRESHOLD = 50000;
    //#endregion Hooks & States


    //#region API Functions
    // 상품 클릭 이벤트 핸들러
    const handleProductClick = useCallback(async (record) => {
        try {
            const response = await authRequest('get', `/product/getCategoryPath/${record.categoryId}`);

            const categoryInfo = {
                ...response.data[response.data.length - 1],
                categoryPath: response.data
            };
            
            // 카테고리 정보와 함께 페이지 이동
            navigate(`/${categoryInfo.code}/${record.productCode}`, {
                state: { 
                    categoryInfo,
                    product: {
                        ...record,
                        code: record.productCode
                    }
                }
            });
        } catch (error) {
            console.error('카테고리 경로 조회 에러:', error);            
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '예기치 못한 오류로 상품 페이지 이동에 실패했습니다.');
            }
        }
    }, [authRequest, navigate, message]);
    //#endregion API Functions


    //#region Utility Functions
    // 총 상품 금액 계산
    const totalPrice = cartItems.reduce((sum, item) => {
        return sum + (item.finalPrice * item.quantity);
    }, 0);

    // 배송비 계산
    const shippingFee = totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

    // 재고 한도 초과 메시지 핸들러
    const handleStockLimitReached = () => {
        message.warning('주문이 불가능한 수량에 도달했습니다.');
    };

    // 장바구니 아이템 메모이제이션
    const memoizedCartItems = useMemo(() => 
        cartItems.map(item => ({
            ...item,
            key: item.productItemId
        })), 
        [cartItems]
    );
    //#endregion Utility Functions

    
    //#region Effect Hooks
    // 상태 변경 감지
    useEffect(() => {
        if (location.state?.refresh) {
            setIsLoading(true);            
            setTimeout(() => {
                navigate(location.pathname, { 
                    replace: true, 
                    state: {} 
                });
                setIsLoading(false);
            }, 300);
        }
    }, [location.state?.refresh, location.pathname, navigate]);
    
    // 로그인 체크
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/cart' } });
        }
    }, [isAuthenticated, navigate]);
    //#endregion Effect Hooks


    //#region Table Column Definitions    
    // 칼럼 정의
    const getColumns = ({ onProductClick, onQuantityChange, onDelete }) => [
        {
            title: <div style={{ textAlign: 'center', width: '100%' }}>상품 정보</div>,
            dataIndex: 'name',
            key: 'product',
            align: 'left',
            render: (name, record) => (
                <ProductInfoRenderer 
                    name={name} 
                    record={record} 
                    onProductClick={onProductClick} 
                />
            ),
        },
        {
            title: '수량',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 100,
            align: 'center',
            render: (quantity, record) => (
                <QuantityControlRenderer 
                    quantity={quantity} 
                    record={record}
                    onQuantityChange={onQuantityChange}
                    onStockLimitReached={handleStockLimitReached}
                />
            ),
        },
        {
            title: '상품 금액',
            dataIndex: 'finalPrice',
            key: 'finalPrice',
            width: 120,
            align: 'center',
            render: (finalPrice, record) => (
                <PriceRenderer finalPrice={finalPrice} quantity={record.quantity} />
            ),
        },
        {
            title: '삭제',
            key: 'action',
            width: 50,
            align: 'center',
            render: (_, record) => (
                <DeleteButtonRenderer record={record} onDelete={onDelete} />
            ),
        },
    ];
    //#endregion Table Column Definitions


    //#region Renderers
    // 상품 정보 렌더러
    const ProductInfoRenderer = ({ name, record, onProductClick }) => (
        <Row gutter={16} align="middle" wrap={false}>
            <Col flex="none">
                <ProductImage   
                    src={getImageUrl(record.imageUrl)}
                    alt={name}
                    onClick={() => onProductClick(record)}
                    style={{ cursor: 'pointer' }}
                    onError={(e) => {
                        e.target.src = DEFAULT_PRODUCT_IMAGE;
                    }}
                />
            </Col>
            <Col flex="auto" style={{ minWidth: 0 }}>
                <ProductName 
                    onClick={() => onProductClick(record)} 
                >
                    <Text strong>{name}</Text>
                </ProductName>
                <div>
                    <Text type="secondary">사이즈: {record.size}</Text>
                </div>
                <div>
                    <Text type="secondary">컬러: {record.color}</Text>
                </div>
            </Col>
        </Row>
    );

    // 수량 조절 렌더러
    const QuantityControlRenderer = ({ quantity, record, onQuantityChange, onStockLimitReached }) => (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Button
                size="small"
                onClick={() => quantity > 1 && onQuantityChange(record.productItemId, quantity - 1)}
            >
                -
            </Button>
            <span style={{ minWidth: '30px', textAlign: 'center' }}>
                {quantity}
            </span>
            <Button
                size="small"
                onClick={() => {
                    const newQuantity = quantity + 1;
                    if (newQuantity > record.stockQuantity) {
                        onStockLimitReached();
                        return;
                    }
                    onQuantityChange(record.productItemId, newQuantity);
                }}
            >
                +
            </Button>
        </div>
    );

    // 가격 렌더러
    const PriceRenderer = ({ finalPrice, quantity }) => (
        <Text strong>￦{(finalPrice * quantity).toLocaleString()}</Text>
    );

    // 삭제 버튼 렌더러
    const DeleteButtonRenderer = ({ record, onDelete }) => (
        <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record.productItemId)}
        />
    );

    // 모바일 장바구니 렌더러
    const renderMobileCart = () => (
        <div>
            {memoizedCartItems.map(item => (
                <MobileCartItem key={item.productItemId}>
                    <div className="item-header">
                        <ProductImage  
                            src={getImageUrl(item.imageUrl)}
                            alt={item.name}
                            onClick={() => handleProductClick(item)}
                            style={{ cursor: 'pointer' }}
                            onError={(e) => {
                                e.target.src = DEFAULT_PRODUCT_IMAGE;
                            }}
                        />
                        <div className="item-info">
                            <div 
                                style={{ cursor: 'pointer' }} 
                                onClick={() => handleProductClick(item)}
                            >
                                <Text strong>{item.name}</Text>
                            </div>
                            <div>
                                <Text type="secondary">사이즈: {item.size}</Text>
                            </div>
                            <div>
                                <Text type="secondary">컬러: {item.color}</Text>
                            </div>
                        </div>
                    </div>
                    <div className="item-controls">
                        <div className="quantity-control">
                            <Text>수량:</Text>
                            <Button
                                size="small"
                                onClick={() => {
                                    if (item.quantity > 1) {
                                        updateQuantity(item.productItemId, item.quantity - 1);
                                    }
                                }}
                            >
                                -
                            </Button>
                            <span style={{ minWidth: '30px', textAlign: 'center' }}>
                                {item.quantity}
                            </span>
                            <Button
                                size="small"
                                onClick={() => {
                                    const newQuantity = item.quantity + 1;
                                    if (newQuantity > item.stockQuantity) {
                                        message.warning('주문이 불가능한 수량에 도달했습니다.');
                                        return;
                                    }
                                    updateQuantity(item.productItemId, newQuantity);
                                }}
                            >
                                +
                            </Button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Text strong>￦{(item.finalPrice * item.quantity).toLocaleString()}</Text>
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => removeFromCart(item.productItemId)}
                            />
                        </div>
                    </div>
                </MobileCartItem>
            ))}
        </div>
    );

    return (
        <CartContainer>
            <Title level={3}>장바구니</Title>
            
            {isLoading ? (
                <LoadingContainer>
                    <Spin size="large" tip="장바구니 새로고침 중..." />
                </LoadingContainer>
            ) : (
                cartItems.length > 0 ? (
                    <>
                        {isMobile ? renderMobileCart() : (
                            <Table
                                columns={getColumns({
                                    onProductClick: handleProductClick,
                                    onQuantityChange: updateQuantity,
                                    onDelete: removeFromCart
                                })}
                                dataSource={cartItems}
                                rowKey={(record) => record.productItemId}
                                pagination={false}
                            />
                        )}
                        
                        <TotalSection>
                            <div className="total-row">
                                <Text>총 상품 금액</Text>
                                <Text strong>￦{totalPrice.toLocaleString()}</Text>
                            </div>
                            <div className="total-row">
                                <ShippingInfoContainer>
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
                                </ShippingInfoContainer>
                                <Text strong>￦{shippingFee.toLocaleString()}</Text>
                                
                            </div>
                            <div className="total-row">
                                <Text strong>결제 예정 금액</Text>
                                <Text strong style={{ color: '#ff4d4f', fontSize: '18px' }}>
                                    ￦{(totalPrice + shippingFee).toLocaleString()}
                                </Text>
                            </div>
                        </TotalSection>

                        <Row justify="center" style={{ marginTop: '20px' }}>
                            <Button
                                type="primary"
                                size="large"
                                icon={<ShoppingOutlined />}
                                onClick={() => navigate('/order')}
                            >
                                주문하기
                            </Button>
                        </Row>
                    </>
                ) : (
                    <Empty
                        description="장바구니가 비어있습니다"
                        style={{ margin: '40px 0' }}
                    >
                        <Button 
                            type="primary"
                            onClick={() => navigate('/')}
                        >
                            쇼핑 계속하기
                        </Button>
                    </Empty>
                )
            )}
        </CartContainer>
    );
    //#endregion Renderers
};

export default CartPage;