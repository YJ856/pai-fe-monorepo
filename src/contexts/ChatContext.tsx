/**
 * ChatContext
 *
 * ChatDetail과 ChatList 화면 간 대화 데이터 공유
 * - messages: 전체 대화 메시지 목록
 * - conversationSessionId: 현재 대화 세션 ID
 * - 입력 상태 (inputText, currentImage 등)
 */

import React, { createContext, useContext, useState, useRef } from 'react';
import { uploadMedia } from '../api/media';
import { getVqaAnswer } from '../api/ai';
import { recordConversation } from '../api/conversations';

export interface Message {
  id: string;
  sender: 'child' | 'parent' | 'ai';
  text: string;
  imageUrl?: string;
  imageAspectRatio?: number;
  hasAudio?: boolean;
  timestamp: Date;
}

interface ChatContextValue {
  messages: Message[];
  inputText: string;
  setInputText: (text: string) => void;
  currentImage: string | null;
  setCurrentImage: (uri: string | null) => void;
  currentImageAspectRatio: number | null;
  setCurrentImageAspectRatio: (ratio: number | null) => void;
  isLoading: boolean;
  handleSend: (senderType: 'child' | 'parent') => Promise<void>;
  conversationSessionId: string | null;
  clearChat: () => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentImageAspectRatio, setCurrentImageAspectRatio] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const conversationSessionIdRef = useRef<string | null>(null);

  const handleSend = async (senderType: 'child' | 'parent') => {
    if (!inputText.trim()) return;

    const questionText = inputText.trim();
    const imageUri = currentImage;
    const aspectRatio = currentImageAspectRatio;

    // 1. 사용자 메시지 추가
    const questionMessage: Message = {
      id: Date.now().toString(),
      sender: senderType,
      text: questionText,
      imageUrl: imageUri || undefined,
      imageAspectRatio: aspectRatio || undefined,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, questionMessage]);
    setInputText('');
    setCurrentImage(null);
    setCurrentImageAspectRatio(null);
    setIsLoading(true);

    try {
      let mediaId: string | undefined;

      // 2. 이미지 있으면 업로드
      if (imageUri) {
        console.log('[ChatContext] 이미지 업로드 시작:', imageUri);

        const formData = new FormData();
        formData.append('file', {
          uri: imageUri,
          type: 'image/jpeg',
          name: 'chat-image.jpg',
        } as any);

        const uploadResult = await uploadMedia(formData);
        mediaId = uploadResult.mediaId.toString();
        console.log('[ChatContext] 이미지 업로드 완료. mediaId:', mediaId);
      }

      // 3. VQA API 호출
      console.log('[ChatContext] VQA API 호출:', { media_id: mediaId, question: questionText });
      const vqaResult = await getVqaAnswer({
        media_id: mediaId || '',
        question: questionText,
      });
      console.log('[ChatContext] VQA 답변:', vqaResult);

      const { answer, keywords } = vqaResult;

      // 4. recordConversation 호출
      console.log('[ChatContext] recordConversation 호출');
      const recordResult = await recordConversation({
        conversationSessionId: conversationSessionIdRef.current,
        questionText,
        imageMediaId: mediaId || null,
        keyword: keywords[0] || null, // 첫 번째 키워드만
        answerText: answer,
      });

      // conversationSessionId 저장
      conversationSessionIdRef.current = recordResult.conversationSessionId;
      console.log('[ChatContext] conversationSessionId:', recordResult.conversationSessionId);

      // 5. AI 답변 메시지 추가
      const answerMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: answer,
        hasAudio: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, answerMessage]);
      setIsLoading(false);
    } catch (error: any) {
      console.error('[ChatContext] 에러 발생:', error);

      // 에러 메시지 추가
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setInputText('');
    setCurrentImage(null);
    setCurrentImageAspectRatio(null);
    conversationSessionIdRef.current = null;
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        inputText,
        setInputText,
        currentImage,
        setCurrentImage,
        currentImageAspectRatio,
        setCurrentImageAspectRatio,
        isLoading,
        handleSend,
        conversationSessionId: conversationSessionIdRef.current,
        clearChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
}
