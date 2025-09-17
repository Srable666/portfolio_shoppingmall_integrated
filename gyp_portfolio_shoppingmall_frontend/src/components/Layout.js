import React, { useCallback, useContext, useEffect, useState, memo } from 'react';
import { Button, Input, Layout, Menu, Tooltip, Spin, App, Dropdown } from 'antd';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useResponsive } from '../contexts/ResponsiveContext';
import { AuthContext } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import styled, { css } from 'styled-components';
import theme from '../styles/theme';
import {
    HomeOutlined,
    RightOutlined,
    SearchOutlined,
    CloseOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    LogoutOutlined,
    ShoppingOutlined,
    DashboardOutlined
} from '@ant-design/icons';

const { colorPrimary, colorLinkHover, colorBgBase } = theme.token;
const { Content, Footer } = Layout;
const { Search } = Input;


//#region Styled Components
// 레이아웃 스타일
const StyledLayout = styled(Layout)`
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

// 헤더 컨테이너
const HeaderContainer = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
`;

// 상단 헤더
const TopHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    height: 64px;
    background-color: ${colorPrimary};
    color: white;
    position: relative;
    overflow: hidden;

    @media (max-width: 768px) {
        padding: 0 10px;
    }
`;

// 로고 컨테이너
const LogoContainer = styled.div`
    color: white;
    font-size: 22px;
    font-weight: bold;
    white-space: nowrap;
    margin-right: 20px;

    @media (max-width: 768px) {
        font-size: 18px;
}`;

const LogoButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    color: white;
    font-size: 22px;
    font-weight: bold;
    padding: 0;
`;

// 오른쪽 섹션
const RightSection = styled.div`
    display: flex;
    align-items: center;    
    gap: 10px;  
`;

// 데스크탑 검색 컨테이너
const DesktopSearchContainer = styled.div`
    display: none;
    margin-right: 0 !important;

    @media (min-width: 769px) {
        display: flex;
        align-items: center;
        overflow: hidden;
        transition: width 0.3s ease;
        width: ${props => props.$visible ? '300px' : '40px'};
        margin-right: ${props => props.$visible ? '10px' : '10px'};
    }
`;

// 검색 아이콘 버튼
const SearchIconButton = styled(Button)`
    color: white !important;
    font-size: 18px;
    margin-right: 0 !important;
    padding: 0;
    min-width: 40px;
    border-radius: 5px !important;

    &:hover {
        background-color: ${colorLinkHover} !important;
        color: #cccccc !important;
    }

    .anticon-close {
        font-size: 16px !important;
    }
`;

// 검색 입력 컨테이너
const SearchInputContainer = styled.div`
    flex: 1;
    margin-right: 10px;
    opacity: ${props => props.$visible ? '1' : '0'};
    transition: opacity 0.3s ease;
    pointer-events: ${props => props.$visible ? 'auto' : 'none'};
`;

// 모바일 검색 컨테이너
const MobileSearchContainer = styled.div`
    display: none;

    @media (max-width: 768px) {
        display: ${props => props.$visible ? 'flex' : 'none'};
        align-items: center;
        padding: 10px;
        background-color: #222;
        width: 100%;
        overflow: hidden;
        max-height: ${props => props.$visible ? '60px' : '0'};
        opacity: ${props => props.$visible ? '1' : '0'};
        transition: all 0.3s ease-in-out;

        .ant-input-search {
            opacity: ${props => props.$visible ? '1' : '0'};
            transform: ${props => props.$visible ? 'translateY(0)' : 'translateY(-20px)'};
            transition: all 0.3s ease-in-out;
            transition-delay: ${props => props.$visible ? '0.05s' : '0s'};
        }

        button {
            opacity: ${props => props.$visible ? '1' : '0'};
            transform: ${props => props.$visible ? 'translateY(0)' : 'translateY(-20px)'};
            transition: all 0.3s ease-in-out;
            transition-delay: ${props => props.$visible ? '0.1s' : '0s'};
        }
    }

    @keyframes slideDown {
        from {
            max-height: 0;
            opacity: 0;
        }
        to {
            max-height: 60px;
            opacity: 1;
        }
    }
`;

// 하단 헤더
const BottomHeader = styled.div`
    background-color: ${colorLinkHover};
    height: 48px;
    display: flex;
    align-items: center;
    padding: 0 20px;
    flex-direction: column;

    @media (max-width: 768px) {
        padding: 0 10px;
        overflow-x: auto;
    }
`;

