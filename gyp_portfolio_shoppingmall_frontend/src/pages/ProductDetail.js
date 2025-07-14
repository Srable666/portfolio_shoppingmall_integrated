import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';
import ProductMasterCard from '../components/ProductMasterCard';
import { AuthContext } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import styled from 'styled-components';
import { 
    Row, Col, Select, InputNumber, Button, 
    Spin, Typography, Descriptions, Tag, 
    Divider, App, Result, Rate, List, 
    Card, Space, Avatar
} from 'antd';

const { Title, Text } = Typography;
const { Option } = Select;


//#region Styled Components
// 로딩 컨테이너
const LoadingContainer = styled.div`
    text-align: center;
    padding: 40px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 4px;
    height: calc(100vh - 112px - 46px - 70px);

    .ant-spin-text {
        margin-top: 8px;
        color: #666;
        white-space: nowrap;
    }
`;

// 상품 상세 페이지 컨테이너
const ProductContainer = styled.div`
    max-width: 1200px;
    margin: 0 auto;
`;

// 상품 이미지 스타일
const ProductImageWrapper = styled.div`
    .ant-card {
        border: none;
        
        &:hover {
            transform: none;
        }
    }

    .ant-card-body {
        display: none;
    }
`;

// 가격 정보 스타일
const PriceInfo = styled.div`
    margin: 20px 0;
`;

// 원가 정보 스타일
const OriginalPrice = styled(Text)`
    text-decoration: ${props => props.$hasDiscount ? 'line-through' : 'none'};
    color: ${props => props.$hasDiscount ? '#999' : '#000'};
    font-size: 16px;
`;

// 할인율 정보 스타일
const DiscountRate = styled(Tag)`
    margin-left: 8px;
    font-size: 14px;
`;

// 최종 가격 정보 스타일
const FinalPrice = styled(Title)`
    color: #ff4d4f;
    margin-top: 8px !important;
`;

const StyledDivider = styled(Divider)`
    margin: 12px 0;
`;

// 반응형 컬럼 스타일
const ResponsiveCol = styled(Col)`
    @media (max-width: 1058px) {
        &.label-col {
            flex: 0 0 25% !important;
            max-width: 25% !important;
        }
        &.input-col {
            flex: 0 0 75% !important;
            max-width: 75% !important;
        }
    }
`;

// 상품 정보 스타일
const StyledDescriptions = styled(Descriptions)`
    .ant-descriptions-header {
        margin-bottom: 8px;
    }

    .ant-descriptions-item-label {
        width: 100px;
        text-align: center;
    }
`;

// 리뷰 섹션 스타일
const ReviewSection = styled.div`
    .ant-typography {
        margin: 0 0 8px 0;
    }

    .review-header-card {
        text-align: center;
            
        .ant-space {
            gap: 4px;
        }
        
        @media (max-width: 768px) {
            .ant-typography {
                font-size: 12px;
            }
            
            .ant-rate {
                font-size: 12px;
            }
            
            .ant-space {
                gap: 8px !important;
            }
        }
    }

    .ant-rate-star {
        margin-right: 2px !important;
    }
`;

// 리뷰 목록
const ReviewList = styled(List)`
    .ant-list-pagination {
        display: flex;
        justify-content: center;
        margin-top: 5px;
    }

    .ant-card {
        margin-top: -2px;
    }

    .ant-card-meta {
        margin: 0 16px;
    }

    .ant-card-meta-avatar {
        padding-top: 1px;
        padding-right: 8px;
    }

    .ant-card-meta-title {
        margin-bottom: 0px !important;
    }
`;

const ReviewCardDiv = styled.div`
    margin-top: -6px;
`;
//#endregion Styled Components


