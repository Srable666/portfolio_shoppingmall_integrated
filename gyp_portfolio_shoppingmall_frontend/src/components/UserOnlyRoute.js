import { useContext, useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { App } from 'antd';

const UserOnlyRoute = () => {
    const { message } = App.useApp();
    const { isAuthenticated, user, loading } = useContext(AuthContext);
    const [shouldRedirect, setShouldRedirect] = useState(null);
    
    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                message.info('로그인이 필요한 서비스입니다.');
                setShouldRedirect('/login');
            } else if (user?.isAdmin === 1) {
                message.info('관리자는 일반 회원 서비스에 접근할 수 없습니다.');
                setShouldRedirect('/admin/dashboard');
            }
        }
    }, [loading, isAuthenticated, user, message]);
    
    if (loading) return null;
    if (shouldRedirect) return <Navigate to={shouldRedirect} replace />;

    return <Outlet />;
};

export default UserOnlyRoute;