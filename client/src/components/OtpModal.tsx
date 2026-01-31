import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, Clock } from 'lucide-react';

interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => void;
  onResend: () => void;
  email: string;
}

export const OTPModal: React.FC<OTPModalProps> = ({ 
  isOpen, 
  onClose, 
  onVerify, 
  onResend, 
  email 
}) => {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState<number>(60);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(true);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setTimer(60);
      setIsTimerActive(true);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
  let interval: number;

  if (isTimerActive && timer > 0) {
    interval = window.setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
  } else if (timer === 0) {
    setIsTimerActive(false);
  }

  return () => {
    if (interval) clearInterval(interval);
  };
}, [isTimerActive, timer]);


  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  const handleVerify = () => {
    const otpValue = otp.join('');
    if (otpValue.length === 6) {
      onVerify(otpValue);
    }
  };

  const handleResend = () => {
    setTimer(60);
    setIsTimerActive(true);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    onResend();
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-100">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
          
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Verify Your Email</h2>
            <p className="text-sm text-gray-500 mt-2 text-center">
              We've sent a 6-digit code to
            </p>
            <p className="text-sm font-medium text-gray-700">{email}</p>
          </div>
        </div>

        {/* OTP Input */}
        <div className="p-6">
          <div className="flex justify-center gap-2 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
               inputRefs.current[index] = el;
                }}

                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
            ))}
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className={`text-sm font-medium ${timer <= 10 ? 'text-red-500' : 'text-gray-600'}`}>
              {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
            </span>
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={!isOtpComplete || !isTimerActive}
            className="w-full py-3 px-4 bg-linear-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
          >
            Verify OTP
          </button>

          {/* Resend */}
          <div className="mt-4 text-center">
            {isTimerActive ? (
              <p className="text-sm text-gray-500">
                Didn't receive the code? Resend in{' '}
                <span className="font-medium text-gray-700">{timer}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                Resend OTP
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};