import React, { useCallback, useContext, useEffect, useState } from 'react';
import { modalCommonStyle, modalSizeStyle } from '../styles/modalStyles';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { StyledButton } from '../styles/ButtonStyles';
import { getImageUrl } from '../utils/imageUtils';
import styled from 'styled-components';
import { 
    AppstoreOutlined, 
    CloseOutlined, 
    InboxOutlined, 
    PlusOutlined, 
    SearchOutlined, 
    EditOutlined, 
    DeleteOutlined
} from '@ant-design/icons';
import { 
    App, Button, Cascader, Form, Image, 
    Input, Modal, Popconfirm, Popover, Select, 
    Space, Spin, Table, Tag, Tooltip, Upload, Tree 
} from 'antd';

//#region Styled Components
// 컨테이너 스타일
const Container = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
`;

// 헤더 영역 스타일
const HeaderSection = styled.div`
    margin-bottom: 8px;
`;

// 헤더 컨텐츠 스타일
const HeaderContent = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

// 헤더 타이틀 스타일
const HeaderTitle = styled.h1`
    flex: 1;
    margin: 0;
    font-size: clamp(16px, 3vw, 20px);
    text-align: center;
    font-weight: bold;
`;

// 검색 섹션 스타일
const SearchSection = styled.div`
    margin-top: 8px;
`;

// 검색 랩퍼 스타일
const SearchWrapper = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
`;

// 테이블 컨테이너 스타일
const ContentContainer = styled.div`
    flex: 1;
    overflow: auto;

    .ant-space-gap-col-small {
        column-gap: 4px;
    }
`;

// 팝오버 컨텐츠 스타일
const PopoverContent = styled.div`
    max-width: 400px;
    max-height: 200px;
    overflow: auto;
    white-space: pre-wrap;
    padding: 8px;
`;

// 액션 버튼 스타일
const ActionButton = styled(Button)`
    font-size: clamp(11px, 1.8vw, 12px);
    height: 24px;
    padding: 0 6px;
    min-width: 48px;

    @media (max-width: 768px) {
        height: 22px;
        min-width: 40px;
    }
`;

// 카테고리 관리 모달 스타일
const CategoryManageModal = styled(Modal)`
    ${modalSizeStyle(500)}
    
    .ant-modal {
        top: 100px !important;
        padding-bottom: 0;
    }

    .ant-modal-header {
        margin-bottom: 0px !important;
    }

    .ant-modal-title {
        text-align: center;
        margin-bottom: 10px !important;
    }
        
    .ant-modal-content {
        max-height: calc(100vh - 200px);
        display: flex;
        flex-direction: column;
    }

    .ant-modal-body {
        padding: 0;
        max-height: calc(100vh - 150px);
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }
        
    .category-tree .ant-tree-treenode {
        padding: 0;
        cursor: pointer;
        width: 100%;
    }
    .category-tree .ant-tree-node-content-wrapper {
        flex: 1;
        min-width: 0;
    }
    .category-tree .ant-tree-switcher {
        background-color: #f9f9f9;
        border-radius: 4px;
        margin-right: 8px;
        flex-shrink: 0;
    }
    .category-tree .ant-tree-node-content-wrapper > div {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 100%;
    }
    .category-tree .ant-tree-list {
        width: 100%;
    }
`;

// 카테고리 관리 모달 헤더
const CategoryModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: ${props => props.$isMobile ? '40px' : '48px'};
    background-color: #fff;
    padding: 16px 0px 0px 0px;

    > div:first-child {
        flex: 0.3 !important;
    }
    > h2 {
        flex: 0.4 !important;
        text-align: center;
    }
    > div:last-child {
        flex: 0.3 !important;
        display: flex;
        justify-content: flex-end;

        @media (min-width: 769px) {
            ${StyledButton} {
                height: 24px;
                padding: 0 8px;
                min-width: 50px;
            }
        }
    }
`;

// 카테고리 관리 모달 타이틀 스타일
const CategoryModalTitle = styled.h2`
    flex: 1;
    margin: 0;
    font-size: clamp(16px, 3vw, 20px);
    text-align: center;
    font-weight: bold;
`;

// 카테고리 트리 컨테이너 스타일
const CategoryTreeContainer = styled.div`
    flex: 1;
    overflow: auto;
    overflow-x: hidden;
    padding: 0 0 16px 0;
    background-color: #ffffff;
    margin: 0 auto;
    width: 100%;
    max-width: 500px;
`;

// 카테고리 관리 모달 경고 스타일
const CategoryFormWarning = styled.div`
    font-size: 11px;
    color: #ff4d4f;
    margin-top: 4px;
    line-height: 1.2;
`;

// 카테고리 수정/추가 모달 스타일
const CategoryFormModal = styled(Modal)`
    ${modalSizeStyle(400)}
    
    .ant-modal {
        top: 100px !important;
        padding-bottom: 0;
    }

    .ant-modal-header {
        margin-bottom: 0px !important;
    }

    .ant-modal-title {
        text-align: center;
        margin-bottom: 5px !important;
    }

    .ant-modal-header {
        font-size: 18px;
        font-weight: bold;
        text-align: center;
    }
    .ant-modal-body {
        max-height: calc(100vh - 120px);
        overflow: auto;
        padding: 0;
    }

    .ant-form-item {
        margin-bottom: 12px !important;
    }

    .ant-form-item-label {
        padding-bottom: 0 !important;
    }
`;

// 상품 수정/추가 모달 스타일
const ProductManageModal = styled(Modal)`
    ${modalSizeStyle(400)}
    ${modalCommonStyle}

    .ant-modal {
        top: 20px !important;
        padding-bottom: 0;
    }

    .ant-modal-header {
        text-align: center;
    }

    .ant-modal-body {
        max-height: calc(100vh - 150px);
        overflow: auto;
    }

    .ant-col.ant-form-item-label {
        padding: 0 0 2px 0 !important;
    }

    .ant-form-item:last-child {
        margin-bottom: 0;
    }
        
    input[type="number"]::-webkit-outer-spin-button,
    input[type="number"]::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    input[type="number"] {
        -moz-appearance: textfield;
    }

    .ant-upload-drag {
        .ant-upload-text {
            margin: 8px 0;
        }
        .ant-upload-hint {
            font-size: 12px;
        }
    }

    .ant-input-number-group-addon {
        padding: 0 8px;
    }
`;

// 상품 품목 관리 모달 스타일
const ProductItemModal = styled(Modal)`
    ${modalSizeStyle(800)}
    ${modalCommonStyle}

    .ant-modal-body {
        padding: 0;
        max-height: calc(100vh - 150px);
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }
`;

// 상품 품목 관리 모달 헤더 컨테이너
const ProductItemHeaderContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 32px;
    background-color: #fff;
    padding: 0;

    > div:first-child {
        flex: 0.8;
        text-align: left;
    }
    > div:last-child {
        flex: 0.25;
        display: flex;
        justify-content: flex-end;

        @media (min-width: 769px) {
            ${StyledButton} {
                height: 24px;
                padding: 0 8px;
                min-width: 50px;
            }
        }
    }
`;

// 상품 품목 ID/이름 표시 영역
const ProductItemTitle = styled.div`
    font-weight: bold;
`;

// 상품 품목 테이블 컨테이너
const ProductItemTableContainer = styled.div`
    flex: 1;
    overflow: auto;

    .ant-table {
        width: 100%;
    }
`;

// 품목 수정/추가 모달 스타일
const ProductItemFormModal = styled(Modal)`
    ${modalSizeStyle(300)}
    ${modalCommonStyle}

    .ant-modal {
        top: 20px !important;
        padding-bottom: 0;
    }

    .ant-modal-header {
        text-align: center;
    }

    .ant-modal-body {
        max-height: calc(100vh - 120px);
        overflow: auto;
    }

    .ant-form-item {
        margin-bottom: 12px !important;
    }

    .ant-form-item-label {
        padding-bottom: 0 !important;
    }

    .ant-form-item:last-child {
        margin-bottom: 0;
    }
`;

// 재고 관리 모달 스타일
const InventoryManageModal = styled(Modal)`
    ${modalSizeStyle(800)}
    ${modalCommonStyle}

    .ant-modal-body {
        padding: 0;
        max-height: calc(100vh - 120px);
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }
`;

