import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { App, Spin } from 'antd';
import { useCart } from '../contexts/CartContext';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const OrderProcessPage = () => {
    const navigate = useNavigate();
    const hasProcessed = useRef(false);

    const { clearCart } = useCart();
    const { message } = App.useApp();
    const { authRequest } = useContext(AuthContext);

    const [searchParams] = useSearchParams();
    const [statusMessage, setStatusMessage] = useState('결제 검증 중입니다...');

    // 한 번 실행
    useEffect(() => {
        if (hasProcessed.current) return;
        hasProcessed.current = true;
        processPayment();
    }, []);

    const processPayment = async () => {
        const imp_uid_url = searchParams.get('imp_uid');
        const merchant_uid_url = searchParams.get('merchant_uid');
        const stored = localStorage.getItem('pendingMobilePayment');
        const mobilePaymentData = stored ? JSON.parse(stored) : null;
        const { paymentInfo, orderData, merchantUid } = mobilePaymentData;
        
        if (!mobilePaymentData) {
            message.error('잘못된 접근입니다.');
            navigate('/order');
            return;
        }
        if (!imp_uid_url) {
            console.log('imp_uid 없음');
            message.error('결제에 문제가 발생했습니다.');
            navigate('/order');
            return;
        }
        if (merchant_uid_url !== merchantUid) {
            console.log('merchant_uid 불일치');
            console.log('URL:', merchant_uid_url);
            console.log('저장된 값:', merchantUid);
            message.error('결제 정보가 일치하지 않습니다.');
            navigate('/order');
            return;
        }

        try {
            // 1단계: 결제 검증 및 이력 저장
            setStatusMessage('결제 검증 중입니다...');
            await authRequest('post', '/payment/verify/' + imp_uid_url);

            // 2단계: 주문 생성
            setStatusMessage('주문 생성 중입니다...');
            await authRequest('post', '/order/insertOrder', {
                merchantUid: merchantUid,
                orderProductDTOList: orderData.products.map(item => ({
                    productItemId: item.productItemId,
                    originalQuantity: item.quantity,
                    price: item.price,
                    discountRate: item.discountRate,
                    finalPrice: item.finalPrice,
                    size: item.size,
                    color: item.color
                })),
                deliveryFee: orderData.shippingFee,
                paymentMethod: paymentInfo.paymentMethod,
                recipientName: paymentInfo.buyerName,
                recipientPhone: paymentInfo.buyerTel,
                recipientPostcode: paymentInfo.buyerPostcode,
                recipientAddress: paymentInfo.buyerAddr,
                deliveryRequest: paymentInfo.deliveryRequest
            });

            // 3단계: 처리 완료
            setStatusMessage('주문 완료 처리 중입니다...');
            
            // 주문정보 초기화
            localStorage.removeItem('pendingMobilePayment');
            
            // 장바구니 초기화
            clearCart();

            // 성공 시 완료 페이지로 리다이렉트
            setTimeout(() => {
                navigate('/order/complete');
            }, 1000);

        } catch (error) {
            console.error('결제 처리 중 오류:', error);
            
            // 주문정보 초기화
            localStorage.removeItem('pendingMobilePayment');
            
            // 오류 메시지 표시
            let errorMessage = '결제 처리 중 오류가 발생했습니다.';
            if (error.response?.data) {
                errorMessage = error.response.data;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            message.error(errorMessage);
            
            // 주문 페이지로 리다이렉트
            setTimeout(() => {
                navigate('/order');
            }, 2000);
        }
    };

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            flexDirection: 'column',
            gap: '24px',
            backgroundColor: '#f5f5f5'
        }}>
            <Spin size="large" />
            <div style={{ 
                fontSize: '18px', 
                fontWeight: 'bold',
                color: '#1890ff'
            }}>
                {statusMessage}
            </div>
            <div style={{ 
                fontSize: '14px', 
                color: '#666',
                textAlign: 'center',
                maxWidth: '300px'
            }}>
                잠시만 기다려주세요.<br />
                결제 처리가 완료되는 중입니다.
            </div>
        </div>
    );
};

export default OrderProcessPage;