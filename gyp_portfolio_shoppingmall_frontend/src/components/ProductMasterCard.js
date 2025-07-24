import { getImageUrl, DEFAULT_PRODUCT_IMAGE } from '../utils/imageUtils';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import React, { useState, useContext, useRef } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Card, App, Carousel } from 'antd';
import styled from 'styled-components';

const { Meta } = Card;


//#region Styled Components
// 상품 카드
const ProductCard = styled(Card)`
    .ant-card-cover {
        position: relative;
    }

    .ant-card-body {
        padding: 12px 8px;
    }

    .ant-card-meta-title {
        font-size: 14px;
        margin-bottom: 8px !important;
        white-space: normal;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        line-height: 1.3;
    }

    .ant-card-meta-description {
        line-height: 1.4;
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 4px;

        .original-price {
            color: #757575;
            text-decoration: line-through;
            font-size: 14px;
        }

        .discount-rate {
            color: #f15746;
            font-weight: 600;
            font-size: 15px;
        }

        .final-price {
            color: #000000;
            font-weight: 600;
            font-size: 16px;
        }
            
        @media (max-width: 480px) {
            gap: 2px;

            .original-price {
                font-size: 13px;
            }

            .discount-rate {
                font-size: 14px;
            }

            .final-price {
                font-size: 15px;
            }
        }
    }
`;

// 이미지 캐러셀 컨테이너
const CarouselContainer = styled.div`
    position: relative;
    width: 100%;
    padding-top: 120%;

    .ant-carousel {
        position: absolute !important;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    .slick-slider, .slick-list, .slick-track {
        height: 100%;
    }

    .slick-slide > div {
        height: 100%;
    }
`;

// 상품 이미지
const ProductImage = styled.div`
    position: relative;
    width: 100%;
    height: 100%;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    &::after {
        content: ${props => props.$isDefault ? 'none' : '"DEMO"'};
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-30deg);
        font-size: 2rem;
        font-weight: bold;
        color: rgba(255, 255, 255, 0.6);
        background: rgba(0, 0, 0, 0.2);
        padding: 5px 20px;
        border-radius: 4px;
        pointer-events: none;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }
`;

// 이미지 네비게이션 버튼
const NavigationButton = styled.button`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.2);
    border: none;
    width: 30px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 2;

    .anticon {
        font-size: 16px;
        color: #fff;
    }

    &:hover {
        background: rgba(0, 0, 0, 0.4);
    }

    &.prev {
        left: 0;
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
    }

    &.next {
        right: 0;
        border-top-left-radius: 4px;
        border-bottom-left-radius: 4px;
    }

    @media (max-width: 768px) {
        width: 20px;
        height: 30px;

        .anticon {
            font-size: 12px;
        }
    }
`;
//#endregion Styled Components


const ProductMasterCard = ({ product }) => {
    const navigate = useNavigate();
    const carouselRef = useRef(null);
    const { message } = App.useApp();
    const { authRequest } = useContext(AuthContext);
    const [isPaused, setIsPaused] = useState(false);

    // 이미지 URL 처리
    const urls = getImageUrl(product.imageUrl, true);

    // 이미지 URL 배열 처리
    const imageUrls = Array.isArray(urls) && urls.length > 0 
        ? urls 
        : [DEFAULT_PRODUCT_IMAGE];

    // 가격 정보 포맷팅
    const formatPriceInfo = (product) => {
        if (!product.finalPrice) return '가격 정보 없음';
    
        const hasDiscount = product.discountRate && product.discountRate > 0;
        
        // 할인 상품인 경우
        if (hasDiscount) {
            return (
                <>
                    <span className="original-price">{product.basePrice.toLocaleString()}원</span>
                    <span className="discount-rate">{product.discountRate}%</span>
                    <span className="final-price">{product.finalPrice.toLocaleString()}원</span>
                </>
            );
        }
    
        // 할인 상품이 아닌 경우
        return <span className="final-price">{product.finalPrice.toLocaleString()}원</span>;
    };

    // 상품 클릭 시 카테고리 경로 조회 및 페이지 이동
    const handleClick = async (e) => {
        e.preventDefault();
        try {
            // 상품의 카테고리 경로 조회
            const categoryPathResponse = await authRequest('get', `/product/getCategoryPath/${product.categoryId}`);
            if (categoryPathResponse.data) {
                const categoryInfo = {
                    ...categoryPathResponse.data[categoryPathResponse.data.length - 1],
                    categoryPath: categoryPathResponse.data
                };
                
                // 카테고리 정보와 함께 페이지 이동
                navigate(`/${categoryInfo.code}/${product.code}`, {
                    state: { 
                        categoryInfo,
                        product
                    }
                });
            }
        } catch (error) {
            console.error('카테고리 경로 조회 실패:', error);
            message.error('페이지 이동 중 오류가 발생했습니다.');
            navigate(-1); 
        }
    };

    return (
        <Link to="#" onClick={handleClick}>
            <ProductCard
                hoverable
                cover={
                    <CarouselContainer
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                    >
                        <Carousel
                            ref={carouselRef}
                            autoplay={!isPaused}
                            effect="slide"
                            dots={false}
                            autoplaySpeed={5000}
                        >
                            {imageUrls.map((url, index) => (
                                <ProductImage 
                                    key={index} 
                                    $isDefault={url === DEFAULT_PRODUCT_IMAGE}
                                >
                                    <img
                                        alt={`${product.name} - 이미지 ${index + 1}`}
                                        src={url}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = DEFAULT_PRODUCT_IMAGE;
                                        }}
                                    />
                                </ProductImage>
                            ))}
                        </Carousel>
                        {imageUrls.length > 1 && (
                            <>
                                <NavigationButton
                                    className="prev"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        carouselRef.current?.prev();
                                        setIsPaused(true);
                                    }}
                                    aria-label="이전 이미지"
                                >
                                    <LeftOutlined />
                                </NavigationButton>
                                <NavigationButton
                                    className="next"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        carouselRef.current?.next();
                                        setIsPaused(true);  
                                    }}
                                    aria-label="다음 이미지"
                                >
                                    <RightOutlined />
                                </NavigationButton>
                            </>
                        )}
                    </CarouselContainer>
                }
            >
                <Meta 
                    title={product.name}
                    description={formatPriceInfo(product)}
                />
            </ProductCard>
        </Link>
    );
};

export default ProductMasterCard;