// 카테고리 네비게이션
const CategoryNavigation = styled.div`
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    overflow-x: auto;
    gap: 5px;

    &::-webkit-scrollbar {
        display: none;
    }
    -ms-overflow-style: none;
    scrollbar-width: none;
`;

// 카테고리 아이템 공통 스타일
const CategoryItemStyle = css`
    display: flex;
    align-items: center;
    height: 48px;
    padding: 0 15px;
    color: white;
    background-color: #333333;
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    box-shadow: none;
    border-radius: 5px;

    &:hover {
        background-color:rgb(222, 222, 222) !important;
        color:rgb(0, 0, 0);
        border-radius: 5px !important;
    }

    ${props => props.$isActive && css`
        background-color: white;
        color: #333333;
        font-weight: bold;
    `}
`;

// 카테고리 홈 버튼
const CategoryHomeButton = styled(Button)`
    ${CategoryItemStyle}
    justify-content: center;
    margin-right: 5px;

    .anticon {
        font-size: 18px;
    }

    ${props => props.$isHome && css`
        background-color: white;
        color: #333333;
        font-weight: bold;
    `}
`;

// 로딩 컨테이너
const LoadingContainer = styled.div`
    display: flex;
    align-items: center;
    margin-left: 10px;
`;

// 로딩 텍스트
const LoadingText = styled.span`
    color: white;
    margin-left: 8px;
`;

// 활성화된 카테고리
const ActiveCategory = styled.div`
    ${CategoryItemStyle}
    
    ${props => props.$isActive && css`
        background-color: white;
        color: #333333;
        font-weight: bold;
        border-radius: 5px !important; // 라운딩 추가
    `}
`;

// 메뉴 스타일
const StyledMenu = styled(Menu)`
    background-color: transparent !important;
    border-bottom: none !important;
    color: white;
    flex: 1;
    display: flex;

    .ant-menu-item {
        ${CategoryItemStyle}
        padding: 0 15px;

        &:hover {
            background-color:rgb(222, 222, 222) !important;
            color:rgb(0, 0, 0) !important;
        }

        &.ant-menu-item-selected {
            background-color: white !important;
            color: #333333 !important;
            font-weight: bold;
            border-radius: 5px !important;

            &::after {
                display: none !important;
            }
        }
    }
    
    .ant-menu-overflow-item-rest {
        .anticon svg {
            filter: invert(1) brightness(100%);
        }
    }

    @media (max-width: 768px) {
        overflow-x: auto;
        flex-wrap: nowrap;

        &::-webkit-scrollbar {
            display: none;
        }
    }
`;

// 공통 버튼 스타일
const HeaderButtonStyle = css`
    &:hover {
        background-color: ${colorLinkHover} !important;
        color: #f0f0f0 !important;
    }

    @media (max-width: 768px) {
        .text {
            display: none;
        }
        .icon {
            font-size: 20px;
        }
    }
`;

// 장바구니 링크
const CartLink = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    text-decoration: none;
    font-size: 14px;
    padding: 0 5px;
    border-radius: 5px;
    ${HeaderButtonStyle}

    .text {
        margin-left: 5px;
    }

    .cart-count {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 18px;
        margin-left: 4px;
        background: #ff4d4f;
        padding: 2px 6px;
        border-radius: 10px;
        font-size: 12px;
    }
`;

// 마이페이지 링크
const MyPageLink = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    text-decoration: none;
    font-size: 14px;
    padding: 0 5px;
    border-radius: 5px;
    gap: 5px;
    ${HeaderButtonStyle}
`;

// 관리자 버튼
const AdminButton = styled(Button)`
    color: white !important;
    font-size: 14px;
    padding: 0 5px;
    border-radius: 5px;
    ${HeaderButtonStyle}
`;

// 로그아웃 버튼
const LogoutButton = styled.button`
    display: flex;
    justify-content: center;
    align-items: center;
    background: none;
    border: none;
    color: white;
    font-size: 14px;
    cursor: pointer;
    padding: 0 5px;
    border-radius: 5px;
    gap: 5px;
    ${HeaderButtonStyle}
`;

