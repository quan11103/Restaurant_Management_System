import React from 'react';
import Card from '../layouts/Card';
import RegisterForm from './RegisterForm';

const RegisterView: React.FC = () => {
    return (
        <Card title="Đăng kí tài khoản">
            <RegisterForm />
        </Card>
    );
};

export default RegisterView;