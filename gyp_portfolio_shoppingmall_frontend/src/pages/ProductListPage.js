import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Row, Col, Spin, Empty, App, Pagination, Select } from 'antd';
import { AuthContext } from '../contexts/AuthContext';
import { RightOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import theme from '../styles/theme';

import styled from 'styled-components';
import ProductMasterCard from '../components/ProductMasterCard';

const { colorPrimary } = theme.token;


//#region Styled Components
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

// 상단 컨테이너
const TopContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;

    .left-section {
        flex: 1;
        min-width: 120px;
        display: flex;
        align-items: center;
        color: #666;
        font-size: 14px;

        .product-count {
            font-weight: 500;
            color: #1890ff;
            margin-right: 4px;
        }

        @media (max-width: 768px) {
            font-size: 13px;
        }
    }

    .center-section {
        flex: 2;
        text-align: center;
        font-weight: 500;
        font-size: 24px;
        color: #333;

        .category-path {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .parent-category {
            color: #666;
        }

        .arrow-icon {
            color: #999;
            font-size: 12px;
        }

        @media (max-width: 768px) {
            display: none;
        }
    }

    .right-section {
        flex: 1;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        min-width: 120px;
    }

    .ant-select {
        min-width: 120px;
    }
`;

// 상품 그리드
const ProductGrid = styled(Row)`
margin: 20px 0;
`;

// 페이지네이션 컨테이너
const PaginationContainer = styled.div`
    display: flex;
    justify-content: center;
    margin: 20px 0;
`;

// 검색 키워드
const SearchKeyword = styled.span`
color: ${colorPrimary};
font-weight: 500;
margin-right: 4px;
`;
//#endregion Styled Components


const ProductListPage = () => {

    
    //#region Hooks & States
    const pageSize = 12;
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const searchKeyword = searchParams.get('q');
    const categoryInfo = location.state?.categoryInfo;

    const { message } = App.useApp();
    const { authRequest } = useContext(AuthContext);

    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [allProducts, setAllProducts] = useState([]);
    const [sortType, setSortType] = useState('latest_desc');
    //#endregion Hooks & States


    //#region Constants
    // 정렬 옵션
    const SORT_OPTIONS = [
        { value: 'latest_desc', label: '신상품순' },
        { value: 'latest_asc', label: '오래된순' },
        { value: 'discount_desc', label: '할인율 높은순' },
        { value: 'discount_asc', label: '할인율 낮은순' },
        { value: 'price_desc', label: '가격 높은순' },
        { value: 'price_asc', label: '가격 낮은순' }
    ];
    //#endregion Constants


    //#region API Functions
    // 상품 목록 조회
    const fetchProducts = useCallback(async () => {
        setLoading(true);

        try {
            const params = {};
            if (categoryInfo) {
                params.categoryId = categoryInfo.categoryId;
            }
            if (searchKeyword) {
                params.keyword = searchKeyword;
            }

            const response = await authRequest('GET', '/product/getProductList', params);

            const productList = response.data;
            setAllProducts(productList);
            setProducts(productList.slice(0, pageSize));
        } catch (error) {
            console.error('카테고리 상품 목록 조회 에러:', error);
            
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '상품 목록 조회 중 오류가 발생했습니다.');
            }
            
            setAllProducts([]);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [authRequest, categoryInfo, pageSize, message, searchKeyword]);
    //#endregion API Functions

    
    //#region Event Handlers
    // 정렬 변경 핸들러
    const handleSortChange = (value) => {
        setSortType(value);
        setCurrentPage(1);
        const sortedProducts = sortProducts(allProducts, value);
        setAllProducts(sortedProducts);
        setProducts(sortedProducts.slice(0, pageSize));
    };

    // 페이지 변경 핸들러
    const handlePageChange = (page) => {
        setCurrentPage(page);
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        setProducts(allProducts.slice(start, end));

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };
    //#endregion Event Handlers
    
    
    //#region Utility Functions
    // 정렬 함수
    const sortProducts = (products, type) => {
        const sorted = [...products];
        const [criterion, order] = type.split('_');
        const isAsc = order === 'asc';

        switch (criterion) {
            case 'latest':
                return sorted.sort((a, b) => {
                    const comparison = new Date(b.createdAt) - new Date(a.createdAt);
                    return isAsc ? -comparison : comparison;
                });
            case 'discount':
                return sorted.sort((a, b) => {
                    const comparison = b.discountRate - a.discountRate;
                    return isAsc ? -comparison : comparison;
                });
            case 'price':
                return sorted.sort((a, b) => {
                    const comparison = b.finalPrice - a.finalPrice;
                    return isAsc ? -comparison : comparison;
                });
            default:
                return sorted;
        }
    };
    //#endregion Utility Functions


    //#region Effect Hooks
    // URL에서 상품 목록 가져오기
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);
    //#endregion Effect Hooks
    

    //#region Render Functions
    // 헤더 렌더링
    const renderHeader = () => {
        if (searchKeyword) {
            return (
                <div className="center-section">
                    <div className="search-result">
                        <SearchKeyword>'{searchKeyword}'</SearchKeyword>
                        <span className="text">검색 결과</span>
                    </div>
                </div>
            );
        }

        return (
            <div className="center-section">
                <div className="category-path">
                    {categoryInfo?.categoryPath?.map((cat, index) => (
                        <React.Fragment key={cat.categoryId}>
                            {index < categoryInfo.categoryPath.length - 1 && (
                                <>
                                    <span className="parent-category">{cat.name}</span>
                                    <RightOutlined className="arrow-icon" />
                                </>
                            )}
                        </React.Fragment>
                    ))}
                    <span>{categoryInfo?.name || '전체 상품'}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="product-list-page">
            {loading ? (
                <LoadingContainer>
                    <Spin size="large" tip="로딩 중...">
                        <div style={{ minHeight: '200px' }} />
                    </Spin>
                </LoadingContainer>
            ) : allProducts.length > 0 ? (
                <>
                    <TopContainer>
                        <div className="left-section">
                            <span className="product-count">{allProducts.length}</span>
                            <span>개의 상품</span>
                        </div>
                        {renderHeader()}
                        <div className="right-section">
                            <Select
                                value={sortType}
                                onChange={handleSortChange}
                                options={SORT_OPTIONS}
                                placeholder="정렬 기준 선택"
                                size='small'
                            />
                        </div>
                    </TopContainer>
                    <ProductGrid 
                        gutter={[16, 16]} 
                        role="list" 
                        aria-label={`${categoryInfo?.name || '카테고리'} 상품 목록`}
                    >
                        {products.map((product) => (
                            <Col key={product.productId} xs={12} sm={8} md={6} lg={6}>
                                <ProductMasterCard product={product} />
                            </Col>
                        ))}
                    </ProductGrid>
                    <PaginationContainer>
                        <Pagination
                            current={currentPage}
                            total={allProducts.length}
                            pageSize={pageSize}
                            onChange={handlePageChange}
                            showSizeChanger={false}
                        />
                    </PaginationContainer>
                </>
            ) : (
                <Empty 
                    description={
                        searchKeyword 
                            ? `'${searchKeyword}' 검색 결과가 없습니다.`
                            : "상품이 없습니다."
                    }
                    style={{ margin: '40px 0' }}
                />
            )}
        </div>
    );
    //#endregion Render Functions
};

export default ProductListPage;