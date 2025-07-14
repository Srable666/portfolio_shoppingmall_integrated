import { useContext, useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { App } from 'antd';

const GuestOnlyRoute = () => {
    const { message } = App.useApp();
    const { isAuthenticated, user, loading } = useContext(AuthContext);
    const [shouldRedirect, setShouldRedirect] = useState(null);
    
    useEffect(() => {
        if (!loading && isAuthenticated && !['/login', '/admin/login'].includes(window.location.pathname)) {
            if (user?.isAdmin === 1) {
                message.info('이미 관리자로 로그인되어 있습니다.');
                setShouldRedirect('/admin/dashboard');
            } else {
                message.info('이미 로그인되어 있습니다.');
                setShouldRedirect('/');
            }
        }
    }, [loading, isAuthenticated, user, message]);
    
    if (loading) return null;
    if (shouldRedirect) return <Navigate to={shouldRedirect} replace />;

    return <Outlet />;
};

export default GuestOnlyRoute;