// 상품 상세 페이지 컴포넌트
const ProductDetail = () => {

    
    //#region Hooks & States
    const navigate = useNavigate();
    const location = useLocation();
    const initialProduct = location.state?.product;

    const { message } = App.useApp();
    const { productCode } = useParams();
    const { addToCart, cartItems } = useCart();
    const { authRequest } = useContext(AuthContext);
    const { isAuthenticated } = useContext(AuthContext);

    const [reviewPageSize] = useState(5);
    const [reviews, setReviews] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [reviewPage, setReviewPage] = useState(1);
    const [totalReviews, setTotalReviews] = useState(0);
    const [productItems, setProductItems] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [product, setProduct] = useState(initialProduct);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [reviewLoading, setReviewLoading] = useState(false);
    //#endregion Hooks & States


    //#region Computed Properties
    // 사이즈 옵션 생성
    const sizeOptions = [...new Set(productItems.map(item => item.size))];
    
    // 선택된 사이즈에 따른 컬러 옵션 생성
    const colorOptions = [...new Set(
        productItems
            .filter(item => item.size === selectedSize)
            .map(item => item.color)
    )];
    
    // 선택된 품목의 재고 확인
    const selectedItem = productItems.find(
        item => item.size === selectedSize && item.color === selectedColor
    );
    
    const availableStock = selectedItem ? selectedItem.stockQuantity - selectedItem.reservedQuantity : 0;
    //#endregion Computed Properties
    
    
    //#region API Functions
    // 상품 정보 조회
    const fetchProduct = useCallback(async () => {
        try {
            const response = await authRequest('get', `/product/getProduct/${productCode}`);
            
            setProduct(response.data);
            return response.data;
        } catch (error) {
            console.error('상품 정보 조회 에러:', error);
            
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '예기치 못한 오류로 상품 정보 조회에 실패했습니다.');
            }
            setNotFound(true);
            return null;
        }
    }, [authRequest, productCode, message]);

    // 카테고리 경로 조회
    const fetchCategoryPath = useCallback(async (categoryId) => {
        try {
            const response = await authRequest('get', `/product/getCategoryPath/${categoryId}`);
            
            navigate(location.pathname + location.search, {
                state: {
                    categoryInfo: {
                ...response.data[response.data.length - 1],
                categoryPath: response.data
                    }
                },
                replace: true
            });
        } catch (error) {
            console.error('카테고리 경로 조회 에러:', error);
            
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '예기치 못한 오류로 카테고리 경로 조회에 실패했습니다.');
            }
        }
    }, [authRequest, navigate, location.pathname, location.search, message]);

    // 상품 품목 정보 조회
    const fetchProductItems = useCallback(async (productId) => {
        try {
            const response = await authRequest('get', `/product/getProductItemsByProductId/${productId}`);
            
            setProductItems(response.data);
        } catch (error) {
            setNotFound(true);
            console.error('상품 품목 정보 조회 에러:', error);
            
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response?.data || '예기치 못한 오류로 상품 품목 정보 조회에 실패했습니다.');
            }
    
            setProductItems([]);
        }
    }, [authRequest, message]);

    // 전체 상품 데이터 조회
    const fetchProductData = useCallback(async () => {
        setLoading(true);
        try {
            const productData = await fetchProduct();
            if (productData) {
                await Promise.all([
                    fetchCategoryPath(productData.categoryId),
                    fetchProductItems(productData.productId)
                ]);
            }
        } catch (error) {
            console.error('상품 상세 정보 조회 실패:', error);
            message.error('상품 정보를 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
    }, [fetchProduct, fetchCategoryPath, fetchProductItems, message]);

    // 리뷰 조회
    const fetchReviews = useCallback(async () => {
        setReviewLoading(true);

        try {
            const productItemIds = productItems.map(item => item.productItemId);
        
            const response = await authRequest('get', '/review/list', {
                offset: (reviewPage - 1) * reviewPageSize,
                size: reviewPageSize,
                productItemIds: productItemIds,
                isDeleted: 0
            });
    
            setReviews(response.data);
            setTotalReviews(response.data.length);
            
            const avgRating = response.data.length > 0
                ? response.data.reduce((sum, review) => sum + Number(review.rating), 0) / response.data.length
                : 0;
            setAverageRating(avgRating);
        } catch (error) {
            console.error('리뷰 조회 에러:', error);
            
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '예기치 못한 오류로 리뷰 조회에 실패했습니다.');
            }
        } finally {
            setReviewLoading(false);
        }
    }, [authRequest, productItems, reviewPage, reviewPageSize, message]);
    //#endregion API Functions

    
    //#region Event Handlers
    // 장바구니 담기 버튼 클릭 이벤트 처리
    const handleCartButtonClick = useCallback(() => {
        if (!isAuthenticated) {
            message.warning('로그인이 필요한 서비스입니다.');
            navigate('/login', { 
                state: { from: location.pathname }
            });
            return;
        }

        if (!selectedItem) return;
        
        if (quantity > availableStock) {
            message.error('현재 요청하신 수량으로는 주문이 어렵습니다. 수량을 줄여주세요.');
            return;
        }
        
        try {
            const existingItem = cartItems.find(item => item.productItemId === selectedItem.productItemId);
            
            if (existingItem) {
                const totalQuantity = existingItem.quantity + quantity;
                if (totalQuantity > availableStock) {
                    message.error(`재고가 부족합니다. 현재 장바구니에 ${existingItem.quantity}개가 있습니다.`);
                    return;
                }
            }

            addToCart(product, selectedItem, quantity);
            message.success('장바구니에 상품이 담겼습니다.');
        } catch (error) {
            console.error('장바구니 담기 실패:', error);
            message.error('장바구니 담기에 실패했습니다.');
        }
    }, [
        isAuthenticated, 
        selectedItem, 
        quantity, 
        availableStock, 
        navigate, 
        location.pathname, 
        message,
        addToCart,
        product,
        cartItems
    ]);
    //#endregion Event Handlers


    //#region Utility Functions
    // 사이즈 옵션 상태 계산
    const getSizeOptionStatus = useCallback((size) => {
        const sizeItems = productItems.filter(item => item.size === size);
        const isAllColorsSoldOut = sizeItems.every(
            item => (item.stockQuantity - item.reservedQuantity) <= 0
        );
        return {
            label: `${size}${isAllColorsSoldOut ? ' (품절)' : ''}`,
            disabled: isAllColorsSoldOut
        };
    }, [productItems]);

    // 컬러 옵션 상태 계산
    const getColorOptionStatus = useCallback((color) => {
        const item = productItems.find(
            item => item.size === selectedSize && item.color === color
        );
        const isOutOfStock = !item || (item.stockQuantity - item.reservedQuantity) <= 0;
        return {
            label: `${color}${isOutOfStock ? ' (품절)' : ''}`,
            disabled: isOutOfStock
        };
    }, [productItems, selectedSize]);
    //#endregion Utility Functions

    
    //#region Effect Hooks
    // 상품 상세 정보 조회
    useEffect(() => {
        fetchProductData();
    }, [fetchProductData]);

    // 리뷰 조회
    useEffect(() => {
        if (product?.productId) {
            fetchReviews();
        }
    }, [fetchReviews, product?.productId]);
    //#endregion Effect Hooks
    

    //#region Render Functions
    if (notFound) {
        return (
            <ProductContainer>
                <Result
                    status="404"
                    title="상품을 찾을 수 없습니다"
                    subTitle="요청하신 상품이 존재하지 않거나 삭제되었을 수 있습니다."
                    extra={
                        <Button type="primary" onClick={() => navigate('/')}>
                            홈으로 돌아가기
                        </Button>
                    }
                />
            </ProductContainer>
        );
    }
    
    return (
        <ProductContainer>
            {loading ? (
                <LoadingContainer>
                    <Spin size="large" tip="로딩 중...">
                        <div style={{ minHeight: '200px' }} />
                    </Spin>
                </LoadingContainer>
            ) : (
                <>
                    <Row gutter={[32, 32]}>
                        <Col xs={24} md={12}>
                            <ProductImageWrapper>
                                {product && <ProductMasterCard product={product} />}
                            </ProductImageWrapper>
                        </Col>
                        <Col xs={24} md={12}>
                            <Title 
                                level={2} 
                                style={{ marginTop: 0 }}
                            >
                                {product.name}
                            </Title>
                            
                            <PriceInfo>
                                {product.discountRate > 0 && (
                                    <>
                                        <OriginalPrice $hasDiscount={true}>
                                            ￦{product.basePrice.toLocaleString()}
                                        </OriginalPrice>
                                        <DiscountRate color="blue">
                                            {product.discountRate}% OFF
                                        </DiscountRate>
                                    </>
                                )}
                                <FinalPrice level={3}>
                                    ￦{product.finalPrice.toLocaleString()}
                                </FinalPrice>
                            </PriceInfo>
                            
                            <Row align="middle" style={{ marginBottom: 8 }}>
                                <ResponsiveCol span={3} className="label-col">
                                    <Text strong>사이즈　:</Text>
                                </ResponsiveCol>
                                <ResponsiveCol span={21} className="input-col">
                                    <Select
                                        style={{ width: '100%' }}
                                        placeholder="사이즈 선택"
                                        onChange={setSelectedSize}
                                        value={selectedSize}
                                    >
                                        {sizeOptions.map(size => {
                                            const { label, disabled } = getSizeOptionStatus(size);
                                            
                                            return (
                                                <Option 
                                                    key={size} 
                                                    value={size} 
                                                    disabled={disabled}
                                                >
                                                    {label}
                                                </Option>
                                            );
                                        })}
                                    </Select>
                                </ResponsiveCol>
                            </Row>
                            
                            <Row align="middle" style={{ marginBottom: 8 }}>
                                <ResponsiveCol span={3} className="label-col">
                                    <Text strong>컬　러　:</Text>
                                </ResponsiveCol>
                                <ResponsiveCol span={21} className="input-col">
                                    <Select
                                        style={{ width: '100%' }}
                                        placeholder="컬러 선택"
                                        onChange={setSelectedColor}
                                        value={selectedColor}
                                        disabled={!selectedSize}
                                    >
                                        {colorOptions.map(color => {
                                            const { label, disabled } = getColorOptionStatus(color);
                                            
                                            return (
                                                <Option 
                                                    key={color} 
                                                    value={color} 
                                                    disabled={disabled}
                                                >
                                                    {label}
                                                </Option>
                                            );
                                        })}
                                    </Select>
                                </ResponsiveCol>
                            </Row>
                            
                            <Row align="middle" style={{ marginBottom: 8 }}>
                                <ResponsiveCol span={3} className="label-col">
                                    <Text strong>수　량　:</Text>
                                </ResponsiveCol>
                                <ResponsiveCol span={21} className="input-col">
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        min={1}
                                        value={quantity}
                                        onChange={setQuantity}
                                        disabled={!selectedItem}
                                        placeholder="수량 선택"
                                    />
                                </ResponsiveCol>
                            </Row>
                            
                            <Button
                                type="primary"
                                icon={<ShoppingCartOutlined />}
                                size="large"
                                block
                                onClick={handleCartButtonClick}
                                disabled={!selectedItem}
                            >
                                {isAuthenticated ? '장바구니 담기' : '로그인하고 장바구니 담기'}
                            </Button>
                            
                            <StyledDivider />
                            
                            <StyledDescriptions 
                                title="상품 정보" 
                                size="small" 
                                bordered
                            >
                                <Descriptions.Item label="사이즈" span={3}>
                                    {[...new Set(productItems.map(item => item.size))].sort().join(', ')}
                                </Descriptions.Item>
                                <Descriptions.Item label="색상" span={3}>
                                    {[...new Set(productItems.map(item => item.color))].sort().join(', ')}
                                </Descriptions.Item>
                                <Descriptions.Item label="설명" span={3}>
                                    {product.description}
                                </Descriptions.Item>
                            </StyledDescriptions>
                            
                            <StyledDivider />

                            <ReviewSection>
                                <Title level={5}>상품 리뷰</Title>
                                <Card 
                                    className="review-header-card"
                                    size="small" 
                                    loading={reviewLoading}
                                >
                                    <Space align="center" size={{ xs: 8, md: 16 }} wrap={false}>
                                        <Text strong style={{ whiteSpace: 'nowrap' }}>
                                            평균 평점:
                                        </Text>
                                        <Rate disabled value={averageRating || 0} />
                                        <Text strong style={{ whiteSpace: 'nowrap' }}>{(averageRating || 0).toFixed(1)} / 5.0</Text>
                                        <Divider type="vertical" />
                                        <Text type="secondary" style={{ whiteSpace: 'nowrap' }}>
                                            {totalReviews}개의 리뷰
                                        </Text>
                                    </Space>
                                </Card>
                                
                                <ReviewList
                                    loading={reviewLoading}
                                    dataSource={reviews}
                                    locale={{ emptyText: '등록된 리뷰가 없습니다.' }}
                                    pagination={{
                                        onChange: setReviewPage,
                                        pageSize: reviewPageSize,
                                        current: reviewPage,
                                        total: totalReviews,
                                        showSizeChanger: false
                                    }}
                                    renderItem={review => (
                                        <Card size="small">  
                                            <Card.Meta
                                                avatar={<Avatar size="small" icon={<UserOutlined />} />}
                                                title={
                                                    <>
                                                        <Text strong>{review.userName}</Text>
                                                        <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                                                            {review.updatedAt 
                                                                ? `${new Date(review.updatedAt).toLocaleDateString()} (수정)`
                                                                : new Date(review.createdAt).toLocaleDateString()
                                                            }
                                                        </Text>
                                                    </>
                                                }
                                                description={
                                                    <>
                                                        <div>
                                                            <Text style={{ fontSize: 12, fontWeight: 500 }}>
                                                                {review.productItemSize} / {review.productItemColor}
                                                            </Text>
                                                        </div>
                                                        <ReviewCardDiv>
                                                            <Rate 
                                                                disabled 
                                                                gap={4}
                                                                style={{ fontSize: 12 }}
                                                                value={Number(review.rating)} 
                                                            />
                                                        </ReviewCardDiv>
                                                        <div>
                                                            <Text style={{ fontSize: 12 }}>
                                                                {review.comment}
                                                            </Text>
                                                        </div>
                                                    </>
                                                }
                                            />
                                        </Card>
                                    )}
                                />
                            </ReviewSection>
                        </Col>
                    </Row>
                </>
            )}
        </ProductContainer>
    );
    //#endregion Render Functions
};

export default ProductDetail;