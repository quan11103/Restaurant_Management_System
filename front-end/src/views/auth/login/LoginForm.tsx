import React, { useState } from 'react';
import axiosClient from '../../../api/axios';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAlert } from '../../../components/Alert';
import InputField from '../../../components/InputField';
import Button from '../../../components/Button';
import CustomLink from '../../../components/CustomLink';
import './LoginForm.css';

const LoginForm: React.FC = () => {
    const { showAlert } = useAlert();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username.trim() || !password) {
            showAlert('warning', 'Vui lòng nhập tên đăng nhập và mật khẩu!', 'Cảnh báo');
            return;
        }

        setIsLoading(true);

        try {
            const response = await axiosClient.post('/auth/login', { username, password });

            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('user_name', response.data.fullName || 'quý khách');
            localStorage.setItem('user_role', response.data.role || 'CLIENT');
            if (response.data.refresh_token) {
                localStorage.setItem('refresh_token', response.data.refresh_token);
            }
            navigate(response.data.role === 'MANAGER' ? '/manager' : '/');
        } catch (error: any) {
            if (error.response && error.response.status === 401) {
                showAlert('error', 'Sai tên đăng nhập hoặc mật khẩu!', 'Đăng nhập thất bại');
            } else {
                showAlert('error', 'Đã xảy ra lỗi kết nối với máy chủ!', 'Lỗi hệ thống');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoToRegister = () => {
        navigate('/register');
    };

    return (
        <form className="login-form" onSubmit={handleLogin}>
            <InputField
                label="Tên đăng nhập"
                type="text"
                value={username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            />

            <div className="password-field-wrapper">
                <InputField
                    label="Mật khẩu"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    className="password-input-field"
                />

                <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>

            <div className="login-actions">
                <CustomLink href="#" variant="primary" underline="hover">
                    Quên mật khẩu?
                </CustomLink>
            </div>

            <Button type="submit" fullWidth variant="primary" disabled={isLoading}>
                {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
            </Button>

            <div className="register-prompt">
                <span>Chưa có tài khoản? </span>
                <button
                    type="button"
                    className="register-link-btn"
                    onClick={handleGoToRegister}
                >
                    Đăng ký ngay
                </button>
            </div>
        </form>
    );
};

export default LoginForm;