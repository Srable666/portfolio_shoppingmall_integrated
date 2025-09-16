import { useNavigate } from 'react-router-dom';
import { Result, Button } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

const OrderCompletePage = () => {
    const navigate = useNavigate();

    const handleGoToOrders = () => {
        navigate('/mypage/orderinfo');
    };

    const handleGoToHome = () => {
        navigate('/');
    };

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
        }}>
            <Result
                icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                title="주문이 완료되었습니다!"
                subTitle="결제가 성공적으로 처리되었습니다. 주문 내역은 마이페이지에서 확인하실 수 있습니다."
                extra={[
                    <Button type="primary" key="orders" onClick={handleGoToOrders}>
                        주문 내역 보기
                    </Button>,
                    <Button key="home" onClick={handleGoToHome}>
                        홈으로 가기
                    </Button>,
                ]}
            />
        </div>
    );
};

export default OrderCompletePage;