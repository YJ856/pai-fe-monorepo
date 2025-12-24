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

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  LayoutAnimation,
  UIManager,
} from 'react-native';

// Android에서 LayoutAnimation 활성화
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Send, ImageIcon as ImagePlus, Sparkles, X } from 'lucide-react-native';
import { useIsFocused } from '@react-navigation/native';
import { spacing, typography, borderRadius, shadows } from '../../../design/tokens';
import { useChatMessages } from './hooks/useChatMessages';
import { useChatImagePicker } from './hooks/useChatImagePicker';
import { endConversation } from '../../../api/conversations';

const mascotImage = require('../../../assets/images/mascot.png');

const SUGGESTED_QUESTIONS = [
  '아이가 공룡에 관심이 많은데 어떻게 교육하면 좋을까요?',
  '4-7세 아이에게 추천하는 교육 활동은 무엇인가요?',
  '아이의 호기심을 키우는 방법이 궁금해요',
  '퀴즈를 통한 학습 효과에 대해 알려주세요',
];

export default function ParentChatScreen() {
  const isFocused = useIsFocused();
  const previousFocusedRef = useRef(isFocused);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [inputHeight, setInputHeight] = useState(48); // 기본 입력창 높이

  // 메시지 관리 Hook
  const {
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
    conversationSessionId,
    clearChat,
  } = useChatMessages();

  // 이미지 선택 Hook
  const { handleImagePick } = useChatImagePicker(setCurrentImage, setCurrentImageAspectRatio);

  // 키보드 이벤트 처리 - 복귀 문제 해결
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setKeyboardVisible(true);
      }
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

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
    <LinearGradient colors={['#EFF6FF', '#E0E7FF']} style={styles.gradientContainer}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
          enabled={true}
        >
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
                  {message.sender === 'parent' ? (
                    <>
                      {message.imageUrl && (
                        <LinearGradient
                          colors={['#5B9BD5', '#667BC6']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.imageOnlyBubble}
                        >
                          <TouchableOpacity>
                            <Image
                              source={{ uri: message.imageUrl }}
                              style={[
                                styles.messageImage,
                                message.imageAspectRatio ? { aspectRatio: message.imageAspectRatio } : null
                              ]}
                            />
                          </TouchableOpacity>
                        </LinearGradient>
                      )}
                      <LinearGradient
                        colors={['#5B9BD5', '#667BC6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.messageBubble, styles.parentBubble]}
                      >
                        <Text style={[styles.messageText, styles.parentMessageText]}>
                          {message.text}
                        </Text>
                        <Text style={[styles.messageTime, styles.parentMessageTime]}>
                          {message.timestamp.toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </LinearGradient>
                    </>
                  ) : (
                    <View style={[
                      styles.messageBubble,
                      styles.aiBubble,
                      message.imageUrl && styles.messageBubbleWithImage
                    ]}>
                      <View style={styles.aiHeader}>
                        <Image source={mascotImage} style={styles.aiAvatar} />
                        <Text style={styles.aiName}>PAI</Text>
                      </View>
                      {message.imageUrl && (
                        <TouchableOpacity>
                          <Image source={{ uri: message.imageUrl }} style={styles.messageImage} />
                        </TouchableOpacity>
                      )}
                      <Text style={[styles.messageText, styles.aiMessageText]}>
                        {message.text}
                      </Text>
                      <Text style={[styles.messageTime, styles.aiMessageTime]}>
                        {message.timestamp.toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  )}
                </View>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <View style={styles.messageContainer}>
                  <View style={[styles.messageBubble, styles.aiBubble]}>
                    <View style={styles.aiHeader}>
                      <Image source={mascotImage} style={styles.aiAvatar} />
                      <Text style={styles.aiName}>PAI</Text>
                    </View>
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

        {/* Image Preview - Outside Input Container */}
        {currentImage && (
          <LinearGradient
            colors={['#5B9BD5', '#667BC6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.imagePreviewContainer, { bottom: inputHeight + 32 }]}
          >
            <Image
              source={{ uri: currentImage }}
              style={[
                styles.imagePreview,
                currentImageAspectRatio ? { aspectRatio: currentImageAspectRatio } : null
              ]}
            />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => setCurrentImage(null)}
              activeOpacity={0.7}
            >
              <X size={18} color="#5B9BD5" strokeWidth={3} />
            </TouchableOpacity>
          </LinearGradient>
        )}

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TouchableOpacity
              style={styles.imageButton}
              onPress={handleImagePick}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#5B9BD5', '#667BC6']}
                style={styles.imageButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <ImagePlus size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>

            <TextInput
              style={styles.textInput}
              placeholder="메시지를 입력하세요..."
              placeholderTextColor="#9CA3AF"
              value={inputText}
              onChangeText={setInputText}
              onContentSizeChange={(e) => {
                const height = e.nativeEvent.contentSize.height;
                // maxHeight 120을 넘지 않도록 제한
                setInputHeight(Math.min(height, 120));
              }}
              multiline
              maxLength={500}
            />

            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={() => handleSend('parent')}
              disabled={!inputText.trim()}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={inputText.trim() ? ['#5B9BD5', '#667BC6'] : ['#E5E7EB', '#E5E7EB']}
                style={styles.sendButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Send size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    flexGrow: 1,
    padding: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
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
    marginBottom: spacing.md,
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
    marginBottom: 12,
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
    padding: 16,
    ...shadows.md,
  },
  messageBubbleWithImage: {
    maxWidth: '85%',
  },
  imageOnlyBubble: {
    borderRadius: 16,
    padding: 4,
    marginBottom: 4,
    alignSelf: 'flex-end',
    ...shadows.md,
  },
  parentBubble: {
    // backgroundColor handled by LinearGradient
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  aiAvatar: {
    width: 24,
    height: 24,
  },
  aiName: {
    fontSize: 14,
    color: '#6B7280',
  },
  messageImage: {
    width: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  parentMessageText: {
    color: '#FFFFFF',
  },
  aiMessageText: {
    color: '#1F2937',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  parentMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  aiMessageTime: {
    color: '#9CA3AF',
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
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 12,
  },
  imagePreviewContainer: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    zIndex: 200,
    borderRadius: 16,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imagePreview: {
    width: 120,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
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
    overflow: 'hidden',
  },
  imageButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 23,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 120,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
