import axios from 'axios';

// Khởi tạo một instance (phiên bản) axios với cấu hình mặc định
const axiosClient = axios.create({
    baseURL: 'http://localhost:3000/',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor cho Request (Trước khi gửi đi)
axiosClient.interceptors.request.use(
    (config) => {
        // Tự động đính kèm token vào mọi request nếu có
        const token = localStorage.getItem('access_token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor cho Response (Sau khi nhận kết quả từ Backend)
axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const isAuthApi = error.config?.url?.includes('/login');
        // Nếu Backend trả về lỗi 401 (Hết hạn token hoặc không hợp lệ)
        if (error.response && error.response.status === 401 && !isAuthApi) {
            console.log('Token hết hạn, đang đăng xuất...')
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_name');
            localStorage.removeItem('user_role');
        }

        return Promise.reject(error);
    }
);

export default axiosClient;