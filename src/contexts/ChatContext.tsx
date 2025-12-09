/**
 * ChatContext
 *
 * ChatDetail과 ChatList 화면 간 대화 데이터 공유
 * - messages: 전체 대화 메시지 목록
 * - conversationSessionId: 현재 대화 세션 ID
 * - 입력 상태 (inputText, currentImage 등)
 */

import React, { createContext, useContext, useState, useRef } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { Audio } from 'expo-av';
import { uploadMedia } from '../api/media';
import { getVqaAnswer } from '../api/ai';
import { recordConversation } from '../api/conversations';
import { synthesizeVoice } from '../api/profiles';
import { useProfileStore } from '../store/useProfileStore';

export interface Message {
  id: string;
  sender: 'child' | 'parent' | 'ai';
  text: string;
  imageUrl?: string;
  imageAspectRatio?: number;
  hasAudio?: boolean;
  audioUrl?: string; // TTS 생성된 오디오 URL (캐싱용)
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
  playMessageAudio: (messageId: string, onFinish?: () => void) => Promise<void>;
  stopAudio: () => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentImageAspectRatio, setCurrentImageAspectRatio] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const conversationSessionIdRef = useRef<string | null>(null);

  // 오디오 객체 관리
  const soundRef = useRef<Audio.Sound | null>(null);

  // 현재 프로필 정보 가져오기
  const currentProfile = useProfileStore((state) => state.currentProfile);

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
      // 아이일 때만 child_name 전달
      console.log('[ChatContext] Profile 정보:', {
        senderType,
        currentProfile,
        profileType: currentProfile?.profileType,
        name: currentProfile?.name
      });

      const childName = senderType === 'child' && currentProfile?.profileType === 'child'
        ? currentProfile.name
        : undefined;

      console.log('[ChatContext] VQA API 호출:', {
        media_id: mediaId,
        question: questionText,
        child_name: childName
      });
      const vqaResult = await getVqaAnswer({
        media_id: mediaId || '',
        question: questionText,
        child_name: childName,
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

  const stopAudio = async () => {
    if (soundRef.current) {
      console.log('[ChatContext] 오디오 정지');
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
  };

  const playMessageAudio = async (messageId: string, onFinish?: () => void) => {
    const message = messages.find((m) => m.id === messageId);
    if (!message || message.sender !== 'ai') {
      console.warn('[ChatContext] 유효하지 않은 메시지:', messageId);
      return;
    }

    try {
      // 기존 사운드가 있으면 정리
      if (soundRef.current) {
        console.log('[ChatContext] 기존 오디오 정리');
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      let fileUri = message.audioUrl;

      // 캐싱된 오디오가 없으면 TTS 요청
      if (!fileUri) {
        if (!currentProfile?.profileId) {
          console.warn('[ChatContext] profileId가 없습니다');
          return;
        }

        console.log('[ChatContext] TTS 요청 시작:', message.text);
        const audioBlob = await synthesizeVoice(
          currentProfile.profileId.toString(),
          { text: message.text }
        );

        // React Native에서는 Blob을 파일로 저장해야 함
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);

        fileUri = await new Promise<string>((resolve, reject) => {
          reader.onloadend = async () => {
            try {
              const base64Audio = (reader.result as string).split(',')[1];

              // 파일로 저장 (캐시 디렉토리)
              const uri = `${FileSystem.cacheDirectory}tts_${messageId}.mp3`;
              await FileSystem.writeAsStringAsync(uri, base64Audio, {
                encoding: FileSystem.EncodingType.Base64,
              });

              console.log('[ChatContext] TTS 완료, fileUri:', uri);

              // 메시지에 audioUrl 캐싱
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === messageId ? { ...m, audioUrl: uri } : m
                )
              );

              resolve(uri);
            } catch (err) {
              reject(err);
            }
          };
          reader.onerror = reject;
        });
      } else {
        console.log('[ChatContext] 캐싱된 오디오 재생:', fileUri);
      }

      // 오디오 재생
      console.log('[ChatContext] 오디오 로드 및 재생 시작');
      const { sound } = await Audio.Sound.createAsync(
        { uri: fileUri },
        { shouldPlay: true }
      );

      soundRef.current = sound;

      // 재생 완료 시 정리
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          console.log('[ChatContext] 오디오 재생 완료');
          sound.unloadAsync();
          soundRef.current = null;
          onFinish?.(); // 콜백 호출
        }
      });

      console.log('[ChatContext] 오디오 재생 중...');
    } catch (error) {
      console.error('[ChatContext] 오디오 재생 에러:', error);
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      onFinish?.(); // 에러 시에도 콜백 호출
    }
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
        playMessageAudio,
        stopAudio,
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
