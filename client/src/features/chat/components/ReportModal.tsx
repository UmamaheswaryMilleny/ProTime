import React, { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { chatApi, ReportContext, ReportReason } from '../api/chatApi';

interface ReportModalProps {
  reportedId: string; // This is the userId of the person being reported
  initialContext?: ReportContext;
  onClose: () => void;
  onSuccess: (blockUser?: boolean) => void;
}

const reasons = [
  { label: 'Harassment or Bullying', value: ReportReason.HARASSMENT },
  { label: 'Inappropriate Content', value: ReportReason.INAPPROPRIATE_CONTENT },
  { label: 'Spam or Scam', value: ReportReason.SPAM },
  { label: 'Hate Speech', value: ReportReason.HATE_SPEECH },
  { label: 'Violence or Threats', value: ReportReason.VIOLENCE },
  { label: 'Nudity or Sexual Content', value: ReportReason.NUDITY },
  { label: 'False Information', value: ReportReason.FALSE_INFORMATION },
  { label: 'Other', value: ReportReason.OTHER }
];

export const ReportModal: React.FC<ReportModalProps> = ({ reportedId, initialContext, onClose, onSuccess }) => {
  const [context, setContext] = useState<ReportContext>(initialContext || ReportContext.CHAT);
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [blockUser, setBlockUser] = useState(true);
  const [receiveUpdates, setReceiveUpdates] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSubmit = async () => {
    if (!reason) {
      setError('Please select a reason for reporting.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Convert File objects→base64 data URLs so they can be stored & displayed
      // Guard: reject any single file > 2MB to stay well within MongoDB's 16MB doc limit
      const MAX_SIZE = 2 * 1024 * 1024; // 2MB
      const oversized = screenshots.find(f => f.size > MAX_SIZE);
      if (oversized) {
        setError(`"${oversized.name}" is too large. Each screenshot must be under 2MB.`);
        setIsSubmitting(false);
        return;
      }
      const screenshotUrls = screenshots.length > 0
        ? await Promise.all(screenshots.map(toBase64))
        : [];

      const res = await chatApi.submitReport({
        reportedUserId: reportedId,
        context,
        reason: reason as ReportReason,
        additionalDetails,
        screenshots: screenshotUrls,
        blockUser,
        receiveUpdates,
      });
      if (res.success) {
        onSuccess(blockUser);
        onClose();
      } else {
        setError(res.message || 'Failed to submit report');
      }
    } catch (err: any) {
      const backendMessage = err?.response?.data?.message;
      setError(backendMessage || err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl p-6 sm:p-8 flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-center text-white mb-8 tracking-tight">Report</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Context Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-300">where did this happen</label>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setContext(ReportContext.CHAT)}
                className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[blueviolet]/50 ${context === ReportContext.CHAT
                    ? 'bg-[blueviolet] text-white shadow-lg shadow-[blueviolet]/20'
                    : 'bg-transparent text-zinc-400 border border-zinc-700 hover:border-zinc-500 hover:text-zinc-200'
                  }`}
              >
                Chat
              </button>
              <button
                onClick={() => setContext(ReportContext.VIDEO_CALL)}
                className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[blueviolet]/50 ${context === ReportContext.VIDEO_CALL
                    ? 'bg-[blueviolet] text-white shadow-lg shadow-[blueviolet]/20'
                    : 'bg-transparent text-zinc-400 border border-zinc-700 hover:border-zinc-500 hover:text-zinc-200'
                  }`}
              >
                Video Call
              </button>
              <button
                onClick={() => setContext(ReportContext.GROUP_ROOM)}
                className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[blueviolet]/50 ${context === ReportContext.GROUP_ROOM
                    ? 'bg-[blueviolet] text-white shadow-lg shadow-[blueviolet]/20'
                    : 'bg-transparent text-zinc-400 border border-zinc-700 hover:border-zinc-500 hover:text-zinc-200'
                  }`}
              >
                Group Room
              </button>
            </div>
          </div>

          {/* Reason Dropdown */}
          <div className="space-y-3 relative">
            <label className="text-sm font-medium text-zinc-300">Reason for Report</label>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-left focus:outline-none focus:border-[blueviolet] focus:ring-1 focus:ring-[blueviolet] transition-colors"
            >
              <span className={`text-sm ${reason ? 'text-zinc-100' : 'text-zinc-500'}`}>
                {reasons.find(r => r.value === reason)?.label || 'Select reason...'}
              </span>
              <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl z-20 overflow-hidden">
                <div className="py-2 max-h-60 overflow-y-auto custom-scrollbar">
                  {reasons.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => {
                        setReason(r.value);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-[blueviolet]/10 hover:text-white transition-colors"
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Additional Details */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-300">Additional Details (optional)</label>
            <textarea
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              placeholder="Provide more context (optional)"
              className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[blueviolet] focus:ring-1 focus:ring-[blueviolet] transition-colors min-h-[100px] resize-none"
            />
          </div>

          {/* Upload Screenshots */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-300">Upload screenshots (optional)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                if (e.target.files) {
                  setScreenshots(Array.from(e.target.files));
                }
              }}
              className="w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-[blueviolet]/10 file:text-[blueviolet] hover:file:bg-[blueviolet]/20 transition-all cursor-pointer"
            />
            {screenshots.length > 0 && (
              <p className="text-xs text-zinc-500 mt-1">{screenshots.length} file(s) selected.</p>
            )}
          </div>

          {/* Additional Options */}
          <div className="space-y-4 pt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center w-5 h-5">
                <input
                  type="checkbox"
                  checked={blockUser}
                  onChange={(e) => setBlockUser(e.target.checked)}
                  className="peer appearance-none w-5 h-5 border-2 border-zinc-600 rounded bg-transparent checked:bg-[blueviolet] checked:border-[blueviolet] transition-all cursor-pointer"
                />
                <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors">Block this user</span>
            </label>

            {/* <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center w-5 h-5">
                <input
                  type="checkbox"
                  checked={receiveUpdates}
                  onChange={(e) => setReceiveUpdates(e.target.checked)}
                  className="peer appearance-none w-5 h-5 border-2 border-zinc-600 rounded bg-transparent checked:bg-[blueviolet] checked:border-[blueviolet] transition-all cursor-pointer"
                />
                <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors">I want to receive updates about this report</span>
            </label> */}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-medium text-sm text-zinc-400 border border-zinc-700 hover:border-zinc-500 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-zinc-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !reason}
            className="px-6 py-2.5 rounded-xl font-medium text-sm text-white bg-[blueviolet] hover:bg-[blueviolet]/90 shadow-lg shadow-[blueviolet]/20 transition-all focus:outline-none focus:ring-2 focus:ring-[blueviolet]/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  );
};
