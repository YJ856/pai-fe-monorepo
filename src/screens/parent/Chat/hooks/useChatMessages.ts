/**
 * useChatMessages 훅
 *
 * 채팅 메시지 관리 및 AI 응답 시뮬레이션
 *
 * 주요 기능:
 * - 메시지 목록 상태 관리
 * - 메시지 전송 및 AI 응답 시뮬레이션
 * - 입력 텍스트 및 이미지 상태 관리
 * - 로딩 상태 관리
 *
 * 반환값:
 * - messages
 * - inputText, setInputText
 * - currentImage, setCurrentImage
 * - isLoading
 * - handleSend
 * - scrollViewRef
 */

import { useState, useRef } from 'react';
import { ScrollView } from 'react-native';

interface Message {
  id: string;
  sender: 'parent' | 'ai';
  text: string;
  imageUrl?: string;
  timestamp: Date;
}

export function useChatMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const questionMessage: Message = {
      id: Date.now().toString(),
      sender: 'parent',
      text: inputText,
      imageUrl: currentImage || undefined,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, questionMessage]);
    setIsLoading(true);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Simulate AI response
    setTimeout(() => {
      const answerMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `좋은 질문이네요! "${inputText}"에 대해 함께 이야기해볼까요? 아이들과 이런 주제로 대화하면 매우 유익할 것 같습니다. 구체적으로 어떤 부분이 궁금하신가요?`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, answerMessage]);
      setIsLoading(false);

      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1500);

    setInputText('');
    setCurrentImage(null);
  };

  return {
    messages,
    inputText,
    setInputText,
    currentImage,
    setCurrentImage,
    isLoading,
    handleSend,
    scrollViewRef,
  };
}
