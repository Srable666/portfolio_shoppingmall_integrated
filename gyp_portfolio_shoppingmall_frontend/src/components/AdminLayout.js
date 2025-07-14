import React, { useState, useContext } from 'react';
import { Layout, Menu, Button, theme, App, Drawer } from 'antd';
import { useResponsive } from '../contexts/ResponsiveContext';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import styled from 'styled-components';
import {
    DashboardOutlined,
    ShopOutlined,
    ShoppingOutlined,
    UserOutlined,
    CommentOutlined,
    CreditCardOutlined,
    LogoutOutlined,
    MenuOutlined,
    CloseOutlined,
} from '@ant-design/icons';

const { Header, Content, Footer, Sider } = Layout;


//#region Styled Components
// 데스크톱 레이아웃
const DesktopLayout = styled(Layout)`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
`;

// 사이드바
const StyledSider = styled(Sider)`
    overflow: auto;
    height: 100%;
`;

// 로고
const Logo = styled.div`
    height: 32px;
    margin: 16px;
    color: white;
    font-size: 18px;
    font-weight: bold;
    text-align: center;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
`;

// 헤더
const StyledHeader = styled(Header)`
    padding: 0;
    height: 48px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
`;

// 헤더 왼쪽 영역
const HeaderLeft = styled.div`
    width: 130px;
`;

// 헤더 타이틀
const HeaderTitle = styled.div`
    font-weight: bold;
    font-size: 18px;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
`;

// 로그아웃 버튼
const LogoutButton = styled(Button)`
    margin-right: 20px;
    justify-content: flex-end;
`;

// 컨텐츠 영역
const StyledContent = styled(Content)`
    position: relative;
    height: calc(100vh - 48px - 48px);
    overflow: hidden;
    padding: 24px;
    margin: 16px;
`;

// 컨텐츠 스크롤 영역
const ContentScrollArea = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: auto;
    padding: 16px;
`;

// 푸터
const StyledFooter = styled(Footer)`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
    height: 48;
`;

// 모바일 레이아웃
const MobileLayout = styled(Layout)`
    min-height: 100vh;
`;

// 모바일 헤더
const MobileHeader = styled(Header)`
    padding: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 48px;
    line-height: 48px;
    position: relative;
`;

// 모바일 메뉴 버튼
const MenuButton = styled(Button)`
    width: 80px;
`;

// 모바일 헤더 타이틀
const MobileHeaderTitle = styled.div`
    font-weight: bold;
    font-size: 18px;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
`;

// 모바일 로그아웃 버튼
const MobileLogoutButton = styled(Button)`
    width: 80px;
    justify-content: flex-end;
`;

// 모바일 컨텐츠
const MobileContent = styled(Content)`
    margin: 0;
    padding: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
`;

// 모바일 컨텐츠 스크롤 영역
const MobileContentScrollArea = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: auto;
`;

// 모바일 푸터
const MobileFooter = styled(Footer)`
    text-align: center;
    padding: 8px 16px;
    height: 36px;
    line-height: 20px;
`;

// 드로어 헤더
const DrawerHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px 8px 24px;
    border-bottom: 1px solid rgba(35, 24, 24, 0.1);
`;

// 드로어 로고
const DrawerLogo = styled.div`
    color: white;
    font-size: 16px;
    font-weight: bold;
    padding: 0 16px;
    overflow: hidden;
`;

// 드로어 버튼
const DrawerButton = styled(Button)`
    color: rgba(255, 255, 255, 0.65);
