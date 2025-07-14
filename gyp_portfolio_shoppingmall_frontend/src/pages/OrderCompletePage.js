import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { App } from 'antd';

const OrderCompletePage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { message } = App.useApp();

    useEffect(() => {
        const imp_success = searchParams.get('imp_success');
        const error_msg = searchParams.get('error_msg');

        if (imp_success === 'true') {
            message.success('주문이 완료되었습니다.');
            navigate('/mypage/orders');
        } else {
            console.log('결제 취소: ', error_msg);
            message.error('결제가 취소되었습니다.');
            navigate('/order');
        }
    }, [navigate, searchParams, message]);

    return null;
};

export default OrderCompletePage;