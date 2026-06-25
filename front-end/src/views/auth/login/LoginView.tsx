import React from 'react';
import Card from '../layouts/Card';
import LoginForm from './LoginForm';

const LoginView: React.FC = () => {
    return (
        <Card title="Đăng nhập">
            <LoginForm />
        </Card>
    );
};

export default LoginView;