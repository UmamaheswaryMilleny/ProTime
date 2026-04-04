import React, { useState, type KeyboardEvent, useRef, useEffect } from 'react';
import EmojiPicker, { type EmojiClickData, Theme } from 'emoji-picker-react';
import { Smile } from 'lucide-react';

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSend, disabled }) => {
  const [content, setContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

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
    if (content.trim()) {
      onSend(content.trim());
      setContent('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'; // Reset height
      }
    }
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
      <div className="flex items-end space-x-2 bg-gray-50 dark:bg-gray-800 rounded-2xl p-2 border border-gray-200 dark:border-gray-700">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Message..."
          disabled={disabled}
          className="flex-1 max-h-32 min-h-[40px] bg-transparent border-none focus:ring-0 resize-none text-sm text-gray-900 dark:text-white placeholder-gray-500 py-2 px-3 disabled:opacity-50"
          rows={1}
        />
        
        <div className="relative" ref={emojiPickerRef}>
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={disabled}
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
          disabled={!content.trim() || disabled}
          className="p-2 mb-0.5 rounded-full text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>
    </div>
  );
};
