import React from 'react';
import InputField from '../../../components/InputField';
import Button from '../../../components/Button';
import CustomLink from '../../../components/CustomLink';
import './LoginForm.css';

const LoginForm: React.FC = () => {
    return (
        <form className="login-form">
            <InputField
                label="Tên đăng nhập"
                type="text"
            />

            <InputField
                label="Mật khẩu"
                type="password"
            />

            <div className="login-actions">
                <CustomLink href="#" variant="primary" underline="hover">
                    Quên mật khẩu?
                </CustomLink>
            </div>

            <Button type="button" fullWidth variant="primary">
                Đăng nhập
            </Button>
        </form>
    );
};

export default LoginForm;