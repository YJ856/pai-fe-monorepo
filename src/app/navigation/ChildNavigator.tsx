/**
 * 자녀 앱 네비게이터
 * - 탭 네비게이션: 대화, 퀴즈
 * - 자녀용 화면 스택
 * - 메인 대화 화면: ChatDetail (단일 대화 포커스 모드)
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MessageCircle, FileQuestion } from 'lucide-react-native';
import ChatScreen from '../../screens/child/Chat';
import ChatDetailScreen from '../../screens/child/ChatDetail';
import QuizScreen from '../../screens/child/Quiz';
import { colors } from '../../design/tokens';

export type ChildTabParamList = {
  Chat: undefined;
  Quiz: undefined;
};

export type ChildStackParamList = {
  ChatDetail: undefined;
  ChatList: undefined;
};

const Tab = createBottomTabNavigator<ChildTabParamList>();
const Stack = createNativeStackNavigator<ChildStackParamList>();

function ChatStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ChatDetail" component={ChatDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ChatList" component={ChatScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

export function ChildNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.child.from,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Chat"
        component={ChatStack}
        options={{
          title: '대화',
          tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Quiz"
        component={QuizScreen}
        options={{
          title: '퀴즈',
          tabBarIcon: ({ color, size }) => <FileQuestion size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
