import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Row, Col, Typography, Spin, App } from 'antd';
import { AuthContext } from '../contexts/AuthContext';

import styled from 'styled-components';
import ProductMasterCard from '../components/ProductMasterCard';

const { Title } = Typography;


//#region Styled Components
// 포트폴리오 배너 컨테이너
const PortfolioBannerContainer = styled.div`
    width: 100%;
    margin-bottom: 30px;
    position: relative;
    background: linear-gradient(135deg, #1a202c 0%, #2d3748 50%, #4a5568 100%);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    box-sizing: border-box;

    @media (max-width: 768px) {
        margin: 10px;
        margin-left: 10px;
        margin-right: 10px;
        width: calc(100% - 20px);
        border-radius: 6px;
    }
`;

// 배너 내용
const BannerContent = styled.div`
    padding: 30px;
    text-align: center;
    color: white;
    
    @media (max-width: 768px) {
        padding: 25px 20px;
    }

    .banner-title {
        font-size: 28px;
        font-weight: bold;
        margin-bottom: 12px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        
        @media (max-width: 768px) {
            font-size: 18px;
            margin-bottom: 8px;
        }
    }

    .banner-subtitle {
        font-size: 16px;
        opacity: 0.95;
        margin-bottom: 8px;
        
        @media (max-width: 768px) {
            font-size: 11px;
            margin-bottom: 6px;
        }
    }

    .banner-description {
        font-size: 14px;
        opacity: 0.8;
        
        @media (max-width: 768px) {
            font-size: 10px;
        }
    }

    .demo-badge {
        display: inline-block;
        background: rgba(255, 255, 255, 0.9);
        color: #2c3e50;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 14px;
        margin-top: 15px;
        font-weight: 600;
        
        @media (max-width: 768px) {
            font-size: 10px;
            padding: 4px 10px;
        }
    }

    .contact-info {
        margin: 20px 0 8px 0;
        
        .contact-email {
            font-size: 14px;
            opacity: 0.9;
            background: rgba(255, 255, 255, 0.1);
            padding: 4px 8px;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            
            @media (max-width: 768px) {
                font-size: 12px;
                padding: 3px 6px;
            }
        }
    }
`;

// 섹션 타이틀
const SectionTitle = styled(Title)`
    margin-top: 40px !important;
    margin-bottom: 20px !important;
    font-size: 20px !important;

    @media (max-width: 768px) {
        font-size: 18px !important;
    }
`;

// 로딩 컨테이너
const LoadingContainer = styled.div`
    text-align: center;
    padding: 40px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 4px;

    .ant-spin-text {
        margin-top: 8px;
        color: #666;
    }
`;

// 상품 그리드
const ProductGrid = styled(Row)`
    margin: 20px 0 40px;
`;
//#endregion Styled Components


const HomePage = () => {
    const { message } = App.useApp();
    const { authRequest } = useContext(AuthContext);

    const [loading, setLoading] = useState(true);
    const [newProducts, setNewProducts] = useState([]);
    const [popularProducts, setPopularProducts] = useState([]);

    // 상품 목록 조회(신상품, 인기상품)
    const fetchFeaturedProducts = useCallback(async () => {
        try {
            setLoading(true);

            const [newProductsResponse, popularProductsResponse] = await Promise.all([
                authRequest('GET', '/product/getNewProducts'),
                authRequest('GET', '/product/getPopularProducts')
            ]);

            setNewProducts(newProductsResponse.data);
            setPopularProducts(popularProductsResponse.data);
        } catch (error) {
            console.error('상품 목록 조회 에러:', error);            
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response?.data || '예기치 못한 오류로 상품 목록 조회에 실패했습니다.');
            }

            setNewProducts([]);
            setPopularProducts([]);
        } finally {
            setLoading(false);
        }
    }, [authRequest, message]);

    // 상품 목록 조회
    useEffect(() => {
        fetchFeaturedProducts();
    }, [fetchFeaturedProducts]);
    
    return (
        <div className="home-page">
            <PortfolioBannerContainer>
                <BannerContent>
                    <div className="banner-title">🎯 PORTFOLIO DEMO SITE</div>
                    <div className="banner-subtitle">개발 포트폴리오 목적으로 제작된 쇼핑몰 데모입니다</div>
                    <div className="banner-description">This is a portfolio demo shopping mall for development showcase</div>
                    <div className="demo-badge">실제 결제/배송 불가 • 상품 이미지: 무신사 제공</div>
                    <div className="contact-info">
                        <span className="contact-email">📧 contact: srable6666@gmail.com</span>
                    </div>
                </BannerContent>
            </PortfolioBannerContainer>

            <div>
                <SectionTitle level={3}>새로운 상품</SectionTitle>
                {loading ? (
                    <LoadingContainer>
                        <Spin size="large" tip="로딩 중...">
                            <div style={{ minHeight: '200px' }} />
                        </Spin>
                    </LoadingContainer>
                ) : (
                    <ProductGrid 
                        gutter={[16, 16]} 
                        role="list" 
                        aria-label="새로운 상품 목록"
                    >
                        {newProducts.map((product) => (
                            <Col key={product.productId} xs={12} sm={8} md={6} lg={6}>
                                <ProductMasterCard product={product} />
                            </Col>
                        ))}
                    </ProductGrid>
                )}

                <SectionTitle level={3}>인기 상품</SectionTitle>
                {loading ? (
                    <LoadingContainer>
                        <Spin size="large" tip="로딩 중...">
                            <div style={{ minHeight: '200px' }} />
                        </Spin>
                    </LoadingContainer>
                ) : (
                    <ProductGrid 
                        gutter={[16, 16]} 
                        role="list" 
                        aria-label="인기 상품 목록"
                    >
                        {popularProducts.map((product) => (
                            <Col key={product.productId} xs={12} sm={8} md={6} lg={6}>
                                <ProductMasterCard product={product} />
                            </Col>
                        ))}
                    </ProductGrid>
                )}
            </div>
        </div>        
    );
};

export default HomePage;
