

"use client";

import type React from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "./User/Button";
import { Input } from "./User/input";
import { Label } from "./User/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./User/Card";


import { useLoginMutation,useGoogleAuthMutation } from "../hooks/auth/auth";
import { loginSchema } from "../validations/login-schema";;
import { useDispatch } from "react-redux";
import { loginUser } from "../store/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../config/env";
import type { User } from "../types/auth-types";
import { ForgotPasswordModal } from "./ForgotPasswordModal";
import { useGoogleLogin } from "@react-oauth/google";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
const [showPassword, setShowPassword] = useState(false);

  const { mutate: login, isPending } = useLoginMutation();
  const { mutate: googleAuth, isPending: isGooglePending } =
    useGoogleAuthMutation();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // -------------------------
  // Normal Email/Password Login
  // -------------------------
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = loginSchema.safeParse({
      email,
      password,
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

    login(
      { email, password },
      {
        onSuccess: (response) => {
          if (response.user) {
            const userData: User = {
              id: response.user.id,
              firstName: response.user.firstName,
              lastName: response.user.lastName,
              email: response.user.email,
              role: response.user.role as User["role"],
            };

            dispatch(loginUser(userData));

            if (response.accessToken) {
              localStorage.setItem("accessToken", response.accessToken);
            }

            toast.success(response.message || "Login successful");
            navigate(ROUTES.CLIENT_DASHBOARD);
          }
        },
        onError: () => {
          // toast.error("Invalid email or password");
          toast.error("Your account has been blocked. Please contact support.");
        },
      }
    );
  };

  // -------------------------
  // Google Login (USER ONLY)
  // -------------------------
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      googleAuth(
        { accessToken: tokenResponse.access_token },
        {
          onSuccess: (response) => {
            if (response.user) {
              const userData: User = {
                id: response.user.id,
                firstName: response.user.firstName,
                lastName: response.user.lastName,
                email: response.user.email,
                role: response.user.role as User["role"],
                profileImage: response.user.profileImage,
              };

              dispatch(loginUser(userData));

              if (response.accessToken) {
                localStorage.setItem("accessToken", response.accessToken);
              }

              toast.success(response.message || "Login successful");
              navigate(ROUTES.CLIENT_DASHBOARD);
            }
          },
          onError: () => {
            toast.error("Google login failed");
          },
        }
      );
    },
    onError: () => {
      toast.error("Google authentication failed");
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center  px-4">
      <Card className="w-full max-w-md border-border shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to get started
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Password</Label>
              
              </div>
           <div className="relative">
  <Input
    type={showPassword ? "text" : "password"}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    className="pr-10"
  />

  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
  >
    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
  </button>
</div>

              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>
  <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot Password?
                </button>
            <Button
              type="submit"
              className="w-full"
              disabled={isPending || isGooglePending}
            >
              {isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Login */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => googleLogin()}
            disabled={isPending || isGooglePending}
          >
            {isGooglePending ? "Signing in..." : "Sign in with Google"}
          </Button>
        </CardContent>

        <CardFooter className="text-center text-sm text-muted-foreground">
          Don’t have an account?{" "}
          <a href="/signup" className="text-primary hover:underline">
            Create one now
          </a>
        </CardFooter>
      </Card>

      {/* Forgot Password */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        role="client"
      />
    </div>
  );
}