import React, { useState, type KeyboardEvent, useRef, useEffect } from 'react';
import EmojiPicker, { type EmojiClickData, Theme } from 'emoji-picker-react';
import { Smile, Paperclip, X, FileIcon, ImageIcon, Loader2 } from 'lucide-react';
import { chatApi } from '../api/chatApi';

interface MessageInputProps {
  onSend: (content: string, attachment?: { fileUrl: string; fileName: string; fileSize: number; fileType: string; messageType: 'IMAGE' | 'FILE' }) => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSend, disabled }) => {
  const [content, setContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [attachment, setAttachment] = useState<{ fileUrl: string; fileName: string; fileSize: number; fileType: string; messageType: 'IMAGE' | 'FILE' } | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setContent((prev) => prev + emojiData.emoji);
  };

  const handleSend = () => {
    if (content.trim() || attachment) {
      onSend(content.trim(), attachment || undefined);
      setContent('');
      setAttachment(null);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'; // Reset height
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit');
      return;
    }

    setIsUploading(true);
    try {
      const result = await chatApi.uploadAttachment(file);
      const data = result.data;
      const messageType = file.type.startsWith('image/') ? 'IMAGE' : 'FILE';
      
      setAttachment({
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
        fileType: data.fileType,
        messageType
      });
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      {attachment && (
        <div className="mb-3 flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              {attachment.messageType === 'IMAGE' ? <ImageIcon size={20} /> : <FileIcon size={20} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{attachment.fileName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{(attachment.fileSize / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <button 
            onClick={removeAttachment}
            className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex items-end space-x-2 bg-gray-50 dark:bg-gray-800 rounded-2xl p-2 border border-gray-200 dark:border-gray-700 relative overflow-hidden">
        {isUploading && (
          <div className="absolute inset-x-0 inset-y-0 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-[1px] flex items-center justify-center z-20 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[blueviolet] text-white rounded-full text-xs font-bold shadow-xl">
              <Loader2 size={12} className="animate-spin" />
              <span>Uploading attachment...</span>
            </div>
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange}
          accept="image/*,.pdf,.doc,.docx,.txt"
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading || !!attachment}
          className="p-2 mb-0.5 rounded-full text-zinc-500 hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors"
        >
          <Paperclip size={20} />
        </button>

        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={attachment ? "Add a caption..." : "Message..."}
          disabled={disabled || isUploading}
          className="flex-1 max-h-32 min-h-[40px] bg-transparent border-none focus:ring-0 resize-none text-sm text-gray-900 dark:text-white placeholder-gray-500 py-2 px-3 disabled:opacity-50"
          rows={1}
        />
        
        <div className="relative" ref={emojiPickerRef}>
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={disabled || isUploading}
            className="p-2 mb-0.5 rounded-full text-zinc-500 hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors"
          >
            <Smile size={20} />
          </button>
          
          {showEmojiPicker && (
            <div className="absolute bottom-12 right-0 z-50">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                theme={Theme.DARK}
                lazyLoadEmojis={true}
              />
            </div>
          )}
        </div>
        <button
          onClick={handleSend}
          disabled={(isUploading || (!content.trim() && !attachment)) || disabled}
          className="p-2 mb-0.5 rounded-full text-white bg-[blueviolet] hover:bg-[#7c2ae8] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-[blueviolet]/20"
        >
          <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>
    </div>
  );
};
