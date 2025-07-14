const PRODUCT_ENDPOINTS = {
    SERVE_IMAGE: `/api/product/serve-image`,
    UPLOAD_IMAGE: `/api/product/uploadImage`,
};

export const DEFAULT_PRODUCT_IMAGE = '/api/product/serve-image/404.webp';

/**
 * 이미지 URL을 처리하여 실제 이미지 경로를 반환합니다.
 * @param {string} imageUrlStr - 원본 이미지 URL 또는 JSON 문자열
 * @param {boolean} [returnAll=false] - 모든 이미지 URL을 배열로 반환할지 여부
 * @returns {string|string[]|null} - 처리된 이미지 URL 또는 URL 배열
 */
export const getImageUrl = (imageUrlStr, returnAll = false) => {
    if (!imageUrlStr) return DEFAULT_PRODUCT_IMAGE;

    try {
        const imageData = JSON.parse(imageUrlStr);
        if (imageData.urls && Array.isArray(imageData.urls)) {
            const processUrl = (url) => {
                if (typeof url === 'string') {
                    const fileName = url.split('/').pop();
                    return `${PRODUCT_ENDPOINTS.SERVE_IMAGE}/${fileName}`;
                } else if (url && url.url) {
                    const fileName = url.url.split('/').pop();
                    return `${PRODUCT_ENDPOINTS.SERVE_IMAGE}/${fileName}`;
                }
                return DEFAULT_PRODUCT_IMAGE;
            };

            if (returnAll) {
                return imageData.urls.map(processUrl);
            }
            return processUrl(imageData.urls[0]);
        }
        return DEFAULT_PRODUCT_IMAGE;
    } catch (error) {
        if (imageUrlStr && typeof imageUrlStr === 'string') {
            const fileName = imageUrlStr.split('/').pop();
            return `${PRODUCT_ENDPOINTS.SERVE_IMAGE}/${fileName}`;
        }
        return DEFAULT_PRODUCT_IMAGE;
    }
};