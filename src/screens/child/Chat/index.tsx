/**
 * 자녀 전체 대화 목록 화면 (채팅 스타일)
 *
 * 주요 기능:
 * - 채팅 스타일 메시지 리스트
 * - 이미지 첨부 지원
 * - 실시간 메시지 전송
 * - 로딩 인디케이터
 *
 * 디자인:
 * - 핑크-오렌지 그라데이션 배경 (#FFE5E0 ~ #FFF0ED)
 * - 자녀 메시지: 그라데이션 말풍선
 * - AI 메시지: 흰색 말풍선, 마스코트 아바타
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Send, ImageIcon, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ChildStackParamList } from '../../../app/navigation/ChildNavigator';
import { spacing, typography, borderRadius, shadows } from '../../../design/tokens';

const mascotImage = require('../../../assets/images/mascot.png');

type ChatListNavigationProp = NativeStackNavigationProp<ChildStackParamList, 'ChatList'>;

interface Message {
  id: string;
  sender: 'child' | 'ai';
  text: string;
  imageUrl?: string;
  timestamp: Date;
}

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    sender: 'ai',
    text: `안녕! 🌱 궁금한 게 있으면 뭐든지 물어봐!`,
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: '2',
    sender: 'child',
    text: '공룡은 왜 멸종했어?',
    timestamp: new Date(Date.now() - 3500000),
  },
  {
    id: '3',
    sender: 'ai',
    text: '아주 오래전에 큰 운석이 지구에 떨어져서 공룡들이 살 수 없게 되었어요. 🌍 운석이 떨어지면서 먼지가 하늘을 덮어서 햇빛이 차단되고, 식물들이 자라지 못했어요.',
    timestamp: new Date(Date.now() - 3400000),
  },
];

export default function ChildChatScreen() {
  const navigation = useNavigation<ChatListNavigationProp>();
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Auto scroll to bottom when messages change
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleImageAttach = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert('카메라 롤 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setCurrentImage(result.assets[0].uri);
    }
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const questionMessage: Message = {
      id: Date.now().toString(),
      sender: 'child',
      text: inputText,
      imageUrl: currentImage || undefined,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, questionMessage]);
    setInputText('');
    setCurrentImage(null);
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const answerMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `그거 정말 재밌는 질문이야! 🤔 "${questionMessage.text}"에 대해 알려줄게. 이건 아주 흥미로운 주제야!`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, answerMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <LinearGradient colors={['#FFE5E0', '#FFF0ED']} style={styles.gradientContainer}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          {/* Header */}
          <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#4a4a4a" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Image source={mascotImage} style={styles.headerMascot} />
            <View>
              <Text style={styles.headerTitle}>전체 대화</Text>
              <Text style={styles.headerSubtitle}>지금까지 나눈 이야기들</Text>
            </View>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesScroll}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyTitle}>아직 대화가 없어요</Text>
              <Text style={styles.emptySubtitle}>궁금한 게 있으면 물어봐주세요!</Text>
            </View>
          ) : (
            <>
              {messages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageContainer,
                    message.sender === 'child'
                      ? styles.childMessageContainer
                      : styles.aiMessageContainer,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      message.sender === 'child' ? styles.childBubble : styles.aiBubble,
                    ]}
                  >
                    {message.sender === 'ai' && (
                      <View style={styles.aiHeader}>
                        <Image source={mascotImage} style={styles.aiAvatar} />
                        <Text style={styles.aiName}>새싹</Text>
                      </View>
                    )}
                    {message.imageUrl && (
                      <Image source={{ uri: message.imageUrl }} style={styles.messageImage} />
                    )}
                    <Text
                      style={[
                        styles.messageText,
                        message.sender === 'child'
                          ? styles.childMessageText
                          : styles.aiMessageText,
                      ]}
                    >
                      {message.text}
                    </Text>
                    <Text
                      style={[
                        styles.messageTime,
                        message.sender === 'child'
                          ? styles.childMessageTime
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
                    <View style={styles.aiHeader}>
                      <Image source={mascotImage} style={styles.aiAvatar} />
                      <Text style={styles.aiName}>새싹</Text>
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

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          {currentImage && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: currentImage }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setCurrentImage(null)}
                activeOpacity={0.7}
              >
                <X size={12} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputRow}>
            <TouchableOpacity
              style={styles.imageButton}
              onPress={handleImageAttach}
              activeOpacity={0.7}
            >
              <ImageIcon size={20} color="#666" />
            </TouchableOpacity>

            <TextInput
              style={styles.textInput}
              placeholder="계속 궁금한 걸 물어봐..."
              placeholderTextColor="#999"
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
              <LinearGradient
                colors={inputText.trim() ? ['#FF6B9D', '#FFA06B'] : ['#ccc', '#ccc']}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    borderRadius: 999,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    gap: 5,
  },
  headerMascot: {
    width: 48,
    height: 48,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    flexGrow: 1,
    padding: 20,
    marginTop: 10,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 3,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    ...typography.h2,
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    ...typography.body1,
    color: '#6B7280',
  },
  messageContainer: {
    marginBottom: 12,
  },
  childMessageContainer: {
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
  childBubble: {
    backgroundColor: 'transparent',
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
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  childMessageText: {
    color: '#FFFFFF',
  },
  aiMessageText: {
    color: '#1F2937',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  childMessageTime: {
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 12,
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
    ...shadows.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
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
