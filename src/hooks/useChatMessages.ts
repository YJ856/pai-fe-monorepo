/**
 * useChatMessages 훅 (공용)
 *
 * 부모/자녀 Chat 화면에서 공통으로 사용하는 메시지 관리 훅
 *
 * 주요 기능:
 * - 메시지 목록 상태 관리
 * - VQA API 호출 (이미지 있으면 uploadMedia → getVqaAnswer)
 * - recordConversation 호출
 * - 입력 텍스트 및 이미지 상태 관리
 * - 로딩 상태 관리
 *
 * 플로우:
 * 1. 사용자 질문 입력 + (선택) 이미지 첨부
 * 2. 이미지 있으면: uploadMedia() → mediaId 받기
 * 3. getVqaAnswer({ media_id, question }) → { answer, keywords }
 * 4. recordConversation({ conversationSessionId, questionText, imageMediaId, keyword: keywords[0], answerText })
 * 5. 로컬 messages 배열에 추가
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
import { uploadMedia } from '../api/media';
import { getVqaAnswer } from '../api/ai';
import { recordConversation } from '../api/conversations';

export interface Message {
  id: string;
  sender: 'child' | 'parent' | 'ai';
  text: string;
  imageUrl?: string;
  imageAspectRatio?: number;
  timestamp: Date;
}

export function useChatMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentImageAspectRatio, setCurrentImageAspectRatio] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // conversationSessionId 관리 (첫 질문이면 null, 이후엔 서버에서 받은 ID 사용)
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

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      let mediaId: string | undefined;

      // 2. 이미지 있으면 업로드
      if (imageUri) {
        console.log('[useChatMessages] 이미지 업로드 시작:', imageUri);

        const formData = new FormData();
        formData.append('file', {
          uri: imageUri,
          type: 'image/jpeg',
          name: 'chat-image.jpg',
        } as any);

        const uploadResult = await uploadMedia(formData);
        mediaId = uploadResult.mediaId.toString();
        console.log('[useChatMessages] 이미지 업로드 완료. mediaId:', mediaId);
      }

      // 3. VQA API 호출
      console.log('[useChatMessages] VQA API 호출:', { media_id: mediaId, question: questionText });
      const vqaResult = await getVqaAnswer({
        media_id: mediaId || '',
        question: questionText,
      });
      console.log('[useChatMessages] VQA 답변:', vqaResult);

      const { answer, keywords } = vqaResult;

      // 4. recordConversation 호출
      console.log('[useChatMessages] recordConversation 호출');
      const recordResult = await recordConversation({
        conversationSessionId: conversationSessionIdRef.current,
        questionText,
        imageMediaId: mediaId || null,
        keyword: keywords[0] || null, // 첫 번째 키워드만
        answerText: answer,
      });

      // conversationSessionId 저장 (다음 질문에 사용)
      conversationSessionIdRef.current = recordResult.conversationSessionId;
      console.log('[useChatMessages] conversationSessionId:', recordResult.conversationSessionId);

      // 5. AI 답변 메시지 추가
      const answerMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: answer,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, answerMessage]);
      setIsLoading(false);

      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error: any) {
      console.error('[useChatMessages] 에러 발생:', error);

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

  return {
    messages,
    inputText,
    setInputText,
    currentImage,
    setCurrentImage,
    currentImageAspectRatio,
    setCurrentImageAspectRatio,
    isLoading,
    handleSend,
    scrollViewRef,
    conversationSessionId: conversationSessionIdRef.current,
    clearChat,
  };
}