`;
//#endregion Styled Components


// 관리자 레이아웃 컴포넌트
const AdminLayout = () => {


    //#region Hooks & States
    const location = useLocation();

    const { message } = App.useApp();
    const { isMobile } = useResponsive();
    const { loading, logout } = useContext(AuthContext);

    const [collapsed, setCollapsed] = useState(isMobile);
    const [drawerVisible, setDrawerVisible] = useState(false);    
    //#endregion Hooks & States


    //#region Theme Token
    // 테마 토큰 설정
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    //#endregion Theme Token


    //#region API Functions
    // 로그아웃 처리
    const handleLogout = async () => {
        const response = await logout();
    
        if (response?.data) {
            message.success(response.data);
        } else {
            message.success('로그아웃되었습니다.');
        }
    };
    //#endregion API Functions


    //#region Menu Items Definition
    const openKeys = ['products'];
    const selectedKeys = location.pathname.split('/')[2] || 'dashboard';

    // 메뉴 아이템 정의
    const menuItems = [
        {
            key: 'dashboard',
            icon: <DashboardOutlined />,
            label: <Link to="/admin/dashboard" style={{ color: 'inherit' }}>대시보드</Link>,
        },
        {
            key: 'products',
            icon: <ShopOutlined />,
            label: <Link to="/admin/products" style={{ color: 'inherit' }}>상품 관리</Link>,
        },
        {
            key: 'orders',
            icon: <ShoppingOutlined />,
            label: <Link to="/admin/orders" style={{ color: 'inherit' }}>주문 관리</Link>,
        },
        {
            key: 'users',
            icon: <UserOutlined />,
            label: <Link to="/admin/users" style={{ color: 'inherit' }}>회원 관리</Link>,
        },
        {
            key: 'reviews',
            icon: <CommentOutlined />,
            label: <Link to="/admin/reviews" style={{ color: 'inherit' }}>리뷰 관리</Link>,
        },
        {
            key: 'payments',
            icon: <CreditCardOutlined />,
            label: <Link to="/admin/payments" style={{ color: 'inherit' }}>결제 관리</Link>,
        },
    ];
    //#endregion Menu Items Definition


    //#region Render Functions
    // 로딩 중인 경우 렌더링 하지 않음
    if (loading) {
        return null;
    }

    // 로그인 페이지인 경우 렌더링
    if (location.pathname === '/admin/login') {
        return <Outlet />;
    }

    // 메뉴 렌더링
    const renderMenu = () => (
        <Menu
            theme="dark"
            defaultSelectedKeys={['dashboard']}
            defaultOpenKeys={!isMobile ? openKeys : []}
            mode="inline"
            items={menuItems}
            selectedKeys={[selectedKeys]}
            onClick={isMobile ? () => setDrawerVisible(false) : undefined}
        />
    );
    
    // 데스크탑 렌더링
    if (!isMobile) {
        return (
            <DesktopLayout>
                <StyledSider
                    collapsible 
                    collapsed={collapsed} 
                    onCollapse={(value) => setCollapsed(value)}
                    width={150}
                    collapsedWidth={60}
                >
                    <Logo style={{ margin: 8 }}>
                        메뉴
                    </Logo>
                    {renderMenu()}
                </StyledSider>
                <Layout>
                    <StyledHeader style={{ background: colorBgContainer }}>
                        <HeaderLeft></HeaderLeft>
                        <HeaderTitle>
                            관리자 페이지
                        </HeaderTitle>
                        <LogoutButton
                            icon={<LogoutOutlined />}
                            onClick={handleLogout}
                            type="text"
                        >
                            로그아웃
                        </LogoutButton>
                    </StyledHeader>
                    <StyledContent style={{ background: colorBgContainer }}>
                        <ContentScrollArea>
                            <Outlet />
                        </ContentScrollArea>
                    </StyledContent>

                    <StyledFooter>
                        GYP Portfolio Shoppingmall Admin Page
                    </StyledFooter>
                </Layout>
            </DesktopLayout>
        );
    }

    // 모바일 렌더링
    return (
        <MobileLayout>
            <MobileHeader style={{ background: colorBgContainer }}>
                <MenuButton
                    icon={<MenuOutlined />}
                    onClick={() => setDrawerVisible(true)}
                    type="text"
                >
                    메뉴
                </MenuButton>
                <MobileHeaderTitle>
                    관리자 페이지
                </MobileHeaderTitle>
                <MobileLogoutButton
                    icon={<LogoutOutlined />}
                    onClick={handleLogout}
                    type="text"
                >
                    로그아웃
                </MobileLogoutButton>
            </MobileHeader>
            <MobileContent>
                <MobileContentScrollArea
                    style={{ background: colorBgContainer }}
                    borderRadius={borderRadiusLG}
                    $isMobile={isMobile}
                >
                    <Outlet />
                </MobileContentScrollArea>
            </MobileContent>
            <MobileFooter>
                GYP Portfolio Shoppingmall Admin Page
            </MobileFooter>

            <Drawer
                title={null}
                placement="left"
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
                closable={false}
                width={150}
                styles={{
                    body: {
                        padding: 0,
                        backgroundColor: '#001529',
                    }
                }}
            >
                <DrawerHeader>
                    <DrawerLogo>
                        메뉴
                    </DrawerLogo>
                    <DrawerButton
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={() => setDrawerVisible(false)}
                    />
                </DrawerHeader>
                {renderMenu()}
            </Drawer>
        </MobileLayout>
    );
    //#endregion Render Functions
};

export default AdminLayout;
