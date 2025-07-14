import styled from 'styled-components';
import { Button } from 'antd';

// 반응형 미디어 쿼리 브레이크포인트
const MOBILE_BREAKPOINT = '(max-width: 768px)';

// 공통 버튼 스타일
export const StyledButton = styled(Button).attrs(props => ({
    size: window.matchMedia(MOBILE_BREAKPOINT).matches ? "small" : "middle"
}))`
    font-size: ${props => window.matchMedia(MOBILE_BREAKPOINT).matches ? '12px' : '14px'};
`;