// 재고 관리 모달 헤더 컨테이너
const InventoryManageHeader = styled.div`
    padding: ${props => props.$isMobile ? '10px 0 0 0' : '10px 0'};
    border-bottom: 1px solid #f0f0f0;
    background-color: #fff;
`;

// 재고 관리 모달 헤더 콘텐츠
const InventoryManageHeaderContent = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: ${props => props.$isMobile ? '4px' : '8px'};

    @media (max-width: 768px) {
        margin-top: 4px;
    }
`;

// 재고 관리 모달 타이틀
const InventoryManageTitle = styled.div`
    font-size: clamp(12px, 2.5vw, 16px);
    font-weight: bold;
    overflow: hidden;
`;

// 재고 관리 모달 테이블 컨테이너
const InventoryManageTableContainer = styled.div`
    flex: 1;
    overflow: auto;
`;

// 입고 처리 모달
const InventoryAddModal = styled(Modal)`
    ${modalSizeStyle(300)}
    ${modalCommonStyle}

    .ant-modal-body {
        max-height: calc(100vh - 120px);
        overflow: auto;
    }

    .ant-form-item {
        margin-bottom: 12px !important;
    }

    .ant-form-item-label {
        padding-bottom: 0 !important;
    }
`;

// 입고 처리 TextArea
const InventoryAddTextArea = styled(Input.TextArea)`
    resize: none;
    min-height: 200px;
`;

// 재고 이력 모달 스타일
const InventoryHistoryModal = styled(Modal)`
    ${modalSizeStyle(800)}
    ${modalCommonStyle}

    .ant-modal-body {
        padding: 0;
        max-height: calc(100vh - 120px);
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }
`;

// 재고 이력 모달 헤더 컨테이너
const InventoryHistoryHeader = styled.div`
    padding: 0;
    border-bottom: 1px solid #f0f0f0;
    background-color: #fff;
`;

// 재고 이력 모달 헤더 콘텐츠
const InventoryHistoryHeaderContent = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: ${props => window.innerWidth <= 768 ? '4px' : '8px'};
`;

// 재고 이력 모달 타이틀
const InventoryHistoryTitle = styled.div`
    font-size: clamp(12px, 2.5vw, 16px);
    font-weight: bold;
    overflow: hidden;
`;

// 재고 이력 테이블 컨테이너
const InventoryHistoryTableContainer = styled.div`
    flex: 1;
    overflow: auto;
`;

// 모달 액션 버튼 스타일
const ModalActionButton = styled(Button)`
    font-size: 12px;
    height: 24px;
    padding: 0 8px;
`;
//#endregion Styles


//#region Constants
// 재고 상태 상수
const INVENTORY_STATUS = {
    IN_STOCK: '재고있음',
    OUT_OF_STOCK: '재고없음',
    DEFECTIVE: '불량'
};

// 재고 상태 색상 상수
const INVENTORY_STATUS_COLOR = {
    IN_STOCK: 'success',
    OUT_OF_STOCK: 'default',
    DEFECTIVE: 'error'
};
//#endregion Constants