// 버튼 스타일
const StyledButton = styled(Button)`
    &.ant-btn-primary {
        background-color: ${colorPrimary} !important;
        border-color: ${colorPrimary} !important;

        &:hover, &:focus {
            background-color: ${colorLinkHover} !important;
            border-color: ${colorLinkHover} !important;
            transform: translateY(-2px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            transition: all 0.3s ease;
        }
    }

    &.ant-btn-default {
        color: ${colorPrimary} !important;
        background-color: ${colorBgBase} !important;
        border: 1px solid ${colorPrimary} !important;

        &:hover, &:focus {
            color: ${colorPrimary} !important;
            border-color: ${colorLinkHover} !important;
            background-color: #f0f0f0 !important;
            transform: translateY(-2px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
        }
    }
`;

// 메인 컨텐츠
const MainContent = styled(Content)`
    margin-top: ${props => props.$isMobileSearchVisible ? '173px' : '113px'};
    padding: 15px 15px 0px 15px;
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow-y: auto;
    transition: margin-top 0.3s ease;

    @media (min-width: 769px) {
        margin-top: 113px;
    }

    > div {
        background: #fff;
        padding: 24px;
        flex: 1;

        @media (max-width: 768px) {
            padding: 12px;
        }
    }

    footer {
        text-align: center;
        padding: 12px 25px;

        @media (max-width: 768px) {
            margin-bottom: 60px;
        }
    }
`;

// > 분리기
const ArrowDivider = styled.div`
    color: white;
    margin: 0;
    font-size: 16px;
`;
//#endregion Styled Components


