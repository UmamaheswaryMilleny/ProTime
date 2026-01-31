"use client";

import type React from "react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "../User/Button";
import { Input } from "../User/input";
import { Label } from "../User/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../User/Card";

import { useAdminloginMutation } from "../../hooks/auth/auth";
import { loginSchema } from "../../validations/login-schema";
import { useDispatch } from "react-redux";
import { loginUser } from "../../store/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../config/env";
import type { User } from "../../types/auth-types";
import { ForgotPasswordModal } from "../ForgotPasswordModal";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate: adminLogin, isPending } =
    useAdminloginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    adminLogin(result.data, {
      onSuccess: (response) => {
        if (response.user) {
          const userData: User = {
            id: response.user.id,
            firstName: response.user.firstName,
            lastName: response.user.lastName,
            email: response.user.email,
            role: response.user.role,
          };
          dispatch(loginUser(userData));
          toast.success(
            response.message || "Admin login successful"
          );
          navigate(ROUTES.ADMIN_DASHBOARD);
        }
      },
      onError: (error: unknown) => {
        const errorMessage = 
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Admin login failed";
        toast.error(errorMessage);
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#7140be] px-4">
      <Card className="w-full max-w-md shadow-lg border border-border">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">
            ProTime Admin
          </CardTitle>
          <CardDescription>
            Sign in to manage the platform
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label>Email Address</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
                className="border border-border focus-visible:ring-1 focus-visible:ring-primary"
              />
              {errors.email && (
                <p className="text-sm text-red-500">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label>Password</Label>
                {/* <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot Password?
                </button> */}
              </div>
              <Input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                disabled={isPending}
                className="border border-border focus-visible:ring-1 focus-visible:ring-primary"
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              disabled={isPending}
            >
              {isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        role="admin"
      />
    </div>
  );
}