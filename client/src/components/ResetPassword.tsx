"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./User/Card";
import { Button } from "./User/Button";
import { Input } from "./User/input";
import { Label } from "@radix-ui/react-label";

import { useResetPasswordMutation, useVerifyResetTokenQuery } from "../hooks/auth/auth";
import { ROUTES } from "../config/env";
import { resetPasswordSchema } from "../validations/reset-password-schema";

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const {
    data: tokenData,
    isLoading: isVerifying,
    isError: isTokenError,
  } = useVerifyResetTokenQuery(token || "");
  const { mutate: resetPassword, isPending } = useResetPasswordMutation();

  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset link. Please request a new password reset.");
      navigate(ROUTES.LOGIN);
    }
  }, [token, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid reset token");
      return;
    }

    const result = resetPasswordSchema.safeParse({
      password,
      confirmPassword,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    resetPassword(
      { token, password, confirmPassword },
      {
        onSuccess: () => {
          toast.success("Password reset successfully! You can now login.");
          navigate(ROUTES.LOGIN);
        },
        onError: (error: unknown) => {
          const errorMessage =
            (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Failed to reset password. Please try again.";
          toast.error(errorMessage);
        },
      }
    );
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#7140be] px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p>Verifying reset token...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isTokenError || (!isVerifying && !tokenData?.data)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#7140be] px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Reset Link</CardTitle>
            <CardDescription>
              This reset link is invalid or has expired. Please request a new
              password reset.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate(ROUTES.LOGIN)}
              className="w-full"
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const email = tokenData?.data?.email || "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#7140be] px-4">
      <Card className="w-full max-w-md border-border shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            Enter your new password{email ? ` for ${email}` : ""}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password ? "border-red-500" : ""}
                disabled={isPending}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={errors.confirmPassword ? "border-red-500" : ""}
                disabled={isPending}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
