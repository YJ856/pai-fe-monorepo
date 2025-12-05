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

import React, { useEffect, useRef, useState } from 'react';
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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Send, ImageIcon, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ChildStackParamList } from '../../../app/navigation/ChildNavigator';
import { spacing, typography, borderRadius, shadows } from '../../../design/tokens';
import { useChatContext } from '../../../contexts/ChatContext';

const mascotImage = require('../../../assets/images/mascot.png');
const mascotPinkImage = require('../../../assets/images/mascot_pink.png');

type ChatListNavigationProp = NativeStackNavigationProp<ChildStackParamList, 'ChatList'>;

export default function ChildChatScreen() {
  const navigation = useNavigation<ChatListNavigationProp>();
  const scrollViewRef = useRef<ScrollView>(null);

  // Context에서 공용 데이터 사용
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
  } = useChatContext();

  // 이미지 뷰어 상태
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewerImage, setViewerImage] = useState<string | null>(null);

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
      const imageUri = result.assets[0].uri;
      const width = result.assets[0].width;
      const height = result.assets[0].height;
      const aspectRatio = width && height ? width / height : 1;

      console.log('Selected image URI:', imageUri, 'Size:', width, 'x', height, 'AspectRatio:', aspectRatio);
      setCurrentImage(imageUri);
      setCurrentImageAspectRatio(aspectRatio);
    }
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
            <ArrowLeft size={28} color="#FF6B9D" />
          </TouchableOpacity>
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
              <Image source={mascotPinkImage} style={styles.emptyMascot} />
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
                  {message.sender === 'child' ? (
                    <>
                      {message.imageUrl && (
                        <LinearGradient
                          colors={['#FF6B9D', '#FFA06B']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.imageOnlyBubble}
                        >
                          <TouchableOpacity
                            onPress={() => {
                              setViewerImage(message.imageUrl!);
                              setShowImageViewer(true);
                            }}
                          >
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
                        colors={['#FF6B9D', '#FFA06B']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.messageBubble, styles.childBubble]}
                      >
                        <Text style={[styles.messageText, styles.childMessageText]}>
                          {message.text}
                        </Text>
                        <Text style={[styles.messageTime, styles.childMessageTime]}>
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
                        <TouchableOpacity
                          onPress={() => {
                            setViewerImage(message.imageUrl!);
                            setShowImageViewer(true);
                          }}
                        >
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
            colors={['#FF6B9D', '#FFA06B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.imagePreviewContainer}
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
              <X size={18} color="#FF6B9D" strokeWidth={3} />
            </TouchableOpacity>
          </LinearGradient>
        )}

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TouchableOpacity
              style={styles.imageButton}
              onPress={handleImageAttach}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#FF6B9D', '#FFA06B']}
                style={styles.imageButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <ImageIcon size={20} color="#FFFFFF" />
              </LinearGradient>
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
              onPress={() => handleSend('child')}
              disabled={!inputText.trim()}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={inputText.trim() ? ['#FF6B9D', '#FFA06B'] : ['#E5E7EB', '#E5E7EB']}
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

      {/* Image Viewer - Outside SafeAreaView */}
      <Modal
        visible={showImageViewer}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowImageViewer(false)}
      >
        <TouchableOpacity
          style={styles.imageViewerOverlay}
          activeOpacity={1}
          onPress={() => setShowImageViewer(false)}
        >
          {viewerImage && (
            <Image source={{ uri: viewerImage }} style={styles.imageViewerImage} />
          )}
        </TouchableOpacity>
      </Modal>
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
    paddingVertical: 10,
    paddingTop: spacing.md,
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
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 3,
  },
  emptyMascot: {
    width: 120,
    height: 120,
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
  childBubble: {
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
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 12,
  },
  imagePreviewContainer: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    zIndex: 200,
    elevation: 200,
    borderRadius: 16,
    padding: 6,
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
    gap: 8,
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
  imageViewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerImage: {
    width: '90%',
    height: '70%',
    resizeMode: 'contain',
  },
});
