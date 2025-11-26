/**
 * 부모 AI 대화 화면
 *
 * 주요 기능:
 * - AI와 대화 (육아 조언, 교육 상담)
 * - 메시지 전송/수신
 * - 이미지 첨부
 * - 추천 질문 카드
 * - 로딩 애니메이션
 *
 * 디자인:
 * - 블루 그라데이션 배경 (from-blue-50 to-indigo-50)
 * - 부모 메시지: 파란색 말풍선 (#5B9BD5)
 * - AI 메시지: 흰색 말풍선
 * - 하단 고정 입력창
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Send, ImageIcon as ImagePlus, Sparkles } from 'lucide-react-native';
import { useIsFocused } from '@react-navigation/native';
import { spacing, typography, borderRadius, shadows } from '../../../design/tokens';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useChatImagePicker } from './hooks/useChatImagePicker';
import { endConversation } from '../../../api/conversations';

const SUGGESTED_QUESTIONS = [
  '아이가 공룡에 관심이 많은데 어떻게 교육하면 좋을까요?',
  '4-7세 아이에게 추천하는 교육 활동은 무엇인가요?',
  '아이의 호기심을 키우는 방법이 궁금해요',
  '퀴즈를 통한 학습 효과에 대해 알려주세요',
];

export default function ParentChatScreen() {
  const isFocused = useIsFocused();
  const previousFocusedRef = useRef(isFocused);

  // 메시지 관리 Hook
  const {
    messages,
    inputText,
    setInputText,
    currentImage,
    setCurrentImage,
    isLoading,
    handleSend,
    scrollViewRef,
    conversationSessionId,
    clearChat,
  } = useChatMessages();

  // 이미지 선택 Hook
  const { handleImagePick } = useChatImagePicker(setCurrentImage);

  // Chat 탭을 벗어날 때 대화 종료 처리
  useEffect(() => {
    // 탭에서 벗어날 때 (focused: true -> false)
    if (previousFocusedRef.current && !isFocused && conversationSessionId) {
      console.log('[ParentChat] Chat 탭 벗어남 - 대화 종료:', conversationSessionId);

      // 대화 종료 API 호출
      endConversation({ conversationSessionId })
        .then(() => {
          console.log('[ParentChat] 대화 종료 완료');
        })
        .catch((error: any) => {
          // 404는 이미 종료되었거나 세션이 없는 경우이므로 무시
          if (error?.response?.status === 404) {
            console.log('[ParentChat] 대화 세션이 이미 종료되었거나 존재하지 않음');
          } else {
            console.error('[ParentChat] 대화 종료 에러:', error);
          }
        });

      // 캐시 초기화
      clearChat();
    }

    previousFocusedRef.current = isFocused;
  }, [isFocused, conversationSessionId, clearChat]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <LinearGradient colors={['#EFF6FF', '#E0E7FF']} style={styles.background}>
        {/* Messages Area */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesScroll}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 ? (
            // Empty State
            <View style={styles.emptyState}>
              <LinearGradient
                colors={['#5B9BD5', '#4A8BC2']}
                style={styles.emptyIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Sparkles size={48} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.emptyTitle}>AI와 대화하기</Text>
              <Text style={styles.emptySubtitle}>
                육아에 대한 조언이나 아이 교육에 대해 궁금한 점을 물어보세요
              </Text>

              {/* Suggested Questions */}
              <View style={styles.suggestedGrid}>
                {SUGGESTED_QUESTIONS.map((question, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestedCard}
                    onPress={() => setInputText(question)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.suggestedText}>{question}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            // Messages
            <>
              {messages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageContainer,
                    message.sender === 'parent'
                      ? styles.parentMessageContainer
                      : styles.aiMessageContainer,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      message.sender === 'parent'
                        ? styles.parentBubble
                        : styles.aiBubble,
                    ]}
                  >
                    {message.imageUrl && (
                      <Image source={{ uri: message.imageUrl }} style={styles.messageImage} />
                    )}
                    <Text
                      style={[
                        styles.messageText,
                        message.sender === 'parent'
                          ? styles.parentMessageText
                          : styles.aiMessageText,
                      ]}
                    >
                      {message.text}
                    </Text>
                    <Text
                      style={[
                        styles.messageTime,
                        message.sender === 'parent'
                          ? styles.parentMessageTime
                          : styles.aiMessageTime,
                      ]}
                    >
                      {message.timestamp.toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <View style={styles.messageContainer}>
                  <View style={[styles.messageBubble, styles.aiBubble]}>
                    <View style={styles.loadingContainer}>
                      <View style={styles.loadingBar} />
                      <View style={[styles.loadingBar, { width: 128 }]} />
                    </View>
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          {currentImage && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: currentImage }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setCurrentImage(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.removeImageText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputRow}>
            <TouchableOpacity
              style={styles.imageButton}
              onPress={handleImagePick}
              activeOpacity={0.7}
            >
              <ImagePlus size={20} color="#6B7280" />
            </TouchableOpacity>

            <TextInput
              style={styles.textInput}
              placeholder="메시지를 입력하세요..."
              placeholderTextColor="#9CA3AF"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />

            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={() => handleSend('parent')}
              disabled={!inputText.trim()}
              activeOpacity={0.7}
            >
              <Send size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EFF6FF',
  },
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: 0,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h2,
    color: '#1F2937',
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.body1,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  suggestedGrid: {
    width: '100%',
    gap: spacing.sm,
  },
  suggestedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  suggestedText: {
    ...typography.body2,
    color: '#374151',
  },
  messageContainer: {
    marginBottom: spacing.md,
  },
  parentMessageContainer: {
    alignItems: 'flex-end',
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: spacing.md,
  },
  parentBubble: {
    backgroundColor: '#5B9BD5',
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    ...shadows.sm,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  messageImage: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  messageText: {
    ...typography.body1,
    lineHeight: 24,
  },
  parentMessageText: {
    color: '#FFFFFF',
  },
  aiMessageText: {
    color: '#1F2937',
  },
  messageTime: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  parentMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  aiMessageTime: {
    color: '#6B7280',
  },
  loadingContainer: {
    gap: 8,
  },
  loadingBar: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    width: 160,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: spacing.md,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: spacing.sm,
    alignSelf: 'flex-start',
  },
  imagePreview: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.md,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  imageButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    ...typography.body1,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    maxHeight: 100,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#5B9BD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
});
