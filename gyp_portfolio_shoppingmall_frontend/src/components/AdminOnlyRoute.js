import { useContext, useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { App } from 'antd';

const AdminOnlyRoute = () => {
    const location = useLocation();

    const { message } = App.useApp();
    const { isAuthenticated, user, loading } = useContext(AuthContext);

    const [shouldRedirect, setShouldRedirect] = useState(null);
    
    // 로그인 상태 확인
    useEffect(() => {
        // 로딩 중이 아닌 경우
        if (!loading) {
            // 로그인하지 않은 경우
            if (!isAuthenticated) {
                message.info('관리자 로그인이 필요한 서비스입니다.');
                // 현재 페이지 정보를 state로 전달
                setShouldRedirect({
                    pathname: '/admin/login',
                    state: { 
                        from: location.pathname,
                        timestamp: Date.now()
                    }
                });
            // 관리자가 아닌 경우
            } else if (user?.isAdmin !== 1) {
                message.warning('접근 권한이 없는 페이지입니다.');
                setShouldRedirect({ pathname: '/' });
            }
        }
    }, [loading, isAuthenticated, user, message, location]);
    
    if (loading) return null;
    if (shouldRedirect) {
        return <Navigate 
            to={shouldRedirect.pathname} 
            state={shouldRedirect.state}
            replace 
        />;
    }

    return <Outlet />;
};

export default AdminOnlyRoute;