const AppLayout = () => {

    
    //#region Hooks & States
    const navigate = useNavigate();
    const location = useLocation(); 

    const { message } = App.useApp();
    const { isMobile } = useResponsive();
    const { getTotalItemCount } = useCart();
    const { authRequest } = useContext(AuthContext);
    const { isAuthenticated, user, logout } = useContext(AuthContext);

    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [categoryPath, setCategoryPath] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [searchVisible, setSearchVisible] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [allCategoriesFlat, setAllCategoriesFlat] = useState([]);
    //#endregion Hooks & States

    
    //#region API Functions    
    // 전체 카테고리 조회 및 트리 구조 변환
    const fetchAllCategories = useCallback(async () => {
        try {
            setLoading(true);
            const response = await authRequest('get', '/product/getAllCategories');
            const flatCategories = response.data;
            
            const categoryMap = {};
            const tree = [];
            
            flatCategories.forEach(category => {
                categoryMap[category.categoryId] = { ...category, children: [] };
            });
            
            flatCategories.forEach(category => {
                if (category.parentCategoryId) {
                    const parent = categoryMap[category.parentCategoryId];
                    if (parent) {
                        parent.children.push(categoryMap[category.categoryId]);
                    }
                } else {
                    tree.push(categoryMap[category.categoryId]);
                }
            });
            
            const topCategories = tree.filter(cat => !cat.parentCategoryId);
            
            setCategories(topCategories);
            setAllCategoriesFlat(flatCategories);
            
            return { tree, flat: flatCategories };
        } catch (error) {
            console.error('전체 카테고리 조회 에러:', error);
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '카테고리 정보를 불러오는데 실패했습니다.');
            }
        } finally {
            setLoading(false);
        }
    }, [authRequest, message]);
    //#endregion API Functions
    
    
    //#region Utility Functions
    // 카테고리 ID로 전체 경로 찾기
    const findCategoryPath = useCallback((categoryId) => {
        const path = [];
    
        for (let currentId = categoryId; currentId; ) {
            const category = allCategoriesFlat.find(cat => cat.categoryId === currentId);
            if (category) {
                path.unshift(category);
                currentId = category.parentCategoryId;
            } else {
                break;
            }
        }
        
        return path;
    }, [allCategoriesFlat]);

    // 특정 카테고리의 직계 하위 카테고리들 찾기
    const findSubCategories = useCallback((categoryId) => {
        return allCategoriesFlat.filter(cat => cat.parentCategoryId === categoryId);
    }, [allCategoriesFlat]);

    // 카테고리 정보 업데이트 함수
    const updateCategoryInfo = useCallback((categoryInfo) => {
        if (!categoryInfo || !allCategoriesFlat.length) return;
        
        // 전체 경로
        const fullPath = findCategoryPath(categoryInfo.categoryId);
    
        // 선택된 카테고리의 하위 카테고리들 확인
        const childCategories = findSubCategories(categoryInfo.categoryId);
        
        let categoriesToShow;
        if (childCategories.length > 0) {
            // 하위가 있는 경우: 하위 카테고리들 표시 (케이스 2, 3)
            categoriesToShow = childCategories;
        } else {
            // 최하위 카테고리인 경우: 형제들 표시 (케이스 4)
            categoriesToShow = findSubCategories(categoryInfo.parentCategoryId);
        }
        
        setCurrentCategory(categoryInfo);
        setCategoryPath(fullPath);
        setSubCategories(categoriesToShow);
    }, [allCategoriesFlat, findCategoryPath, findSubCategories]);
    //#endregion Utility Functions


    //#region Event Handlers
    // 홈 이동
    const goToHome = useCallback(() => {
        setSearchValue('');
        setCategoryPath([]);
        setSubCategories([]);
        setCurrentCategory(null);
        navigate('/', { 
            state: { 
                categoryInfo: null 
            }
        });
    }, [navigate]);

    // 카테고리 클릭 이벤트 처리
    const handleCategoryClick = useCallback((category) => {
        if (!allCategoriesFlat.length) return;
        
        setSearchValue('');
        
        // 카테고리 경로 찾기
        const fullPath = findCategoryPath(category.categoryId);
        
        // 선택된 카테고리의 하위 카테고리들 확인
        const childCategories = findSubCategories(category.categoryId);
        
        let subCategoriesToShow;
        if (childCategories.length > 0) {
            // 하위가 있는 경우: 하위 카테고리들 표시 (케이스 2, 3)
            subCategoriesToShow = childCategories;
        } else {
            // 최하위 카테고리인 경우: 형제들 표시 (케이스 4)
            subCategoriesToShow = findSubCategories(category.parentCategoryId);
        }
        
        // 상태 업데이트 (API 호출 없음)
        setCurrentCategory(category);
        setCategoryPath(fullPath);
        setSubCategories(subCategoriesToShow);
        
        // 페이지 이동
        navigate(`/${category.code}`, {
            state: {
                categoryInfo: {
                    ...category,
                    categoryPath: fullPath
                }
            }
        });
    }, [allCategoriesFlat, findCategoryPath, findSubCategories, navigate]);

    // 카테고리 경로 클릭 이벤트 처리
    const handlePathClick = useCallback((index) => {
        const newPath = categoryPath.slice(0, index + 1);
        const selectedCategory = newPath[newPath.length - 1];
        
        // 선택된 카테고리의 하위 카테고리들 확인
        const childCategories = findSubCategories(selectedCategory.categoryId);
        
        let categoriesToShow;
        if (childCategories.length > 0) {
            // 하위가 있는 경우: 하위 카테고리들 표시
            categoriesToShow = childCategories;
        } else {
            // 최하위 카테고리인 경우: 형제들 표시
            categoriesToShow = findSubCategories(selectedCategory.parentCategoryId);
        }
        
        setCategoryPath(newPath);
        setCurrentCategory(selectedCategory);
        setSubCategories(categoriesToShow);
        
        // 페이지 이동
        navigate(`/${selectedCategory.code}`, {
            state: {
                categoryInfo: {
                    ...selectedCategory,
                    categoryPath: newPath
                }
            }
        });
    }, [categoryPath, findSubCategories, navigate]);

    // 검색 이벤트 처리
    const handleSearch = (value) => {
        const searchValue = (value ?? '').trim();
        if (!searchValue) {
            message.warning('검색어를 입력 후 검색해주세요.');
            return;
        }
        setCurrentCategory(null);
        setCategoryPath([]);
        setSubCategories([]);

        navigate(`/products?q=${encodeURIComponent(value)}`);
    };

    // 로그아웃 처리
    const handleLogout = async () => {
        const response = await logout();
        
        if (response?.data) {
            message.success(response.data);
        } else {
            message.success('로그아웃되었습니다.');
        }

        navigate(location.pathname + location.search, { 
            replace: true,
            state: location.state
        });
    };

    // 장바구니 클릭 이벤트 처리
    const handleCartClick = () => {
        navigate('/cart', { 
            state: { 
                refresh: true,
                timestamp: Date.now()
            } 
        });
    };

    // 회원정보 클릭 이벤트 처리
    const handleUserInfoClick = () => {
        navigate('/mypage/userinfo', { 
            state: { 
                refresh: true,
                timestamp: Date.now()
            } 
        })
    };

    // 주문내역 클릭 이벤트 처리
    const handleOrdersClick = () => {
        navigate('/mypage/orderinfo', { 
            state: { 
                refresh: true,
                timestamp: Date.now()
            } 
        })
    };

    // 드롭다운 메뉴 토글 이벤트 처리
    const handleDropdownVisibleChange = (flag) => {
        if (isMobile) {
            setDropdownVisible(flag);
        } else {
            if (!flag || !dropdownVisible) {
                setDropdownVisible(flag);
            }
        }
    };

    // 검색 토글
    const toggleSearch = () => {
        setSearchVisible(!searchVisible);
        if (!searchVisible) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => {
                if (isMobile) {
                    document.getElementById('mobile-search').focus();
                } else {
                    document.getElementById('desktop-search').focus();
                }
            }, 400);
        }
    };
    //#endregion Event Handlers
    

    //#region Effect Hooks    
    // 최상위 카테고리 목록 조회
    useEffect(() => {    
        fetchAllCategories();
    }, [fetchAllCategories]);

    // 카테고리 정보 업데이트
    useEffect(() => {
        const categoryInfo = location.state?.categoryInfo;
        if (categoryInfo) {
            updateCategoryInfo(categoryInfo);
        }
    }, [location.state?.categoryInfo, updateCategoryInfo]);

    // 홈페이지에서 카테고리 초기화
    useEffect(() => {
        if (location.pathname === '/') {
            setCurrentCategory(null);
            setCategoryPath([]);
            setSubCategories([]);
        }
    }, [location.pathname]);

    // ProductDetail에서 발생하는 카테고리 정보 업데이트 이벤트 처리
    useEffect(() => {
        const handleCategoryUpdate = (event) => {
            const { categoryInfo } = event.detail;
            if (categoryInfo) {
                updateCategoryInfo(categoryInfo);
            }
        };

        window.addEventListener('categoryInfoUpdate', handleCategoryUpdate);
        return () => window.removeEventListener('categoryInfoUpdate', handleCategoryUpdate);
    }, [updateCategoryInfo]);

    // 검색 닫기
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && searchVisible) {
                setSearchVisible(false);
            }
        };

        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [searchVisible]);
    //#endregion Effect Hooks


    //#region Memoized Components
    // 마이페이지 메뉴 아이템
    const myPageMenuItems = {
        items: [
            {
                key: 'userinfo',
                label: '회원정보 관리',
                icon: <UserOutlined />,
                onClick: handleUserInfoClick
            },
            {
                key: 'orders',
                label: '주문내역',
                icon: <ShoppingOutlined />,
                onClick: handleOrdersClick
            }
        ]
    };

    // 1단계: 카테고리 부모 루트 표시
    const CategoryPathDisplay = memo(({ categoryPath, handlePathClick }) => {
        if (categoryPath.length <= 1) return null; // 최상위나 홈이면 표시 안함
        
        // 선택된 카테고리 제외한 부모들만
        const parentPath = categoryPath.slice(0, -1);
        
        return (
            <>
                {parentPath.map((cat, index) => (
                    <React.Fragment key={cat.categoryId}>
                        {index > 0 && (
                            <ArrowDivider>
                                <RightOutlined />
                            </ArrowDivider>
                        )}
                        <ActiveCategory
                            onClick={() => handlePathClick(index)}
                            tabIndex={0}
                            aria-label={`${cat.name} 카테고리`}
                            onKeyDown={(e) => e.key === 'Enter' && handlePathClick(index)}
                            $isActive={false}
                        >
                            {cat.name}
                        </ActiveCategory>
                    </React.Fragment>
                ))}
                <ArrowDivider>
                    <RightOutlined />
                </ArrowDivider>
            </>
        )
    });

    // 2단계: 선택된 카테고리 표시
    const CategorySelectedDisplay = memo(({ currentCategory, subCategories }) => {
        if (!currentCategory) return null;
        
        // 최하위 카테고리인지 확인 (하위가 없으면 최하위)
        const childCategories = findSubCategories(currentCategory.categoryId);
        const isLowestLevel = childCategories.length === 0;
        
        // 최하위 카테고리는 표시하지 않음 (3단계 메뉴에서 하이라이트로 표시)
        if (isLowestLevel) return null;
        
        return (
            <>
                <ActiveCategory $isActive={true}>
                    {currentCategory.name}
                </ActiveCategory>
                <ArrowDivider>
                    <RightOutlined />
                </ArrowDivider>
            </>
        );
    });
    
    // 3단계: 카테고리 메뉴 표시 (하위 또는 형제)
    const CategoryMenuDisplay = memo(({
        currentCategory,
        categories,
        subCategories,
        handleCategoryClick
    }) => {
        let categoriesToShow = [];
        let showSelectedInMenu = false;
        
        if (!currentCategory) {
            // 홈: 최상위 카테고리들
            categoriesToShow = categories;
        } else {
            // 하위 카테고리들 확인
            const childCategories = findSubCategories(currentCategory.categoryId);
            
            if (childCategories.length > 0) {
                // 중간 단계: 하위 카테고리들만 표시
                categoriesToShow = childCategories;
            } else {
                // 최하위: 형제 카테고리들 표시 (선택된 것 포함)
                categoriesToShow = subCategories;
                showSelectedInMenu = true;
            }
        }

        const menuItems = categoriesToShow.map(category => ({
            key: category.categoryId,
            label: 
                <Link 
                    to={`/${category.code}`}
                    state={{ 
                        categoryInfo: {
                            ...category,
                            categoryPath: findCategoryPath(category.categoryId)
                        }
                    }}
                    onClick={(e) => {
                        e.preventDefault(); 
                        handleCategoryClick(category);
                    }}
                >
                    {category.name}
                </Link>,
        }));
    
        return (
            <StyledMenu
                mode="horizontal"
                theme="dark"
                selectedKeys={showSelectedInMenu && currentCategory ? [currentCategory.categoryId.toString()] : []}
                items={menuItems}
            />
        )
    });
    //#endregion Memoized Components


    //#region Render
    return (
        <StyledLayout>
            <HeaderContainer>
                <TopHeader role="banner">
                    <LogoContainer>
                        <LogoButton 
                            onClick={goToHome}
                            aria-label="홈으로 이동"
                        >
                            ShoppingMall
                        </LogoButton>
                    </LogoContainer>
                    
                    <RightSection>
                        {/* 데스크탑 검색 버튼 & 창 */}
                        <DesktopSearchContainer $visible={searchVisible}>                                
                            <SearchIconButton 
                                type="text"
                                icon={searchVisible ? <CloseOutlined /> : <SearchOutlined />}
                                onClick={toggleSearch} 
                                aria-label={searchVisible ? '검색 닫기' : '검색'}
                            />
                                <SearchInputContainer $visible={searchVisible}>
                                <Input
                                    id="desktop-search"
                                    placeholder="검색어를 입력하세요"
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    onPressEnter={() => handleSearch(searchValue)}
                                    style={{ width: '100%' }}
                                    size="small"
                                    aria-label="상품 검색"
                                    suffix={
                                        <Tooltip 
                                            title={!searchValue.trim() ? "⚠️검색어를 입력 후 검색해주세요." : ""}
                                            trigger="click"
                                            open={!searchValue.trim() ? undefined : false}
                                            color="#ff4d4f"
                                        >
                                            <SearchOutlined 
                                                onClick={() => handleSearch(searchValue)}
                                                style={{ cursor: 'pointer', color: 'rgba(0,0,0,0.45)' }}
                                            />
                                        </Tooltip>
                                    }
                                />
                            </SearchInputContainer>
                        </DesktopSearchContainer>

                        {/* 모바일 검색 버튼 */}
                        {isMobile && (
                            <SearchIconButton
                                type="text"
                                icon={<SearchOutlined />}
                                onClick={toggleSearch}
                                aria-label="검색"
                                style={{ marginRight: '10px' }}
                            />
                        )}
                        
                        {/* 로그인 상태에 따른 메뉴 아이템 */}
                        {isAuthenticated ? (
                            user?.isAdmin === 1 ? (
                                <>
                                    <AdminButton 
                                        type="text"
                                        onClick={() => navigate('/admin/dashboard')}
                                    >
                                        <span className="icon"><DashboardOutlined /></span>
                                        <span className="text">대시보드</span>
                                    </AdminButton>
                                    <LogoutButton onClick={handleLogout}>
                                        <span className="icon"><LogoutOutlined /></span>
                                        <span className="text">로그아웃</span>
                                    </LogoutButton>
                                </>
                            ) : (
                                <>
                                    <CartLink onClick={handleCartClick}>
                                        <span className="icon"><ShoppingCartOutlined /></span>
                                        <span className="text">장바구니</span>
                                        <span className="cart-count">{getTotalItemCount()}</span>
                                    </CartLink>
                                    <Dropdown
                                        menu={myPageMenuItems}
                                        placement="bottomRight"
                                        arrow
                                        trigger={isMobile ? ['click'] : ['hover', 'click']}
                                        open={dropdownVisible}
                                        onOpenChange={handleDropdownVisibleChange}
                                    >
                                        <MyPageLink onClick={() => isMobile ? setDropdownVisible(!dropdownVisible) : setDropdownVisible(true)}>
                                            <span className="icon"><UserOutlined /></span>
                                            <span className="text">마이페이지</span>
                                        </MyPageLink>
                                    </Dropdown>
                                    <LogoutButton onClick={handleLogout}>
                                        <span className="icon"><LogoutOutlined /></span>
                                        <span className="text">로그아웃</span>
                                    </LogoutButton>
                                </>
                            )
                        ) : (
                            <>
                                <StyledButton 
                                    type="primary" 
                                    onClick={() => navigate('/login', { 
                                        state: { 
                                            from: location.pathname,
                                            categoryInfo: currentCategory ? {
                                                ...currentCategory, categoryPath
                                            } : null,
                                            timestamp: Date.now() 
                                        }
                                    })}
                                    aria-label="로그인"
                                    size={isMobile ? 'small' : 'middle'}
                                >
                                    로그인
                                </StyledButton>
                                <StyledButton 
                                    onClick={() => navigate('/register')}
                                    aria-label="회원가입"
                                    size={isMobile ? "small" : "middle"}
                                >
                                    회원가입
                                </StyledButton>
                            </>
                        )}
                    </RightSection>
                </TopHeader>

                {/* 모바일 검색 창 */}
                <MobileSearchContainer $visible={searchVisible && isMobile}>
                    <Search
                        id="mobile-search"
                        placeholder="검색어를 입력하세요"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onSearch={handleSearch}
                        size="middle"
                        style={{ width: '100%' }}
                        aria-label="상품 검색"
                        enterButton="검색"
                    />
                </MobileSearchContainer>

                {/* 하단 헤더 */}
                <BottomHeader>
                    <CategoryNavigation 
                        role="navigation"
                        aria-label="카테고리 네비게이션"
                    >
                        <Tooltip title="홈으로 이동" placement="bottom">
                            <CategoryHomeButton 
                                onClick={(e) => {
                                    e.preventDefault();
                                    goToHome();
                                }}
                                aria-label="홈으로 이동"
                                onKeyDown={(e) => e.key === 'Enter' && goToHome()}
                                $isHome={location.pathname === '/'}
                            >
                                <HomeOutlined style={{ fontSize: '20px' }} />
                            </CategoryHomeButton>
                        </Tooltip>

                        {loading ? (
                            <LoadingContainer
                                aria-live="polite"
                                aria-busy="true"
                            >
                                <Spin size="small" />
                                <LoadingText>
                                    로딩 중...
                                </LoadingText>
                            </LoadingContainer>
                        ) : (
                            <>
                                <CategoryPathDisplay
                                    categoryPath={categoryPath}
                                    handlePathClick={handlePathClick}
                                />
                                
                                <CategorySelectedDisplay
                                    currentCategory={currentCategory}
                                    subCategories={subCategories}
                                />
                                
                                <CategoryMenuDisplay
                                    currentCategory={currentCategory}
                                    categories={categories}
                                    subCategories={subCategories}
                                    handleCategoryClick={handleCategoryClick}
                                />
                            </>
                        )}
                    </CategoryNavigation>
                </BottomHeader>
            </HeaderContainer>

            <MainContent role="main" $isMobileSearchVisible={searchVisible && isMobile}>
                {/* 컨텐츠 영역 */}
                <div>
                    <Outlet />
                </div>

                {/* 푸터 */}
                <Footer role="contentinfo" style={{ textAlign: 'center', padding: '12px 25px' }}>
                    GYP Portfolio ShoppingMall &copy; {new Date().getFullYear()}
                </Footer>
            </MainContent>
        </StyledLayout>
    )
    //#endregion Render
};

export default AppLayout;
