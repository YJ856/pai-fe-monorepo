/**
 * 자녀 모드 Chat Focus 화면
 *
 * 웹 디자인 완전 변환:
 * - 포커스 모드: 단일 Q&A 카드 형식
 * - 마스코트 애니메이션
 * - 진행 표시줄
 * - 핑크-오렌지 그라디언트 (#FF6B9D ~ #FFA06B)
 * - 전체 대화 목록 버튼
 * - 이미지 첨부 및 뷰어
 * - 음성 재생
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
  Modal,
  Animated,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Volume2,
  VolumeX,
  Send,
  ImageIcon,
  X,
  MessageSquare,
  List,
  LogOut,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ChildStackParamList } from '../../../app/navigation/ChildNavigator';
import { Button } from '../../../design/components/Button';
import { colors, spacing, typography, borderRadius, shadows } from '../../../design/tokens';
import { useChatContext, type Message } from '../../../contexts/ChatContext';
import { endConversation } from '../../../api/conversations';

const mascotImage = require('../../../assets/images/mascot.png');

type ChatDetailNavigationProp = NativeStackNavigationProp<ChildStackParamList, 'ChatDetail'>;

export default function ChildChatDetailScreen() {
  const navigation = useNavigation<ChatDetailNavigationProp>();

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
    handleSend: contextHandleSend,
    conversationSessionId,
    clearChat,
  } = useChatContext();

  // ChatDetail 전용 로컬 state
  const [currentQuestionMessage, setCurrentQuestionMessage] = useState<Message | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState<Message | null>(null);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewerImage, setViewerImage] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // 마스코트 bounce 애니메이션
  const bounceAnim = useRef(new Animated.Value(0)).current;

  // Progress bar 애니메이션
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Bounce 애니메이션
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -20,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Progress bar 애니메이션 효과
  useEffect(() => {
    const targetProgress = getProgress();
    Animated.timing(progressAnim, {
      toValue: targetProgress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [currentQuestionMessage, currentAnswer, isLoading]);

  const handleImageAttach = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert('카메라 롤 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      const width = result.assets[0].width;
      const height = result.assets[0].height;
      const aspectRatio = width && height ? width / height : 1;

      setCurrentImage(imageUri);
      setCurrentImageAspectRatio(aspectRatio);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    // 키보드 내리기
    Keyboard.dismiss();

    // ChatDetail용: 현재 표시 초기화
    setCurrentQuestionMessage(null);
    setCurrentAnswer(null);

    // Context의 handleSend 호출 (실제 API 통신 및 messages 업데이트)
    await contextHandleSend('child');
  };

  // messages가 업데이트되면 ChatDetail의 currentQuestionMessage와 currentAnswer 업데이트
  useEffect(() => {
    if (messages.length >= 2) {
      // 마지막 2개 메시지 (질문, 답변)
      const lastQuestion = messages[messages.length - 2];
      const lastAnswer = messages[messages.length - 1];

      if (lastQuestion.sender === 'child' && lastAnswer.sender === 'ai') {
        setCurrentQuestionMessage(lastQuestion);
        setCurrentAnswer(lastAnswer);
      }
    } else if (messages.length === 0) {
      // messages가 비어있으면 (대화 종료 후) 로컬 state도 초기화
      setCurrentQuestionMessage(null);
      setCurrentAnswer(null);
    }
  }, [messages]);

  const handleExit = () => {
    if (currentQuestionMessage || currentAnswer) {
      setShowExitDialog(true);
    }
  };

  const confirmExit = async () => {
    try {
      // 1. endConversation API 호출 (conversationSessionId가 있을 때만)
      if (conversationSessionId) {
        console.log('[ChatDetail] endConversation 호출:', conversationSessionId);
        await endConversation({ conversationSessionId });
        console.log('[ChatDetail] 대화 종료 완료');
      }

      // 2. Context 캐시 초기화
      clearChat();

      // 3. 로컬 state 초기화
      setCurrentQuestionMessage(null);
      setCurrentAnswer(null);
      setShowExitDialog(false);

      // 4. 대화 종료 완료 - 새로운 대화 시작 가능
    } catch (error: any) {
      // 404는 이미 종료되었거나 세션이 없는 경우이므로 무시
      if (error?.response?.status === 404) {
        console.log('[ChatDetail] 대화 세션이 이미 종료되었거나 존재하지 않음');
      } else {
        console.error('[ChatDetail] 대화 종료 에러:', error);
      }
      // 에러가 나도 일단 캐시는 지우고 초기화
      clearChat();
      setCurrentQuestionMessage(null);
      setCurrentAnswer(null);
      setShowExitDialog(false);
    }
  };

  const toggleAudioPlayback = () => {
    setIsPlayingAudio(!isPlayingAudio);
  };

  // 진행률 계산
  const getProgress = () => {
    if (isLoading && !currentAnswer) return 0.5;
    if (currentAnswer) return 1;
    if (currentQuestionMessage) return 0.5;
    return 0;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <LinearGradient
          colors={['#FFE5E0', '#FFF0ED']}
          style={styles.background}
        >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
            <LogOut size={24} color="#FF6B9D" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('ChatList')}
            style={styles.chatListButton}
          >
            <LinearGradient
              colors={['#FF6B9D', '#FFA06B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.chatListGradient}
            >
              <MessageSquare size={16} color="#fff" />
              <Text style={styles.chatListText}>전체 대화</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {!currentQuestionMessage && !currentAnswer && !isLoading && (
            /* Mascot - Only show in empty state */
            <Animated.View
              style={[
                styles.mascotContainer,
                { transform: [{ translateY: bounceAnim }] },
              ]}
            >
              <Image source={mascotImage} style={styles.mascot} />
            </Animated.View>
          )}

          {!currentQuestionMessage && !currentAnswer && !isLoading ? (
            /* Empty State */
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>궁금한 걸 물어봐!</Text>
              <Text style={styles.emptySubtitle}>무엇이든 질문해도 좋아요</Text>
            </View>
          ) : (
            /* Q&A Card */
            <ScrollView style={styles.qaCard} contentContainerStyle={styles.qaCardContent}>
              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBackground}>
                  <Animated.View
                    style={{
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                      height: '100%',
                    }}
                  >
                    <LinearGradient
                      colors={['#FF6B9D', '#FFA06B']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.progressBar}
                    />
                  </Animated.View>
                </View>
              </View>

              {/* Question Section */}
              {currentQuestionMessage && (
                <View style={styles.questionSection}>
                  <View style={styles.questionHeader}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>질문</Text>
                    </View>
                  </View>

                  <View style={styles.questionContent}>
                    {currentQuestionMessage.imageUrl && (
                      <View style={styles.questionImageContainer}>
                        <TouchableOpacity
                          onPress={() => {
                            setViewerImage(currentQuestionMessage.imageUrl!);
                            setShowImageViewer(true);
                          }}
                        >
                          <Image
                            source={{ uri: currentQuestionMessage.imageUrl }}
                            style={[
                              styles.questionImage,
                              currentQuestionMessage.imageAspectRatio ? { aspectRatio: currentQuestionMessage.imageAspectRatio } : null
                            ]}
                          />
                        </TouchableOpacity>
                      </View>
                    )}

                    <Text style={styles.questionText}>{currentQuestionMessage.text}</Text>
                  </View>
                </View>
              )}

              {/* Answer Section */}
              {(currentAnswer || (isLoading && currentQuestionMessage)) && (
                <View style={styles.answerSection}>
                  {/* Divider */}
                  <View style={styles.divider} />

                  <View style={styles.answerHeader}>
                    <View style={[styles.badge, styles.badgeAnswer]}>
                      <Text style={styles.badgeText}>답변</Text>
                    </View>
                    {currentAnswer?.hasAudio && (
                      <TouchableOpacity
                        style={styles.audioButton}
                        onPress={toggleAudioPlayback}
                      >
                        <LinearGradient
                          colors={['#FF6B9D', '#FFA06B']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.audioGradient}
                        >
                          {isPlayingAudio ? (
                            <VolumeX size={16} color="#fff" />
                          ) : (
                            <Volume2 size={16} color="#fff" />
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                    )}
                  </View>

                  {isLoading && !currentAnswer ? (
                    <View style={styles.loadingContainer}>
                      <View style={styles.loadingBar} />
                      <View style={[styles.loadingBar, { width: '90%' }]} />
                      <View style={[styles.loadingBar, { width: '70%' }]} />
                    </View>
                  ) : currentAnswer ? (
                    <Text style={styles.answerText}>{currentAnswer.text}</Text>
                  ) : null}
                </View>
              )}
            </ScrollView>
          )}
        </View>

        {/* Image Preview - Outside Input Container */}
        {currentImage && (
          <LinearGradient
            colors={['#FF6B9D', '#FFA06B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.attachedImagePreview}
          >
            <Image
              source={{ uri: currentImage }}
              style={[
                styles.attachedImage,
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
              style={styles.attachButton}
              onPress={handleImageAttach}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#FF6B9D', '#FFA06B']}
                style={styles.attachButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <ImageIcon size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="궁금한 걸 물어봐..."
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                inputText.trim() && styles.sendButtonActive,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim()}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={inputText.trim() ? ['#FF6B9D', '#FFA06B'] : ['#E5E7EB', '#E5E7EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.sendGradient}
              >
                <Send size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Exit Dialog */}
        <Modal
          visible={showExitDialog}
          transparent
          animationType="fade"
          onRequestClose={() => setShowExitDialog(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>대화를 종료할까요?</Text>
              <Text style={styles.modalSubtitle}>현재 대화 내용이 사라집니다.</Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButtonOutline}
                  onPress={() => setShowExitDialog(false)}
                >
                  <Text style={styles.modalButtonOutlineText}>취소</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalButtonPrimary} onPress={confirmExit}>
                  <LinearGradient
                    colors={['#FF6B9D', '#FFA06B']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.modalButtonGradient}
                  >
                    <Text style={styles.modalButtonPrimaryText}>종료</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Image Viewer */}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFE5E0',
  },
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: spacing.md,
    paddingBottom: 5,
  },
  exitButton: {
    padding: 8,
    borderRadius: 999,
  },
  chatListButton: {
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  chatListGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    gap: 8,
  },
  chatListText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  mascotContainer: {
    marginBottom: 16,
  },
  mascot: {
    width: 120,
    height: 120,
  },
  emptyState: {
    alignItems: 'center',
    maxWidth: 400,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  emptySubtitle: {
    fontSize: 18,
    color: '#666',
  },
  qaCard: {
    width: '100%',
    maxWidth: 370,
    backgroundColor: '#fff',
    borderRadius: 24,
    maxHeight: '95%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  qaCardContent: {
    padding: 24,
    flexGrow: 1,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBackground: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 999,
  },
  section: {
    marginBottom: 3,
  },
  questionSection: {
    flex: 1,
  },
  questionContent: {
    flex: 1,
    justifyContent: 'center',
  },
  answerSection: {
    flex: 1,
    justifyContent: 'center',
  },
  badge: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 107, 157, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 10,
  },
  badgeAnswer: {
    backgroundColor: 'rgba(255, 160, 107, 0.2)',
  },
  badgeText: {
    fontSize: 12,
    color: '#4a4a4a',
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questionImageContainer: {
    alignItems: 'center',
    marginTop: -8,
    marginBottom: 20,
  },
  questionImage: {
    width: 100,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  questionText: {
    fontSize: 19,
    textAlign: 'center',
    color: '#333',
    lineHeight: 28,
  },
  divider: {
    height: 2,
    backgroundColor: '#e5e7eb',
    marginVertical: 15,
    borderStyle: 'dashed',
  },
  loadingContainer: {
    // gap: 12,
  },
  loadingBar: {
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    width: '100%',
  },
  answerText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#555',
    lineHeight: 28,
  },
  audioButton: {
    marginBottom: 15,
  },
  audioGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 999,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 12,
    zIndex: 100,
    elevation: 100,
  },
  attachedImagePreview: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    zIndex: 200,
    elevation: 200,
    borderRadius: 16,
    padding: 6,
  },
  attachedImage: {
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
    maxWidth: 672,
    marginHorizontal: 'auto',
  },
  attachButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  attachButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
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
  sendButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  sendGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButtonOutline: {
    flex: 1,
    height: 48,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonOutlineText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  modalButtonPrimary: {
    flex: 1,
    height: 48,
    borderRadius: 999,
    overflow: 'hidden',
  },
  modalButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
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
