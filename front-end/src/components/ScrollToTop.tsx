import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]); // Chạy lại mỗi khi đường dẫn URL thay đổi

    return null;
};

export default ScrollToTop;