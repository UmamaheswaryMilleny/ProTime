"use client";

import type React from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./User/Card";
import { Button } from "./User/Button";
import { Input } from "./User/input";
import { Label } from "./User/label";
import { useForgotPasswordMutation } from "../hooks/auth/auth";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  role?: "client" | "admin" ;
}

export function ForgotPasswordModal({
  isOpen,
  onClose,
  role,
}: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate: forgotPassword, isPending } = useForgotPasswordMutation();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic email validation
    if (!email || !email.includes("@")) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }

    setErrors({});

    forgotPassword(
      { email, role },
      {
        onSuccess: () => {
          toast.success(
            "Password reset link has been sent to your email. Please check your inbox."
          );
          setEmail("");
          onClose();
        },
        onError: (error: unknown) => {
          const errorMessage =
            (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Failed to send reset link. Please try again.";
          toast.error(errorMessage);
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md border-border shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your
            password.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className={errors.email ? "border-red-500" : ""}
                disabled={isPending}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isPending}>
                {isPending ? "Sending..." : "Send Reset Link"}
              </Button>
            </div>
          </form>
        </CardContent>

        <CardFooter className="text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <button
            onClick={onClose}
            className="text-primary hover:underline"
            type="button"
          >
            Sign in
          </button>
        </CardFooter>
      </Card>
    </div>
  );
}
