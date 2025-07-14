import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const { isAuthenticated, user } = useContext(AuthContext);

    // 회원별 장바구니 키 생성
    const getCartKey = useCallback((userId) => {
        const userEmail = user?.email;
        return userEmail ? `cart_user_${userEmail}` : null;
    }, [user?.email]);

    // 장바구니 데이터 로드
    const loadCart = useCallback((cartKey) => {
        if (!cartKey) return [];
        
        try {
            const savedCart = localStorage.getItem(cartKey);
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error('장바구니 로드 중 오류:', error);
            return [];
        }
    }, []);

    // 장바구니 데이터 저장
    const saveCart = useCallback((items, cartKey) => {
        if (!cartKey) return;
        
        try {
            localStorage.setItem(cartKey, JSON.stringify(items));
        } catch (error) {
            console.error('장바구니 저장 중 오류:', error);
        }
    }, []);

    // 로그인/로그아웃 시 해당 회원의 장바구니 로드
    useEffect(() => {
        if (isAuthenticated && user?.email) {
            // 로그인된 경우: 해당 회원의 장바구니 로드
            const cartKey = getCartKey();
            const userCart = loadCart(cartKey);
            setCartItems(userCart);
        } else {
            // 로그아웃된 경우: 장바구니 비우기
            setCartItems([]);
        }
    }, [isAuthenticated, user?.email, getCartKey, loadCart]);

    // 회원 확인 헬퍼 함수
    const checkAuthentication = useCallback(() => {
        if (!isAuthenticated) {
            throw new Error('로그인이 필요한 서비스입니다.');
        }
        if (!user?.email) {
            throw new Error('사용자 정보를 찾을 수 없습니다.');
        }
    }, [isAuthenticated, user?.email]);

    // 장바구니에 상품 추가
    const addToCart = useCallback(async (product, productItem, quantity) => {
        checkAuthentication();

        // 이미지 파싱
        let imageUrl = '';
        try {
            if (typeof product.imageUrl === 'string') {
                const imageData = JSON.parse(product.imageUrl);
                imageUrl = imageData.urls?.[0] || '';
            } else if (product.imageUrl?.urls) {
                imageUrl = product.imageUrl.urls[0] || '';
            }
        } catch (e) {
            imageUrl = product.imageUrl || '';
        }

        // 새 아이템 생성
        const newItem = {
            userEmail: user.email,
            productId: product.productId,
            productItemId: productItem.productItemId,
            name: product.name,
            categoryId: product.categoryId,
            categoryCode: product.categoryCode,
            productCode: product.code,
            imageUrl: imageUrl,
            price: product.finalPrice,
            size: productItem.size,
            color: productItem.color,
            quantity: quantity,
            stockQuantity: productItem.stockQuantity,
            addedAt: new Date().toISOString()
        };

        // 기존 아이템 찾기
        const existingItemIndex = cartItems.findIndex(
            item => item.productItemId === productItem.productItemId
        );

        // 기존 아이템 존재 여부에 따라 업데이트
        let updatedCart;
        if (existingItemIndex >= 0) {
            updatedCart = [
                ...cartItems.slice(0, existingItemIndex),
                {
                    ...cartItems[existingItemIndex],
                    quantity: cartItems[existingItemIndex].quantity + quantity
                },
                ...cartItems.slice(existingItemIndex + 1)
            ];
        } else {
            updatedCart = [...cartItems, newItem];
        }

        // 로컬스토리지에 저장
        const cartKey = getCartKey();
        saveCart(updatedCart, cartKey);
        
        setCartItems(updatedCart);
    }, [user?.email, checkAuthentication, getCartKey, saveCart, cartItems]);

    // 장바구니에서 상품 제거
    const removeFromCart = useCallback((productItemId) => {
        checkAuthentication();

        setCartItems(prevItems => {
            const updatedItems = prevItems.filter(
                item => item.productItemId !== productItemId
            );
            
            const cartKey = getCartKey();
            saveCart(updatedItems, cartKey);
            
            return updatedItems;
        });
    }, [checkAuthentication, getCartKey, saveCart]);

    // 장바구니 상품 수량 변경
    const updateQuantity = useCallback((productItemId, quantity) => {
        checkAuthentication();

        if (quantity <= 0) {
            removeFromCart(productItemId);
            return;
        }

        setCartItems(prevItems => {
            const updatedItems = prevItems.map(item => 
                item.productItemId === productItemId
                    ? { ...item, quantity }
                    : item
            );
            
            const cartKey = getCartKey();
            saveCart(updatedItems, cartKey);
            
            return updatedItems;
        });
    }, [checkAuthentication, getCartKey, saveCart, removeFromCart]);

    // 장바구니 비우기
    const clearCart = useCallback(() => {
        checkAuthentication();

        const cartKey = getCartKey();
        if (cartKey) {
            localStorage.removeItem(cartKey);
        }
        setCartItems([]);
    }, [checkAuthentication, getCartKey]);

    // 장바구니 총 가격 계산
    const getTotalPrice = useCallback(() => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    }, [cartItems]);

    // 장바구니 총 아이템 수 계산
    const getTotalItemCount = useCallback(() => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    }, [cartItems]);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getTotalPrice,
            getTotalItemCount,
            isAuthenticated
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};