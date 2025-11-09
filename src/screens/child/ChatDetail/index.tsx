/**
 * 자녀 모드 Chat Focus 화면
 *
 * 주요 기능:
 * - Focus 모드: 단일 Q&A 상호작용
 * - 이미지 첨부
 * - 음성 재생 토글
 * - 종료 확인 다이얼로그
 *
 * API:
 * - POST /api/conversations/messages (api/conversations.ts)
 */

import React, { useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Send,
  ImageIcon,
  X,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../../../design/components/Button';
import { colors, spacing, typography, borderRadius } from '../../../design/tokens';

interface Message {
  id: string;
  sender: 'child' | 'ai';
  text: string;
  imageUrl?: string;
  hasAudio?: boolean;
  timestamp: Date;
}

export default function ChildChatDetailScreen() {
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState<Message | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewerImage, setViewerImage] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

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
      setCurrentImage(result.assets[0].uri);
    }
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    setCurrentQuestion(inputText);
    setCurrentAnswer(null);
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const answerMessage: Message = {
        id: Date.now().toString(),
        sender: 'ai',
        text: `그거 정말 재밌는 질문이야! 🤔 "${inputText}"에 대해 알려줄게. 이건 아주 흥미로운 주제야!`,
        hasAudio: true,
        timestamp: new Date(),
      };

      setCurrentAnswer(answerMessage);
      setIsLoading(false);
    }, 1500);

    setInputText('');
    setCurrentImage(null);
  };

  const toggleAudioPlayback = () => {
    setIsPlayingAudio(!isPlayingAudio);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[colors.child.bg1, colors.child.bg2]}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowExitDialog(true)}>
            <ArrowLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI와 대화하기</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
          {/* Mascot */}
          <View style={styles.mascotContainer}>
            <View style={styles.mascotPlaceholder} />
          </View>

          {/* Question */}
          {currentQuestion && (
            <View style={styles.questionContainer}>
              {currentImage && (
                <TouchableOpacity onPress={() => {
                  setViewerImage(currentImage);
                  setShowImageViewer(true);
                }}>
                  <Image source={{ uri: currentImage }} style={styles.questionImage} />
                </TouchableOpacity>
              )}
              <View style={styles.questionBubble}>
                <Text style={styles.questionText}>{currentQuestion}</Text>
              </View>
            </View>
          )}

          {/* Loading */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>생각하는 중...</Text>
            </View>
          )}

          {/* Answer */}
          {currentAnswer && (
            <View style={styles.answerContainer}>
              <View style={styles.answerBubble}>
                <Text style={styles.answerText}>{currentAnswer.text}</Text>
              </View>
              {currentAnswer.hasAudio && (
                <TouchableOpacity
                  style={styles.audioButton}
                  onPress={toggleAudioPlayback}
                >
                  {isPlayingAudio ? (
                    <VolumeX size={24} color={colors.child.from} />
                  ) : (
                    <Volume2 size={24} color={colors.child.from} />
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          {currentImage && (
            <View style={styles.attachedImageContainer}>
              <Image source={{ uri: currentImage }} style={styles.attachedImage} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setCurrentImage(null)}
              >
                <X size={16} color={colors.text.inverse} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputRow}>
            <TouchableOpacity
              style={styles.attachButton}
              onPress={handleImageAttach}
            >
              <ImageIcon size={24} color={colors.child.from} />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="질문을 입력하세요..."
              placeholderTextColor={colors.text.tertiary}
              value={inputText}
              onChangeText={setInputText}
              multiline
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                !inputText.trim() && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim()}
            >
              <Send size={24} color={colors.text.inverse} />
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
              <Text style={styles.modalSubtitle}>
                현재 대화 내용이 저장됩니다.
              </Text>

              <View style={styles.modalButtons}>
                <Button
                  variant="outline"
                  onPress={() => setShowExitDialog(false)}
                  style={{ flex: 1 }}
                >
                  취소
                </Button>
                <View style={{ width: spacing.sm }} />
                <Button variant="primary" onPress={() => {}} style={{ flex: 1 }}>
                  종료
                </Button>
              </View>
            </View>
          </View>
        </Modal>

        {/* Image Viewer */}
        <Modal
          visible={showImageViewer}
          transparent
          animationType="fade"
          onRequestClose={() => setShowImageViewer(false)}
        >
          <View style={styles.imageViewerOverlay}>
            <TouchableOpacity
              style={styles.imageViewerClose}
              onPress={() => setShowImageViewer(false)}
            >
              <X size={32} color={colors.text.inverse} />
            </TouchableOpacity>
            {viewerImage && (
              <Image source={{ uri: viewerImage }} style={styles.imageViewerImage} />
            )}
          </View>
        </Modal>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + 40,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    ...typography.h3,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: spacing.lg,
  },
  mascotContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  mascotPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: colors.child.from,
    borderRadius: borderRadius.full,
    opacity: 0.3,
  },
  questionContainer: {
    alignItems: 'flex-end',
    marginBottom: spacing.lg,
  },
  questionImage: {
    width: 200,
    height: 200,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  questionBubble: {
    backgroundColor: colors.child.from,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    maxWidth: '80%',
  },
  questionText: {
    ...typography.body1,
    color: colors.text.inverse,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  loadingText: {
    ...typography.body1,
    color: colors.text.secondary,
  },
  answerContainer: {
    alignItems: 'flex-start',
  },
  answerBubble: {
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    maxWidth: '80%',
  },
  answerText: {
    ...typography.body1,
    color: colors.text.primary,
  },
  audioButton: {
    marginTop: spacing.sm,
    padding: spacing.sm,
  },
  inputContainer: {
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.background.tertiary,
    padding: spacing.md,
  },
  attachedImageContainer: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  attachedImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.status.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  attachButton: {
    padding: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body1,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxHeight: 100,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.child.from,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
  },
  modalTitle: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
  },
  imageViewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerClose: {
    position: 'absolute',
    top: spacing.xl + 40,
    right: spacing.lg,
    zIndex: 1,
  },
  imageViewerImage: {
    width: '90%',
    height: '70%',
    resizeMode: 'contain',
  },
});
