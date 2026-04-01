import { useState, useCallback, useEffect } from 'react';
import { proBuddyApi } from '../api/proBuddyApi';
import { subscriptionService } from '../../dashboard/api/subscription-service';
import { useAppSelector } from '../../../store/hooks';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const useProBuddyChat = (chatId: string = 'default') => {
  const [messages, setMessages] = useState<Message[]>([]);

  // Load from session storage when chatId mounts or changes
  useEffect(() => {
    const saved = sessionStorage.getItem(`probuddy_messages_${chatId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        })));
      } catch (e) {
        console.error('Failed to parse saved ProBuddy messages', e);
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [chatId]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<{ count: number; limit: number }>({
    count: 0,
    limit: 20,
  });
  const user = useAppSelector((state) => state.auth.user);

  // Persist messages to sessionStorage
  useEffect(() => {
    sessionStorage.setItem(`probuddy_messages_${chatId}`, JSON.stringify(messages));
  }, [messages, chatId]);

  const fetchUsage = useCallback(async () => {
    try {
      const sub = await subscriptionService.getSubscription();
      const limit = sub.isPremium ? 100 : 20;
      setUsage({ count: sub.aiUsageCount || 0, limit });
    } catch (err) {
      console.error('Failed to fetch AI usage', err);
    }
  }, []);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);
      setError(null);

      try {
        const response = await proBuddyApi.chat(content);
        if (response.success) {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: response.response,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, aiMessage]);
          // Refresh usage count after successful chat
          fetchUsage();
        } else {
          setError('Failed to get response from ProBuddy.');
        }
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || 'Something went wrong.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [fetchUsage]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    sessionStorage.removeItem(`probuddy_messages_${chatId}`);
  }, [chatId]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearChat,
    usage,
    isPremium: user?.isPremium || false,
    refreshUsage: fetchUsage,
  };
};
