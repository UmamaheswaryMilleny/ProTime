import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../store/hooks';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

import { signinSchema, type SigninFormData } from '../../auth/validation/signin.schema';
import { loginAPI } from '../../auth/services/auth-service';
import { loginUser } from '../../auth/store/authSlice';
import { ROUTES } from '../../../shared/constants/constants.routes';

export const useAdminLogin = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const form = useForm<SigninFormData>({
        resolver: zodResolver(signinSchema),
        defaultValues: { email: '', password: '' },
    });

    const onSubmit = async (data: SigninFormData) => {
        setIsLoading(true);
        try {
            const response = await loginAPI(data);
            const accessToken = response.data.data?.accessToken;

            if (!accessToken) {
                toast.error('Login failed. Please try again.');
                return;
            }

            // Decode role from JWT payload
            const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
            const role = tokenPayload.role as 'ADMIN' | 'CLIENT';
            const id = tokenPayload.id as string;
            const email = tokenPayload.email as string;

            if (role !== 'ADMIN') {
                toast.error('Access denied. Admin credentials required.');
                return;
            }

            dispatch(loginUser({ id, email, fullName: 'Admin', role, accessToken, isPremium: false }));
            toast.success('Welcome, Admin!');
            navigate(ROUTES.ADMIN_DASHBOARD);
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            const message = err.response?.data?.message || 'Login failed. Check your credentials.';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return { form, onSubmit, isLoading };
};
