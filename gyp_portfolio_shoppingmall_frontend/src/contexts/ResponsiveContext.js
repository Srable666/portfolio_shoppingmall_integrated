import React, { createContext, useState, useContext, useEffect } from 'react';

const ResponsiveContext = createContext();

export const ResponsiveProvider = ({ children }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [screenSize, setScreenSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            setIsMobile(width < 768);
            setScreenSize({ width, height });
        };

        // 초기 실행
        handleResize();
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <ResponsiveContext.Provider value={{ isMobile, screenSize }}>
            {children}
        </ResponsiveContext.Provider>
    );
};

export const useResponsive = () => {
    const context = useContext(ResponsiveContext);
    if (!context) {
        throw new Error('useResponsive는 ResponsiveProvider 내에서 사용되어야 합니다');
    }
    return context;
};