import React, { useState } from 'react';
import { Star, Loader, X } from 'lucide-react';
import { buddyService } from '../../buddy-match/services/buddy.service';
import { userApi } from '../../user/user-service';
import { updateUser } from '../../auth/store/authSlice';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../store/store';
import toast from 'react-hot-toast';

interface RatingModalProps {
  buddyConnectionId: string;
  partnerName: string;
  onClose: () => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  buddyConnectionId,
  partnerName,
  onClose,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!rating) return;
    setIsSubmitting(true);
    try {
      await buddyService.rateBuddy(buddyConnectionId, rating);
      toast.success(`Thank you for rating ${partnerName}!`);

      // Silently refresh the current user's own rating stats from the server
      // so their profile reflects the latest averageRating and ratingCount
      userApi.getProfileService()
        .then(freshProfile => {
          dispatch(updateUser({
            averageRating: freshProfile.averageRating,
            ratingCount: freshProfile.ratingCount,
          }));
        })
        .catch(() => {
          // Non-critical — profile will refresh next time user visits profile page
        });

      onClose();
    } catch (error: any) {
      console.error('Failed to submit rating:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to submit rating. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (val: number) => {
    switch (val) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-md w-full relative z-[160] transition-all duration-300 transform scale-100 hover:scale-[1.01]">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all duration-200 focus:outline-none disabled:opacity-50"
          type="button"
          aria-label="Close rating modal"
        >
          <X size={20} />
        </button>

        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-indigo-500/10 text-indigo-400 font-semibold text-3xl mb-6 shadow-inner border border-indigo-500/20">
          ⭐
        </div>
        <h3 className="text-white font-extrabold text-xl sm:text-2xl text-center mb-2 tracking-tight">
          Rate Your Session
        </h3>
        <p className="text-zinc-400 text-center text-sm mb-8 font-medium max-w-xs leading-relaxed">
          How was your study session with <span className="text-indigo-400 font-bold">{partnerName}</span>?
        </p>

        {/* Stars Selector */}
        <div className="flex items-center gap-2.5 mb-4 justify-center">
          {[1, 2, 3, 4, 5].map((starVal) => {
            const isActive = (hoverRating ?? rating ?? 0) >= starVal;
            return (
              <button
                key={starVal}
                type="button"
                onClick={() => setRating(starVal)}
                onMouseEnter={() => setHoverRating(starVal)}
                onMouseLeave={() => setHoverRating(null)}
                disabled={isSubmitting}
                className="focus:outline-none transition-all duration-150 transform active:scale-90 hover:scale-110 disabled:opacity-50"
              >
                <Star
                  size={42}
                  className={`transition-colors duration-150 ${
                    isActive
                      ? 'fill-amber-400 stroke-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                      : 'stroke-zinc-600 hover:stroke-zinc-500 fill-transparent'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Rating description/numeric display */}
        <div className="h-6 mb-8 text-center">
          {(hoverRating ?? rating) ? (
            <span className="text-sm font-semibold text-amber-400 flex items-center gap-1.5 justify-center animate-in fade-in slide-in-from-bottom-1 duration-150">
              ⭐ {hoverRating ?? rating}.0 - {getRatingLabel(hoverRating ?? rating ?? 0)}
            </span>
          ) : (
            <span className="text-xs text-zinc-500 font-semibold tracking-wide uppercase">Select a rating</span>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!rating || isSubmitting}
          className={`w-full py-3.5 rounded-2xl font-extrabold text-base tracking-wide flex items-center justify-center gap-3 transition-all duration-300 shadow-xl ${
            rating && !isSubmitting
              ? 'bg-[#7c3aed] text-white hover:bg-[#6d28d9] shadow-indigo-600/20 active:scale-[0.98]'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader className="animate-spin" size={20} />
              <span>Submitting...</span>
            </>
          ) : (
            <span>Submit Rating</span>
          )}
        </button>
      </div>
    </div>
  );
};
