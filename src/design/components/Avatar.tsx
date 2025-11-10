/**
 * Avatar 컴포넌트 (Design_v2 기반)
 *
 * 프로필 아바타 표시
 *
 * 사용 예시:
 * <Avatar emoji="👧" size="lg" />
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius } from '../tokens';

export interface AvatarProps {
  emoji: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  style?: ViewStyle;
}

export function Avatar({ emoji, size = 'md', style }: AvatarProps) {
  return (
    <View style={[styles.avatar, styles[size], style]}>
      <Text style={[styles.emoji, styles[`${size}Emoji`]]}>{emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: colors.muted,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sm: {
    width: 40,
    height: 40,
  },

  md: {
    width: 64,
    height: 64,
  },

  lg: {
    width: 96,
    height: 96,
  },

  xl: {
    width: 128,
    height: 128,
  },

  emoji: {
    textAlign: 'center',
  },

  smEmoji: {
    fontSize: 24,
  },

  mdEmoji: {
    fontSize: 40,
  },

  lgEmoji: {
    fontSize: 60,
  },

  xlEmoji: {
    fontSize: 80,
  },
});
