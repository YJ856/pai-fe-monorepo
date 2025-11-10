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

import React, { useState, useRef, useEffect } from 'react';
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
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Send, ImageIcon as ImagePlus, Sparkles } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { spacing, typography, borderRadius, shadows } from '../../../design/tokens';

interface Message {
  id: string;
  sender: 'parent' | 'ai';
  text: string;
  imageUrl?: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  '아이가 공룡에 관심이 많은데 어떻게 교육하면 좋을까요?',
  '4-7세 아이에게 추천하는 교육 활동은 무엇인가요?',
  '아이의 호기심을 키우는 방법이 궁금해요',
  '퀴즈를 통한 학습 효과에 대해 알려주세요',
];

export default function ParentChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCurrentImage(result.assets[0].uri);
    }
  };

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

  const renderLoadingDots = () => {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const animate = (dot: Animated.Value, delay: number) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, {
              toValue: -8,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        ).start();
      };

      animate(dot1, 0);
      animate(dot2, 150);
      animate(dot3, 300);
    }, []);

    return (
      <View style={styles.loadingDots}>
        <Animated.View style={[styles.dot, { transform: [{ translateY: dot1 }] }]} />
        <Animated.View style={[styles.dot, { transform: [{ translateY: dot2 }] }]} />
        <Animated.View style={[styles.dot, { transform: [{ translateY: dot3 }] }]} />
      </View>
    );
  };

  return (
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
                    {renderLoadingDots()}
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
              onPress={handleSend}
              disabled={!inputText.trim()}
              activeOpacity={0.7}
            >
              <Send size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl * 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
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
  loadingDots: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
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