const AdminProducts = () => {


    //#region Hooks & States
    const navigate = useNavigate();
    const location = useLocation();

    const { message } = App.useApp();
    const { authRequest, user } = useContext(AuthContext);

    const [productForm] = Form.useForm();
    const [categoryForm] = Form.useForm();
    const [inventoryForm] = Form.useForm();
    const [productItemForm] = Form.useForm();

    const [products, setProducts] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [inventories, setInventories] = useState([]);
    const [productItems, setProductItems] = useState([]);
    const [formFieldValues, setFormFieldValues] = useState({});
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [inventoryHistories, setInventoryHistories] = useState([]);
    const [inventoryFilteredInfo, setInventoryFilteredInfo] = useState({});
    
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedProductItem, setSelectedProductItem] = useState(null);
    const [selectedInventoryItem, setSelectedInventoryItem] = useState(null);
    const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState(null);

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [inventoryLoading, setInventoryLoading] = useState(false);
    const [itemModalVisible, setItemModalVisible] = useState(false);
    const [productItemLoading, setProductItemLoading] = useState(false);
    const [productModalVisible, setProductModalVisible] = useState(false);
    const [inventoryHistoryLoading, setInventoryHistoryLoading] = useState(false);
    const [productItemModalVisible, setProductItemModalVisible] = useState(false);
    const [categoryFormModalVisible, setCategoryFormModalVisible] = useState(false);
    const [inventoryAddModalVisible, setInventoryAddModalVisible] = useState(false);
    const [categoryManageModalVisible, setCategoryManageModalVisible] = useState(false);
    const [inventoryManageModalVisible, setInventoryManageModalVisible] = useState(false);
    const [inventoryHistoryModalVisible, setInventoryHistoryModalVisible] = useState(false);
    //#endregion


    //#region Constants & Utility Functions
    // 이미지 업로드 전 검증
    const beforeUpload = (file) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('이미지 파일만 업로드 가능합니다.');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('이미지 파일 크기는 2MB를 초과할 수 없습니다.');
        }
        return isImage && isLt2M;
    };

    // 최종 가격 계산
    const calculateFinalPrice = useCallback(() => {
        const basePrice = productForm.getFieldValue('basePrice') || 0;
        const discountRate = productForm.getFieldValue('discountRate') || 0;
        const finalPrice = Math.floor(basePrice * (1 - discountRate / 100));
        productForm.setFieldValue('finalPrice', finalPrice);
    }, [productForm]);

    // 카테고리 경로 찾기
    const getCategoryPath = (categoryId) => {
        const findPath = (categories, targetId, path = []) => {
            for (const category of categories) {
                // 카테고리ID가 일치하는 경우 경로 반환
                if (category.categoryId === targetId) {
                    return [...path, category.categoryId];
                }
                // 자식 카테고리가 있는 경우 재귀 호출
                if (category.children) {
                    const childPath = findPath(category.children, targetId, [...path, category.categoryId]);
                    if (childPath) return childPath;
                }
            }
            return null;
        };
        return findPath(categories, categoryId);
    };
    //#endregion Constants & Utility Functions
    

    //#region API Functions
    // 카테고리 목록 가져오기
    const fetchCategories = useCallback(async () => {
        if (!user) return;
        
        try {
            const response = await authRequest('get', '/product/getCategories');
            
            setCategories(response.data);

            if (response.data && response.data.length > 0) {
                const options = transformCategoriesToCascaderOptions(response.data);
                setCategoryOptions(options);
            }
        } catch (error) {
            console.error('카테고리 목록 조회 에러:', error);            
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '예기치 못한 오류로 카테고리 목록 조회에 실패했습니다.');
            }
        }
    }, [authRequest, message, user]);

    // 상품 목록 가져오기
    const fetchProducts = useCallback(async (categoryId, searchKeyword) => {
        if (!user) return;
        
        try {
        setLoading(true);

            let response;

            // 카테고리 없고 검색어 없는 경우
            if (categoryId == null && searchKeyword == null) {
                response = await authRequest('get', '/product/getProductList');
            // 둘 중에 하나라도 있는 경우
            } else {
                response = await authRequest('get', '/product/getProductList', {
                    categoryId: categoryId ? parseInt(categoryId, 10) : '',
                    keyword: searchKeyword ? searchKeyword.trim() : ''
                });
            }

            setProducts(response.data);
        } catch (error) {
            console.error('상품 목록 조회 에러:', error);            
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '예기치 못한 오류로 상품 목록 조회에 실패했습니다.');
            }
        } finally {
            setLoading(false);
        }
    }, [authRequest, message, user]);

    // 상품 품목 목록 가져오기
    const fetchProductItems = useCallback(async (productId) => {
        if (!user) return;
        
        try {
            setProductItemLoading(true);
            
            const response = await authRequest('get', `/product/getProductItemsByProductId/${productId}`);
            
            setProductItems(response.data);
        } catch (error) {
            console.error('상품 품목 목록 조회 에러:', error);            
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '예기치 못한 오류로 상품 품목 목록 조회에 실패했습니다.');
            }
        } finally {
            setProductItemLoading(false);
        }
    }, [authRequest, message, user]);

    // 재고 목록 조회
    const fetchInventories = useCallback(async (productItemId) => {
        if (!user) return;
        
        try {
            setInventoryLoading(true);
            
            const response = await authRequest('get', `/product/getProductInventories/${productItemId}`);
            
            setInventories(response.data);
        } catch (error) {
            console.error('재고 목록 조회 에러:', error);            
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '예기치 못한 오류로 재고 목록 조회에 실패했습니다.');
            }
        } finally {
            setInventoryLoading(false);
        }
    }, [authRequest, message, user]);

    // 재고 이력 조회
    const fetchInventoryHistories = useCallback(async (productInventoryId) => {
        if (!user) return;
        
        try {
            setInventoryHistoryLoading(true);
            
            const response = await authRequest('get', `/product/getInventoryHistories/${productInventoryId}`);
            
            setInventoryHistories(response.data);
        } catch (error) {
            console.error('재고 이력 조회 에러:', error);            
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data || '예기치 못한 오류로 재고 이력 조회에 실패했습니다.');
            }
        } finally {
            setInventoryHistoryLoading(false);
        }
    }, [authRequest, message, user]);
    //#endregion API Functions


    //#region Modal Control Functions
    // 상품 마스터 추가 모달 열기
    const showProductAddModal = () => {
        setSelectedProduct(null);
        setProductModalVisible(true);
        productForm.resetFields();
        setFileList([]);
        
        // 초기값 설정
        const initialValues = {
            discountRate: 0,
            isActive: 0,
            finalPrice: 0,
        };

        productForm.setFieldsValue(initialValues);
        setFormFieldValues(initialValues);
    };

    // 상품 마스터 수정 모달 열기
    const showProductEditModal = (product) => {
        setSelectedProduct(product);

        // 이미지 파싱
        try {
            const imageData = JSON.parse(product.imageUrl);
            if (imageData.urls && Array.isArray(imageData.urls)) {
                const newFileList = imageData.urls.map((url, index) => { 
                    const fileName = typeof url === 'string' ? url.split('/').pop() : '';
                    return {
                        uid: `-${index +1}`,
                        name: fileName,
                        status: 'done',
                        url: `/images/products/${fileName}`
                    };
                });
                setFileList(newFileList);
            }
        } catch (error) {
            console.error('이미지 URL 파싱 오류:', error);
            message.error('이미지 URL 파싱 오류가 발생했습니다.');
        }

        // 카테고리 경로 찾기
        const findCategoryPathInOptions = (options, targetId, currentPath = []) => {
            for (const option of options) {
                if (option.value === targetId) {
                    return [...currentPath, option.value];
                }
                if (option.children) {
                    const path = findCategoryPathInOptions(
                        option.children, 
                        targetId, 
                        [...currentPath, option.value]
                    );
                    if (path) return path;
                }
            }
            return null;
        };

        // categoryOptions에서 'all' 옵션을 제외하고 경로 찾기
        const filteredOptions = categoryOptions.filter(option => option.value !== 'all');
        const categoryPath = findCategoryPathInOptions(filteredOptions, product.categoryId);

        // 상품 마스터 수정 모달 세팅
        const initialValues = {
            name: product.name,
            category: categoryPath || [],
            basePrice: product.basePrice.toString(),
            discountRate: product.discountRate.toString(),
            finalPrice: product.finalPrice.toString(),
            description: product.description || '',
            isActive: product.isActive,
        };
    
        productForm.setFieldsValue(initialValues);
        setFormFieldValues(initialValues);
        setProductModalVisible(true);
    };

    // 상품 품목 추가 모달 열기
    const showAddProductItemModal = () => {
        setSelectedProductItem(null);
        productItemForm.resetFields();
        productItemForm.setFieldsValue({
            productId: selectedProduct.productId,
            isActive: 0,
        });
        setProductItemModalVisible(true);
    };

    // 상품 품목 수정 모달 열기
    const showEditProductItemModal = (item) => {
        setSelectedProductItem(item);
        productItemForm.setFieldsValue({
            productId: item.productId,
            size: item.size,
            color: item.color,
            isActive: item.isActive,
        });
        setProductItemModalVisible(true);
    };

    // 상품 품목 관리 모달 열기
    const showProductItemModal = (product) => {
        setSelectedProduct(product);
        fetchProductItems(product.productId);
        setItemModalVisible(true);
    }

    // 재고 관리 모달 열기
    const showInventoryManageModal = (record) => {
        setSelectedProductItem(record); 
        setSelectedInventoryItem(record);
        setInventoryManageModalVisible(true);
    }

    // 재고 이력 모달 열기
    const showInventoryHistoryModal = (record) => {
        setSelectedInventoryItem(record);
        fetchInventoryHistories(record.productInventoryId);
        setInventoryHistoryModalVisible(true);
    }

    // 재고 추가 모달 열기
    const showInventoryAddModal = () => {
        inventoryForm.resetFields(); 
        setInventoryAddModalVisible(true);
    };

    // 카테고리 관리 모달 열기
    const showCategoryManageModal = () => {
        setCategoryManageModalVisible(true);
    };

    // 카테고리 추가 모달 열기
    const showCategoryAddModal = () => {
        setSelectedCategoryForEdit(null);
        categoryForm.resetFields();
        setCategoryFormModalVisible(true);
    };
    
    // 카테고리 수정 모달 열기
    const showEditCategoryModal = (category) => {
        setSelectedCategoryForEdit(category);
        const parentCategoryPath = getCategoryPath(category.parentCategoryId);
        categoryForm.setFieldsValue({
            name: category.name,
            code: category.code,
            parentCategoryId: parentCategoryPath || [],
        });
        setCategoryFormModalVisible(true);
    };
    
    // 재고 관리 모달 닫기
    const closeInventoryManageModal = () => {
        setInventoryManageModalVisible(false);
        setInventoryFilteredInfo({});
    };
    
    // 재고 이력 모달 닫기
    const closeInventoryHistoryModal = () => {
        setInventoryHistoryModalVisible(false);
        setInventoryHistories([]);
    };

    // 카테고리 관리 모달 닫기
    const closeCategoryManageModal = () => {
        setCategoryManageModalVisible(false);
        setSelectedCategoryForEdit(null);
    };

    // 카테고리 추가/수정 모달 닫기
    const closeCategoryFormModal = () => {
        setCategoryFormModalVisible(false);
        categoryForm.resetFields();
        setSelectedCategoryForEdit(null);
    };
    //#endregion Modal Control Functions


    //#region Data Transformation Functions
    // 카테고리 트리 데이터 변환
    const transformToTreeData = (categories) => {
        const buildTree = (items, parentId = null) => {        
            return items
                .filter(item => item.parentCategoryId === parentId)
                .map(item => ({
                    title: (
                        <div 
                            style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                width: '100%',
                                minWidth: 0,
                            }}
                        >
                            <div style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                flex: 1,
                                minWidth: 0,
                            }}>
                                <span style={{ fontWeight: 'bold' }}>{item.name}</span>
                                <span 
                                    style={{ 
                                        marginLeft: 8, 
                                        color: '#999',
                                        fontSize: '0.9em' 
                                    }}
                                >
                                    ({item.code || '코드 없음'})
                                </span>
                            </div>
                            <Space 
                                size="small" 
                                style={{ 
                                    flexShrink: 0, 
                                    marginLeft: 8 
                                }}
                            >
                                <Button 
                                    type="text"
                                    icon={<EditOutlined />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        showEditCategoryModal(item);
                                    }}
                                    size="small"
                                />
                                <Popconfirm
                                    title="정말 이 카테고리를 삭제하시겠습니까?"
                                    onConfirm={(e) => {
                                        e.stopPropagation();
                                        handleDeleteCategory(item);
                                    }}
                                    okText="예"
                                    cancelText="아니오"
                                >
                                    <Button 
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={(e) => e.stopPropagation()}
                                        size="small"
                                    />
                                </Popconfirm>
                            </Space>
                        </div>
                    ),
                    key: item.categoryId.toString(),
                    children: buildTree(categories, item.categoryId),
                }));
        };
    
        return buildTree(categories);
    };

    // 카테고리 목록 캐스케이더 옵션 변환
    const transformCategoriesToCascaderOptions = (categories) => {
        const buildCascaderOptions = (parentId = null) => {
            return categories
                .filter(category => category.parentCategoryId === parentId)
                .map(category => ({
                    value: category.categoryId,
                    label: category.name,
                    children: buildCascaderOptions(category.categoryId),
                }))
                .filter(item => !item.children.length || item.children.length > 0);
        };

        return [
            {
                value: 'all',
                label: '전체',
            },
            ...buildCascaderOptions(null),
        ];
    };
    //#endregion Data Transformation Functions


    //#region Event Handlers
    // 검색 처리
    const handleSearch = useCallback(() => {
        fetchProducts(selectedCategory, searchText);
    }, [fetchProducts, selectedCategory, searchText]);

    // 상품 삭제 처리
    const handleDelete = async (record) => {
        try {
            const formData = {
                productId: record.productId,
                categoryId: record.categoryId,
                isDeleted: 1
            };
            
            const response = await authRequest('post', '/product/updateProduct', formData);
            
            if (response.status === 200) {
                message.success(response.data); 
                await new Promise(resolve => setTimeout(resolve, 500));
                await fetchProducts(
                    selectedCategory || null,
                    searchText || null
                );
            } else {
                console.error('상품 삭제 실패:', response);
                throw new Error('상품 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('상품 삭제 에러:', error);
            
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                // 백엔드에서 보내는 에러 메시지 표시
                message.error(error.response.data);
            }
        }
    };

    // 상품 품목 삭제 처리
    const handleDeleteProductItem = async (item) => {
        try {
            const formData = {
                productItemId: item.productItemId,
                isDeleted: 1,
                version: item.version,
            };
            
            const response = await authRequest('post', '/product/updateProductItem', formData);
            
            if (response.status === 200) {
                message.success(response.data);
                await fetchProductItems(selectedProduct.productId);
            } else {
                console.error('상품 품목 삭제 실패:', response);
                throw new Error('상품 품목 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('상품 품목 삭제 에러:', error);
            
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data);
            }
        }
    }

    // 카테고리 삭제
    const handleDeleteCategory = async (category) => {
        try {
            const response = await authRequest('post', `/product/deleteCategory`, {
                categoryId: category.categoryId
            });

            if (response.status === 200) {
                message.success(response.data);
                fetchCategories();
            } else {
                console.error('카테고리 삭제 실패:', response);
                throw new Error('카테고리 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('카테고리 삭제 에러:', error);
            
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data);
            }
        }
    };

    // 카테고리 변경 시 상품 목록 가져오기
    const handleCategoryChange = (value) => {
        const selectedCategoryId = value && value.length > 0 && value[0] !== 'all'
            ? value[value.length - 1]
            : null;
        setSelectedCategory(selectedCategoryId);
        setSearchText('');
    };

    // 상위 카테고리 변경 시 코드 업데이트
    const handleParentCategoryChange = (value) => {
        // Form에 값 설정
        categoryForm.setFieldsValue({ parentCategoryId: value });

        // 최상위 카테고리가 선택되면 코드 초기화
        if (!value || value.length === 0) {
            categoryForm.setFieldsValue({ code: '' });
            return;
        }
    
        // 마지막 카테고리 ID 추출
        const lastCategoryId = value[value.length - 1];
    
        // 상위 카테고리 찾기
        const findCategory = (categories, id) => {
            for (const category of categories) {
                if (category.categoryId === id) {
                    return category;
                }
            }
            return null;
        };
    
        const parentCategory = findCategory(categories, lastCategoryId);
        if (parentCategory && parentCategory.code) {
            categoryForm.setFieldsValue({ code: parentCategory.code + '-' });
        }
    };
    
    // 폼 필드 변경 추적
    const handleFormFieldsChange = useCallback((changedFields, allFields) => {
        const values = {};
        allFields.forEach(field => {
            values[field.name[0]] = field.value;
        });
        setFormFieldValues(values);
    }, []);

    // 폼 필드 검증 메시지 반환
    const getFormValidationMessage = useCallback(() => {
        const values = formFieldValues;
        const emptyFields = [];
        
        if (!values.name?.trim()) emptyFields.push('상품명');
        if (!values.category || values.category.length === 0) emptyFields.push('카테고리');
        if (!values.basePrice || values.basePrice <= 0) emptyFields.push('기본 가격');
        if (values.discountRate == null || values.discountRate < 0) emptyFields.push('할인율');
        
        if (emptyFields.length > 0) {
            return (
                <div>
                    다음 항목을 입력해주세요:
                    <br />
                    <b>{emptyFields.join(', ')}</b>
                </div>
            );
        }
        
        return null;
    }, [formFieldValues]);
     //#endregion Event Handlers


    //#region Form Submit Handlers
    // 상품 마스터 생성&수정 처리
    const handleProductSubmit = async (values) => {
        message.info('처리 중...');

        try {
            setUploading(true);

            // 카테고리 ID 추출
            const categoryId = values.category && values.category.length > 0 
                ? values.category[values.category.length - 1]
                : null;

            // 카테고리 선택 여부 확인
            if (categoryId === null) {
                message.error('카테고리를 선택해주세요.');
                return;
            }

            let uploadedImages = [];

            // 이미지 파일 추출
            fileList.forEach(file => {
                if (file.status === 'done' && !file.originFileObj) {
                    const fileName = file.name || file.url.split('/').pop();
                    uploadedImages.push(fileName);
                }
            });

            // 이미지 파일 처리
            if (fileList.length > 0) {
                for (let file of fileList) {
                    if (file.originFileObj) {
                        const formData = new FormData();
                        formData.append('file', file.originFileObj);

                        try {
                            const uploadResponse = await authRequest('post', '/product/uploadImage', formData, {
                                headers: { 'Content-Type': 'multipart/form-data' }
                            });

                            if (uploadResponse.status === 200) {
                                uploadedImages.push(uploadResponse.data.fileName);
                            } else {
                                console.error('이미지 업로드 실패:', uploadResponse);
                                throw new Error(uploadResponse.data.error || '이미지 업로드에 실패했습니다.');
                            }
                        } catch (uploadError) {
                            console.error('이미지 업로드 에러:', uploadError);
                            if (!uploadError.response) {
                                message.warning('네트워크 연결을 확인해주세요.');
                            } else {
                                message.error(uploadError.response.data.error || '이미지 업로드에 실패했습니다.');
                            }
                            return;
                        }
                    }
                }
            }

            const imageUrls = { urls: uploadedImages };

            const formData = {
                name: values.name,
                categoryId: categoryId,
                basePrice: parseInt(values.basePrice, 10),
                discountRate: parseInt(values.discountRate, 10),
                finalPrice: parseInt(values.basePrice * (1 - values.discountRate / 100), 10),
                imageUrl: JSON.stringify(imageUrls),
                description: values.description || '',
                isActive: values.isActive,
            };

            if (selectedProduct) {
                formData.productId = selectedProduct.productId;
                formData.isDeleted = selectedProduct.isDeleted;
            }

            const response = await authRequest(
                'post', 
                selectedProduct ? '/product/updateProduct' : '/product/insertProduct', 
                formData
            );

            message.destroy();
            message.success(response.data);
            setProductModalVisible(false);
            productForm.resetFields();
            await new Promise(resolve => setTimeout(resolve, 500));
            await fetchProducts(
                selectedCategory || null,
                searchText || null
            );
        } catch (error) {
            console.error('상품 처리 에러:', error);
            message.destroy();
            
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data);
            }
        } finally {
            setUploading(false);
        }
    };

    // 상품 품목 생성&수정 처리
    const handleProductItemSubmit = async (values) => {
        message.info('처리 중...');

        try {
            setProductItemLoading(true);

            const formData = {
                productId: selectedProduct.productId,
                size: values.size,
                color: values.color,
                isActive: values.isActive,
            };

            if (selectedProductItem) {
                formData.productItemId = selectedProductItem.productItemId;
                formData.version = selectedProductItem.version;
            }
            
            const response = await authRequest(
                'post', 
                selectedProductItem ? '/product/updateProductItem' : '/product/insertProductItem', 
                formData
            );

            message.destroy();
            message.success(response.data);
            setProductItemModalVisible(false);
            productItemForm.resetFields();
            await fetchProductItems(selectedProduct.productId);
        } catch (error) {
            console.error('상품 품목 처리 에러:', error);
            message.destroy();

            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data);
            }
        } finally {
            setProductItemLoading(false);
        }
    };

    // 입고 처리
    const handleInventorySubmit = async (values) => {
        message.info('처리 중...');

        try {
            const barcodes = values.barcodes
                .split('\n')
                .map(code => code.trim())
                .filter(code => code);
    
            const formData = {
                productItemId: selectedInventoryItem.productItemId,
                barcodes: barcodes
            };
    
            const response = await authRequest('post', '/product/insertBulkProductInventory', formData);
            
            message.destroy();
            message.success(response.data);
            setInventoryAddModalVisible(false);
            inventoryForm.resetFields();
            await fetchInventories(selectedInventoryItem.productItemId);
            await fetchProductItems(selectedProduct.productId);
        } catch (error) {
            console.error('입고 처리 에러:', error);
            message.destroy();
            
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data);
            }
        }
    };

    // 카테고리 추가/수정
    const handleCategorySubmit = async (values) => {
        message.info('처리 중...');

        try {
            console.log('Form values:', values);
            const parentCategoryId = Array.isArray(values.parentCategoryId) && values.parentCategoryId.length > 0 
                ? values.parentCategoryId[values.parentCategoryId.length - 1]
                : null;
            
            const requestData = {
                name: values.name,
                code: values.code,
                parentCategoryId: parentCategoryId,
            };

            console.log('Request data:', requestData);
            if (selectedCategoryForEdit) {
                requestData.categoryId = selectedCategoryForEdit.categoryId;
            }

            const response = await authRequest(
                'post', 
                selectedCategoryForEdit ? '/product/updateCategory' : '/product/insertCategory',
                requestData
            );
            message.destroy();
            message.success(response.data);
            setCategoryFormModalVisible(false);
            categoryForm.resetFields();
            await fetchCategories(); 
        } catch (error) {
            console.error('카테고리 처리 에러:', error);
            message.destroy();
            
            if (!error.response) {
                message.warning('네트워크 연결을 확인해주세요.');
            } else {
                message.error(error.response.data);
            }
        }
    };
    //#endregion Form Submit Handlers


    //#region Table Column Definitions
    // 상품 목록 테이블 컬럼 설정
    const columns = [
        {
            title: '상품코드',
            dataIndex: 'code',
            key: 'code',
            align: 'center',
            ellipsis: true,
            fixed: 'left',
            onHeaderCell: () => ({
                style: { minWidth: 90 },
            }),
            onCell: () => ({
                style: { minWidth: 90 },
            }),
            sorter: (a, b) => a.code - b.code,
        },
        {
            title: '상품명',
            dataIndex: 'name',
            key: 'name',
            align: 'center',
            fixed: 'left',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: '이미지',
            dataIndex: 'imageUrl',
            key: 'imageUrl',
            align: 'center',
            ellipsis: true,
            onHeaderCell: () => ({
                style: { minWidth: 60 },
            }),
            onCell: () => ({
                style: { minWidth: 60 },
            }),
            render: imageUrlStr => {
                const imageUrl = getImageUrl(imageUrlStr);
                
                if (!imageUrl) {
                        return <span>-</span>;
                    }

                    return (
                        <Image
                        src={imageUrl}
                            alt="상품 이미지"
                            width={50}
                            height={60}
                            style={{ objectFit: 'cover', fontSize: '10px' }}
                        fallback="/images/products/404.webp"
                    />
                );
            }
        },
        {
            title: '기본 가격',
            dataIndex: 'basePrice',
            key: 'basePrice',
            align: 'center',
            ellipsis: true,
            onHeaderCell: () => ({
                style: { minWidth: 100 },
            }),
            onCell: () => ({
                style: { minWidth: 100 },
            }),
            sorter: (a, b) => a.basePrice - b.basePrice,
            render: (basePrice) => `₩${basePrice.toLocaleString('ko-KR') || '0'}`,
        },
        {
            title: '할인율',
            dataIndex: 'discountRate',
            key: 'discountRate',
            align: 'center',
            ellipsis: true,
            onHeaderCell: () => ({
                style: { minWidth: 60 },
            }),
            onCell: () => ({
                style: { minWidth: 60 },
            }),
            render: (discountRate) => `${discountRate}%`,
        },
        {
            title: '최종 가격',
            dataIndex: 'finalPrice',
            key: 'finalPrice',
            align: 'center',
            ellipsis: true,
            onHeaderCell: () => ({
                style: { minWidth: 90 },
            }),
            onCell: () => ({
                style: { minWidth: 90 },
            }),
            sorter: (a, b) => a.finalPrice - b.finalPrice,
            render: (finalPrice) => `₩${finalPrice.toLocaleString('ko-KR') || '0'}`,
        },
        {
            title: '상품 설명',
            dataIndex: 'description',
            key: 'description',
            align: 'center',
            render: (description) => {
                if (!description) return <span>-</span>;

                const truncatedText = description.length > 20
                    ? `${description.substring(0, 20)}...`
                    : description;

                return (
                    <Popover
                        content={
                            <PopoverContent>
                                {description}
                            </PopoverContent>
                        }
                        title="상품 설명"
                        trigger="click"
                        placement="left"
                    >
                        <Button
                            type="link"
                            size="small"
                            style={{ padding: 0 }}
                        >
                            {truncatedText}
                        </Button>
                    </Popover>
                )
            }
                
        },
        {
            title: '상태',
            dataIndex: 'isActive',
            key: 'isActive',
            align: 'center',
            ellipsis: true,
            width: 70,
            render: (isActive) => isActive === 1 ?
                <Tag color="success" style={{ marginRight: "0px" }}>활성</Tag> :
                <Tag color="error" style={{ marginRight: "0px" }}>비활성</Tag>,
            filters: [
                { text: '활성', value: 1 },
                { text: '비활성', value: 0 },
            ],
            onFilter: (value, record) => record.isActive === value,
            filterDropdownStyle: {
                backgroundColor: '#ffffff',
            },
        },
        {
            title: '작업',
            key: 'action',
            align: 'center',
            ellipsis: true,
            render: (_, record) => (
                <Space size="small">
                    <ActionButton 
                        size={window.innerWidth <= 768 ? "small" : "middle"}
                        onClick={() => showProductEditModal(record)}
                    >
                        수정
                    </ActionButton>
                    <ActionButton 
                        size="small"
                        onClick={() => showProductItemModal(record)}
                    >
                        품목 관리
                    </ActionButton>
                    <Popconfirm
                        title="정말 이 상품을 삭제하시겠습니까?"
                        onConfirm={() => handleDelete(record)}
                        okText="예"
                        cancelText="아니오"
                    >
                        <ActionButton 
                            size="small" 
                            danger
                        >
                            삭제
                        </ActionButton>
                    </Popconfirm>
                </Space>
            ),
        }
    ];

    // 상품 품목 테이블 컬럼 설정
    const productItemColumns = [
        {
            title: '품목 ID',
            dataIndex: 'productItemId',
            key: 'productItemId',
            align: 'center',
            fixed: 'left',
        },
        {
            title: '사이즈',
            dataIndex: 'size',
            key: 'size',
            align: 'center',
        },
        {
            title: '색상',
            dataIndex: 'color',
            key: 'color',
            align: 'center',
        },
        {
            title: '재고 수량',
            dataIndex: 'stockQuantity',
            key: 'stockQuantity',
            align: 'center',
        },
        {
            title: '예약 수량',
            dataIndex: 'reservedQuantity',
            key: 'reservedQuantity',
            align: 'center',
        },
        {
            title: '판매 수량',
            dataIndex: 'salesCount',
            key: 'salesCount',
            align: 'center',
        },
        {
            title: '상태',
            dataIndex: 'isActive',
            key: 'isActive',
            align: 'center',
            render: (isActive) => isActive === 1 ?
                <Tag color="success" style={{ marginRight: "0px" }}>활성</Tag> :
                <Tag color="error" style={{ marginRight: "0px" }}>비활성</Tag>,
        },
        {
            title: '작업',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Space size="small" style={{ whiteSpace: 'nowrap' }}>
                    <ModalActionButton 
                        size="small" 
                        onClick={() => showEditProductItemModal(record)}
                    >
                        수정
                    </ModalActionButton>
                    <ModalActionButton 
                        size="small"
                        onClick={() => showInventoryManageModal(record)}
                    >
                        재고 관리
                    </ModalActionButton>
                    <Popconfirm
                        title="정말 이 품목을 삭제하시겠습니까?" 
                        onConfirm={() => handleDeleteProductItem(record)}
                        okText="예"
                        cancelText="아니오"
                    >
                        <ModalActionButton 
                            size="small" 
                            danger
                        >
                            삭제
                        </ModalActionButton>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    // 재고 관리 테이블 컬럼 설정
    const getInventoryColumns = ({ 
        onHistoryClick, 
        filteredInfo 
    }) => [
        {
            title: '바코드',
            dataIndex: 'barcode',
            key: 'barcode',
            align: 'center',
            sorter: (a, b) => b.barcode.localeCompare(a.barcode),
        },
        {
            title: '상태',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            filters: Object.entries(INVENTORY_STATUS).map(([value, text]) => ({ 
                text, 
                value 
            })),
            filteredValue: filteredInfo?.status || null,
            filterMultiple: true,
            onFilter: (value, record) => record.status === value,
            render: (status) => (
                <Tag color={INVENTORY_STATUS_COLOR[status]} style={{ marginRight: 0 }}>
                    {INVENTORY_STATUS[status]}
                </Tag>
            )
        },
        {
            title: '주문번호',
            dataIndex: 'orderProductId',
            key: 'orderProductId',
            align: 'center',
            render: (orderProductId) => orderProductId || '-'
        },
        {
            title: '등록일시',
            dataIndex: 'createdAt',
            key: 'createdAt',
            align: 'center',
        },
        {
            title: '작업',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <ModalActionButton
                    size="small"
                    onClick={() => onHistoryClick(record)}
                >
                    이력 조회
                </ModalActionButton>
            ),
        }
    ];

    // 재고 이력 테이블 컬럼 설정
    const getInventoryHistoryColumns = () => [
        {
            title: '변경 전 상태',
            dataIndex: 'statusFrom',
            key: 'statusFrom',
            align: 'center',
            render: (status) => {
                const statusMap = {
                    'IN_STOCK': <Tag color="success" style={{ marginRight: 0 }}>재고있음</Tag>,
                    'OUT_OF_STOCK': <Tag color="default" style={{ marginRight: 0 }}>재고없음</Tag>,
                    'DEFECTIVE': <Tag color="error" style={{ marginRight: 0 }}>불량</Tag>
                };
                return status ? (statusMap[status] || status) : <Tag color="default" style={{ marginRight: 0 }}>입고</Tag>;
            }
        },
        {
            title: '변경 후 상태',
            dataIndex: 'statusTo',
            key: 'statusTo',
            align: 'center',
            render: (status) => {
                const statusMap = {
                    'IN_STOCK': <Tag color="success" style={{ marginRight: 0 }}>재고있음</Tag>,
                    'OUT_OF_STOCK': <Tag color="default" style={{ marginRight: 0 }}>재고없음</Tag>,
                    'DEFECTIVE': <Tag color="error" style={{ marginRight: 0 }}>불량</Tag>,
                };
                return statusMap[status] || status;
            }
        },
        {
            title: '주문번호',
            dataIndex: 'orderProductId',
            key: 'orderProductId',
            align: 'center',
            render: (orderProductId) => orderProductId || '-'
        },
        {
            title: '변경일시',
            dataIndex: 'createdAt',
            key: 'createdAt',
            align: 'center',
        }
    ];
    //#endregion Table Column Definitions


    //#region Effect Hooks
    // 카테고리 목록 가져오기
    useEffect(() => {
        fetchCategories();
        if (location.state?.searchText) {
            const searchKeyword = location.state.searchText;
            setSearchText(searchKeyword);
            setTimeout(() => {
                fetchProducts(null, searchKeyword);
            }, 0);
        } else {
            fetchProducts(null, null);
        }
        setFileList([]);
    }, [fetchCategories, fetchProducts, location.state, navigate]);

    // 카테고리 변경 시 상품 목록 가져오기
    useEffect(() => {
        fetchProducts(selectedCategory, null);
    }, [selectedCategory, fetchProducts]);

    // 재고 관리 모달 가져오기
    useEffect(() => {
        if (inventoryManageModalVisible && selectedInventoryItem) {
            fetchInventories(selectedInventoryItem.productItemId);
        }
    }, [inventoryManageModalVisible, selectedInventoryItem, fetchInventories]);
    //#endregion Effect Hooks

    
    //#region Render Functions
    // 상품 목록 페이지 렌더링
    return (
        <Container>
            <HeaderSection>
                {/* 상품 목록 헤더 컨테이너 */}
                <HeaderContent>
                        <div style={{ flex: 1 }}>
                        <StyledButton 
                                icon={<AppstoreOutlined />} 
                                onClick={showCategoryManageModal}
                                size={window.innerWidth <= 768 ? "small" : "middle"}
                            >
                                카테고리 관리
                        </StyledButton>
                        </div>
                    <HeaderTitle>상품 관리</HeaderTitle>
                        <div style={{ 
                            flex: 1, 
                            display: 'flex', 
                            justifyContent: 'flex-end' 
                            }}
                        >
                        <StyledButton 
                        type="primary" 
                        icon={<PlusOutlined />} 
                                        onClick={showProductAddModal}
                    >
                    상품 추가
                        </StyledButton>
                        </div>
                </HeaderContent>

                {/* 카테고리 검색 및 추가 버튼 */}
                <SearchSection>
                    <SearchWrapper>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Cascader
                                options={categoryOptions}
                                onChange={(value) => {
                                    handleCategoryChange(value);
                                }}
                                placeholder="카테고리 선택"
                                style={{ width: 135, height: 32 }}
                                dropdownStyle={{
                                    maxHeight: 300,
                                    boxShadow: '0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08)' 
                                }}
                                allowClear
                                expandTrigger={window.innerWidth <= 768 ? 'click' : 'hover'}
                                changeOnSelect
                                loading={categories.length === 0}
                                notFoundContent={categories.length === 0 ? "카테고리 로딩 중..." : "카테고리 없음"}
                                separator=" > "
                                displayRender={(labels) => {
                                    if (labels && labels.length > 0) {
                                        return labels.join(' > ');
                                    }
                                    return '카테고리 선택';
                                }}
                            />
                        </div>
                        <div>
                            <Input
                                placeholder="상품명 검색"
                                value={searchText}
                                onChange={e => setSearchText(e.target.value)}
                                style={{ flex: 1, height: 32, width: window.innerWidth <= 768 ? 150 : 200 }}
                                size="middle"
                                onPressEnter={handleSearch}
                                allowClear
                            />
                            <Button
                                type="primary"
                                icon={<SearchOutlined />}
                                onClick={handleSearch}
                            >
                                {window.innerWidth <= 768 ? '' : '검색'}
                            </Button>
                        </div>
                    </SearchWrapper>
                </SearchSection>
            </HeaderSection>

            <ContentContainer>
                {/* 주문 목록 테이블 */}
                <Table
                    columns={columns}
                    dataSource={products}
                    loading={loading}
                    rowKey="productId"
                    locale={{ emptyText: '상품이 없습니다.' }}
                    scroll={{ x: 'max-content' }}
                    size="small"
                    pagination={{ 
                        pageSize: 10, 
                        position: ['bottomCenter'],
                    }}
                    style={{ marginTop: 0, height: '100%' }}
                    sticky={{ 
                        offsetHeader: 0,
                        offsetColumn: 3,
                        leftColumn: 3,
                        rightColumn: 1,
                    }}
                />

                {/* 카테고리 관리 모달 */}
                <CategoryManageModal
                    title={null}
                    open={categoryManageModalVisible}
                    onCancel={closeCategoryManageModal}
                    footer={null}
                    width={600}
                >
                    {/* 카테고리 관리 모달 헤더 */}
                    <CategoryModalHeader>
                        <div style={{ flex: 1 }}></div>
                        <CategoryModalTitle>카테고리 관리</CategoryModalTitle>
                        <div style={{ 
                            flex: 1, 
                            display: 'flex', 
                            justifyContent: 'flex-end' 
                        }}>
                            <StyledButton 
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={showCategoryAddModal}
                            >
                                {window.innerWidth <= 768 ? '추가' : '카테고리 추가'}
                            </StyledButton>
                        </div>
                    </CategoryModalHeader>

                    {/* 카테고리 트리 */}
                    <CategoryTreeContainer>
                        <Tree 
                            className="category-tree"
                            showLine={{ showLeafIcon: false }}
                            treeData={transformToTreeData(categories)}
                            loading={loading}
                            blockNode={true}
                            selectable={false}
                            expandAction="click"
                        />
                    </CategoryTreeContainer>

                    {/* 카테고리 수정/추가 모달 */}
                    <CategoryFormModal
                        title={selectedCategoryForEdit ? '카테고리 수정' : '카테고리 추가'}
                        open={categoryFormModalVisible}
                        onCancel={(e) => {
                            e.stopPropagation();
                            closeCategoryFormModal();
                        }}
                        footer={null}
                    >
                        <Form
                            form={categoryForm}
                            layout="vertical"
                            onFinish={handleCategorySubmit}
                            initialValues={{ parentCategoryId: [] }}
                        >
                            <Form.Item
                                name="name"
                                label="카테고리 이름"
                                rules={[{ required: true, message: '카테고리 이름을 입력해주세요.' }]}
                            >
                                <Input placeholder="카테고리 이름을 입력해주세요." />
                            </Form.Item>
                            <Form.Item
                                name="parentCategoryId"
                                label="상위 카테고리 선택"
                            >
                                <Cascader
                                    placeholder="상위 카테고리를 선택해주세요."
                                    options={categoryOptions.filter(option => option.value !== 'all')}
                                    changeOnSelect
                                    allowClear
                                    onChange={handleParentCategoryChange}
                                    expandTrigger="hover"
                                    displayRender={(label) => label.join(' > ')}
                                    dropdownStyle={{ maxHeight: 300 }}
                                />
                                <CategoryFormWarning>
                                    ※최상위 카테고리 추가 시 비우세요.
                                </CategoryFormWarning>
                            </Form.Item>
                            <Form.Item
                                name="code"
                                label="카테고리 코드"
                                rules={[{ required: true, message: '카테고리 코드를 입력해주세요.' }]}
                            >
                                <Input placeholder="상위 카테고리를 선택하면 자동으로 코드가 생성됩니다." />
                            </Form.Item>
                            <Form.Item style={{ textAlign: 'center', marginBottom: 0 }} >
                                <Space>
                                    <StyledButton 
                                        type="primary" 
                                        htmlType="submit"
                                    >
                                        {selectedCategoryForEdit ? '수정' : '추가'}
                                    </StyledButton>
                                    <StyledButton 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            closeCategoryFormModal();
                                        }}
                                    >
                                        취소
                                    </StyledButton>
                                </Space>
                            </Form.Item>
                        </Form>
                    </CategoryFormModal>
                </CategoryManageModal>

                {/* 상품 수정/추가 모달 */}
                <ProductManageModal
                    title={selectedProduct ? '상품 수정' : '상품 추가'}
                    open={productModalVisible}
                    onCancel={() => {
                        setProductModalVisible(false);
                        productForm.resetFields();
                    }}
                    footer={null}
                >
                    <Form
                        form={productForm}
                        layout="vertical"
                        onFinish={handleProductSubmit}
                        onFieldsChange={handleFormFieldsChange}
                        initialValues={{
                            discountRate: 0,
                            isActive: 1,
                            finalPrice: 0,
                        }}
                    >
                        <Form.Item 
                            name="name" 
                            label="상품명" 
                            rules={[{ required: true, message: '상품명을 입력해주세요.' }]}
                            style={{ marginBottom: 6 }}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item 
                            name="category" 
                            label="카테고리" 
                            rules={[{ required: true, message: '카테고리를 선택해주세요.' }]}
                            style={{ marginBottom: 6 }}
                        >
                            <Cascader 
                                options={categoryOptions.filter(option => option.value !== 'all')}
                                changeOnSelect
                                placeholder="카테고리 선택"
                                expandTrigger={window.innerWidth <= 768 ? 'click' : 'hover'}
                            />
                        </Form.Item>
                        <Form.Item 
                            name="basePrice" 
                            label="기본 가격" 
                            rules={[{ required: true, message: '기본 가격을 입력해주세요.' }]}
                            style={{ marginBottom: 6 }}
                        >
                            <Input 
                                type="number" 
                                min={0} 
                                addonAfter="원"
                                onChange={calculateFinalPrice}
                                onWheel={(e) => e.target.blur()}
                                style={{ width: '100%', textAlign: 'right' }}
                            />
                        </Form.Item>
                        <Form.Item 
                            name="discountRate" 
                            label="할인율"
                            rules={[{ required: true, message: '할인율을 입력해주세요.' }]}
                            style={{ marginBottom: 6 }}
                        >
                            <Input 
                                type="number" 
                                min={0} 
                                max={100} 
                                addonAfter="%"
                                onChange={calculateFinalPrice}
                                onWheel={(e) => e.target.blur()}
                                style={{ width: '100%', textAlign: 'right' }}
                            />
                        </Form.Item>
                        <Form.Item 
                            name="finalPrice" 
                            label="최종 가격"
                            style={{ marginBottom: 6 }}
                        >
                            <Input 
                                type="number"
                                disabled
                                addonAfter="원"
                                style={{ width: '100%', textAlign: 'right', backgroundColor: '#fcfcfc' }}
                            />
                        </Form.Item>
                        <Form.Item
                            name="description"
                            label="상품 설명"
                            style={{ marginBottom: 20 }}
                        >
                            <Input.TextArea 
                                rows={4} 
                                placeholder="상품 설명을 입력해주세요."
                                maxLength={1000}
                                showCount
                                style={{ resize: 'none' }}
                            />
                        </Form.Item>
                        <Form.Item
                            name="images"
                            label="상품 이미지"
                            style={{ marginBottom: 6 }}
                        >
                            <Upload.Dragger
                                name="file"
                                multiple
                                beforeUpload={beforeUpload}
                                fileList={fileList}
                                disabled={uploading}
                                onChange={(info) => {
                                    let newFileList = [...info.fileList];
                                    setFileList(newFileList);
                                }}
                                customRequest={({ onSuccess }) => {
                                    setTimeout(() => {
                                        onSuccess("ok");
                                    }, 0);
                                }}
                            >
                                {uploading ? (
                                    <div>
                                        <Spin />
                                        <p>파일 업로드 중...</p>
                                    </div>
                                ) : (
                                    <>
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined />
                                </p>
                                <p className="ant-upload-text">
                                    이미지를 드래그 앤 드롭하거나 클릭하세요.
                                </p>
                                <p className="ant-upload-hint">
                                    한번에 여러개를 업로드 할 수 있습니다.
                                </p>
                                    </>
                                )}
                            </Upload.Dragger>
                        </Form.Item>
                            <Form.Item
                                name="isActive"
                                label="판매 상태"
                            >
                                <Select>
                                    <Select.Option value={1}>활성</Select.Option>
                                    <Select.Option value={0}>비활성</Select.Option>
                                    </Select>
                            </Form.Item>
                        <Form.Item 
                            style={{ textAlign: 'center', marginTop: 20 }}
                        >
                            <Space>
                                <Tooltip 
                                    title={getFormValidationMessage()}
                                    trigger="click"
                                    open={getFormValidationMessage() ? undefined : false}
                                    color="#ff4d4f"
                                >
                                    <Button 
                                        type="primary" 
                                        htmlType="submit"
                                        loading={uploading}
                                        disabled={uploading}
                                    >
                                        {selectedProduct ? '수정' : '추가'}
                                    </Button>
                                </Tooltip>
                                <Button 
                                    onClick={() => {
                                        setProductModalVisible(false);
                                        productForm.resetFields();
                                        setFileList([]);
                                        setFormFieldValues({});
                                    }}
                                    disabled={uploading}
                                >
                                    취소
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </ProductManageModal>

                {/* 상품 품목 관리 모달 */}
                <ProductItemModal
                    title="상품 품목 관리"
                    open={itemModalVisible}
                    onCancel={() => setItemModalVisible(false)}
                    footer={null}
                    closeIcon={<CloseOutlined />}
                >
                    {/* 상품 품목 관리 모달 헤더 */}
                    <ProductItemHeaderContainer>
                        <ProductItemTitle>
                            {`[ID: ${selectedProduct?.productId}] ${selectedProduct?.name}`}
                        </ProductItemTitle>
                        <div>
                            <StyledButton 
                            type="primary" 
                            icon={<PlusOutlined />}
                            onClick={showAddProductItemModal}
                        >
                            품목 추가
                            </StyledButton>
                    </div>
                    </ProductItemHeaderContainer>
                    
                    {/* 상품 품목 관리 테이블 */}
                    <ProductItemTableContainer>
                        <Table
                            columns={productItemColumns}
                            dataSource={productItems}
                            loading={productItemLoading}
                            rowKey="productItemId"
                            size="small"
                            scroll={{ x: 'max-content' }}
                            tableLayout="auto"
                            style={{ width: '100%' }}
                            pagination={{
                                pageSize: 10,
                                position: ['bottomCenter'],
                            }}
                        />
                    </ProductItemTableContainer>

                    {/* 품목 수정/추가 모달 */}
                    <ProductItemFormModal
                        title={selectedProductItem ? '품목 수정' : '품목 추가'}
                        open={productItemModalVisible}
                        onCancel={() => {
                            setProductItemModalVisible(false);
                            productItemForm.resetFields();
                        }}
                        maskClosable={true}
                        footer={null}
                >
                        <Form
                            form={productItemForm}
                            layout="vertical"
                            onFinish={handleProductItemSubmit}
                            initialValues={{
                                isActive: 0,
                            }}
                        >
                            <Form.Item
                                name="productId"
                                hidden                                
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                name="size"
                                label="사이즈"
                                rules={[{ required: true, message: '사이즈를 입력해주세요.' }]}
                            >
                                <Input placeholder="예: S, M, L, XL, 90, 95 등" />
                            </Form.Item>
                            <Form.Item
                                name="color"
                                label="색상"
                                rules={[{ required: true, message: '색상을 입력해주세요.' }]}
                            >
                                <Input placeholder="예: 빨강, 파랑, 검정 등" />
                            </Form.Item>
                            <Form.Item
                                name="isActive"
                                label="상태"
                            >
                                <Select>
                                    <Select.Option value={1}>활성</Select.Option>
                                    <Select.Option value={0}>비활성</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item
                                style={{ textAlign: 'center', marginTop: 20 }}
                            >
                                <Space>
                                    <Button type="primary" htmlType="submit">
                                        {selectedProductItem ? '수정' : '추가'}
                                    </Button>
                                    <Button onClick={() => {
                                        setProductItemModalVisible(false);
                                        productItemForm.resetFields();
                                    }}>
                                        취소
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </ProductItemFormModal>

                    {/* 재고 관리 모달 */}
                    <InventoryManageModal
                        title={null}
                        open={inventoryManageModalVisible}
                        onCancel={closeInventoryManageModal}
                        footer={null}
                    >
                        <InventoryManageHeader>
                            <InventoryManageHeaderContent>
                                <InventoryManageTitle>
                                    {`재고 관리 - [${selectedProduct?.name || ''}] ${selectedProductItem?.size || '-'} / ${selectedProductItem?.color || '-'} (재고: ${selectedProductItem?.stockQuantity || 0}, 예약: ${selectedProductItem?.reservedQuantity || 0}, 판매: ${selectedProductItem?.salesCount || 0})`}
                                </InventoryManageTitle>
                                <StyledButton 
                                    type="primary" 
                                    icon={<PlusOutlined />}
                                    onClick={() => showInventoryAddModal()}
                                >
                                    입고 처리
                                </StyledButton>
                            </InventoryManageHeaderContent>
                        </InventoryManageHeader>
                        <InventoryManageTableContainer>
                            <Table
                                dataSource={inventories}
                                loading={inventoryLoading}
                                size="small"
                                scroll={{ x: 'max-content' }}
                                style={{ 
                                    width: '100%',
                                }}
                                pagination={{
                                    pageSize: 10,
                                    position: ['bottomCenter']
                                }}
                                onChange={(_, filters) => {
                                    setInventoryFilteredInfo(filters);
                                }}
                                columns={getInventoryColumns({
                                    onHistoryClick: showInventoryHistoryModal,
                                    filteredInfo: inventoryFilteredInfo
                                })}
                                summary={() => {
                                    const statusCounts = inventories.reduce((acc, item) => {
                                        acc[item.status] = (acc[item.status] || 0) + 1;
                                        return acc;
                                    }, {});

                                    return (
                                        <Table.Summary fixed>
                                            <Table.Summary.Row>
                                                <Table.Summary.Cell index={0} colSpan={5} align="right">
                                                    <Space>
                                                        {Object.entries(statusCounts).map(([status, count]) => {
                                                            const statusText = {
                                                                'IN_STOCK': '재고있음',
                                                                'OUT_OF_STOCK': '재고없음',
                                                                'DEFECTIVE': '불량'
                                                            }[status];
                                                            const statusColor = {
                                                                'IN_STOCK': 'success',
                                                                'OUT_OF_STOCK': 'default',
                                                                'DEFECTIVE': 'error'
                                                            }[status];
                                                            return (
                                                                <Tag key={status} color={statusColor}>
                                                                    {statusText}: {count}개
                                                                </Tag>
                                                            );
                                                        })}
                                                        <Tag color="processing" style={{ fontWeight: 'bold' }}>
                                                            총 {inventories.length}개
                                                        </Tag>
                                                    </Space>
                                                </Table.Summary.Cell>
                                            </Table.Summary.Row>
                                        </Table.Summary>
                                    );
                                }}
                            />
                        </InventoryManageTableContainer>
                    </InventoryManageModal>

                    {/* 입고 처리 모달 */}
                    <InventoryAddModal
                        title="입고 처리"
                        open={inventoryAddModalVisible}
                        onCancel={() => {
                            setInventoryAddModalVisible(false);
                            inventoryForm.resetFields();
                        }}
                        footer={null}
                    >
                        <Form 
                            form={inventoryForm}
                            layout="vertical" 
                            onFinish={handleInventorySubmit}
                        >
                            <Form.Item 
                                label="바코드 입력"
                                name="barcodes"
                                rules={[
                                    { required: true, message: '바코드를 입력해주세요.' },
                                    {
                                        validator: (_, value) => {
                                            if (!value) return Promise.resolve();
                                            
                                            if (/[,;:]/.test(value)) {
                                                return Promise.reject('바코드는 줄바꿈으로만 구분해주세요. 콤마(,), 세미콜론(;), 콜론(:) 등은 사용할 수 없습니다.');
                                            }

                                            const lines = value.split('\n').filter(line => line.trim());
                                            const hasInvalidChars = lines.some(line => /[^A-Za-z0-9-_]/.test(line.trim()));
                                            
                                            if (hasInvalidChars) {
                                                return Promise.reject('바코드는 영문자, 숫자, 하이픈(-), 언더스코어(_)만 포함할 수 있습니다.');
                                            }

                                            return Promise.resolve();
                                        }
                                    }
                                ]}
                            >
                                <InventoryAddTextArea
                                    placeholder="바코드를 스캔하거나 입력하세요. 줄바꿈으로 여러 바코드를 입력할 수 있습니다."
                                    rows={8}
                                />
                            </Form.Item>
                            <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                                <Space>
                                    <Button onClick={() => {
                                        setInventoryAddModalVisible(false);
                                        inventoryForm.resetFields();
                                    }}>
                                        취소
                                    </Button>
                                    <Button type="primary" htmlType="submit">
                                        입고 처리
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </InventoryAddModal>

                    {/* 재고 이력 모달 */}
                    <InventoryHistoryModal
                        title={null}
                        open={inventoryHistoryModalVisible}
                        onCancel={closeInventoryHistoryModal}
                        footer={null}
                    >
                        <InventoryHistoryHeader>
                            <InventoryHistoryHeaderContent>
                                <InventoryHistoryTitle>
                                    {`재고 이력 - 바코드: ${selectedInventoryItem?.barcode}`}
                                </InventoryHistoryTitle>
                            </InventoryHistoryHeaderContent>
                        </InventoryHistoryHeader>
                        <InventoryHistoryTableContainer>
                            <Table
                                dataSource={inventoryHistories}
                                loading={inventoryHistoryLoading}
                                size="small"
                                scroll={{ x: 'max-content' }}
                                style={{ width: '100%' }}
                                pagination={{
                                    pageSize: 10,
                                    position: ['bottomCenter']
                                }}
                                columns={getInventoryHistoryColumns()}
                            />
                        </InventoryHistoryTableContainer>
                    </InventoryHistoryModal>
                </ProductItemModal>
            </ContentContainer>
        </Container>
    );
};
//#endregion Render Functions

export default AdminProducts;

