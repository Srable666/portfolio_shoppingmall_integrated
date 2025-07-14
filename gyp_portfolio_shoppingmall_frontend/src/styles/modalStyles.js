import { css } from 'styled-components';

// 모달 기본 스타일
export const modalCommonStyle = css`
    &.ant-modal {
        top: 50% !important;
        padding-bottom: 0px !important;
        transform: translateY(-50%) !important;
    }

    .ant-modal-header {
        margin-bottom: 0px !important;
    }

    .ant-modal-title {
        text-align: center;
        margin-bottom: 5px !important;
    }
`;

// 모달 크기별 스타일
export const modalSizeStyle = (width) => css`
    width: ${width}px !important;
    
    @media (max-width: ${width + 48}px) {
        width: calc(100vw - 48px) !important;
        margin: 0 24px;
    }
`;