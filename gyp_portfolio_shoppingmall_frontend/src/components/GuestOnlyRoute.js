import { useContext, useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { App } from 'antd';

const GuestOnlyRoute = () => {
    const { message } = App.useApp();
    const { isAuthenticated, user, loading } = useContext(AuthContext);
    const [shouldRedirect, setShouldRedirect] = useState(null);
    const location = useLocation();
    
    useEffect(() => {
        if (!loading && isAuthenticated) {
            // 로그인 페이지에서는 아무것도 하지 않음
            if (location.pathname === '/login') {
                return;
            }
            
            // 다른 페이지에서는 메시지와 함께 리다이렉트
            if (user?.isAdmin === 1) {
                message.info('이미 관리자로 로그인되어 있습니다.');
                setShouldRedirect('/admin/dashboard');
            } else {
                message.info('이미 로그인되어 있습니다.');
                setShouldRedirect('/');
            }
        }
    }, [loading, isAuthenticated, user, message, location.pathname]);
    
    if (loading) return null;
    if (shouldRedirect) return <Navigate to={shouldRedirect} replace />;

    return <Outlet />;
};

export default GuestOnlyRoute;