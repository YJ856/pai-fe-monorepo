/**
 * 부모 앱 네비게이터
 * - 탭 네비게이션: 대화, 퀴즈, 대시보드, 프로필
 * - 부모용 화면 스택 (대시보드 내 활동 서브 라우트 포함)
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MessageCircle, FileQuestion, LayoutDashboard, User } from 'lucide-react-native';
import ChatScreen from '../../screens/parent/Chat';
import QuizScreen from '../../screens/parent/Quiz';
import DashboardScreen from '../../screens/parent/Dashboard';
import ProfileScreen from '../../screens/parent/Profile';
import { colors } from '../../design/tokens';

// TODO: 대시보드 활동 서브 스크린 import
// import ActivityCalendarScreen from '../../screens/parent/Dashboard/ActivityCalendar';
// import ActivityGalleryScreen from '../../screens/parent/Dashboard/ActivityGallery';
// import ActivityDetailScreen from '../../screens/parent/Dashboard/ActivityDetail';

export type ParentTabParamList = {
  Chat: undefined;
  Quiz: undefined;
  Dashboard: undefined;
  Profile: undefined;
};

export type ParentStackParamList = {
  DashboardMain: undefined;
  ActivityCalendar: undefined;
  ActivityGallery: { date: string };
  ActivityDetail: { conversationId: string };
};

const Tab = createBottomTabNavigator<ParentTabParamList>();
const Stack = createNativeStackNavigator<ParentStackParamList>();

function DashboardStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="DashboardMain" component={DashboardScreen} options={{ headerShown: false }} />
      {/* TODO: 활동 서브 스크린 추가 */}
      {/* <Stack.Screen name="ActivityCalendar" component={ActivityCalendarScreen} options={{ title: '활동 달력' }} />
      <Stack.Screen name="ActivityGallery" component={ActivityGalleryScreen} options={{ title: '갤러리' }} />
      <Stack.Screen name="ActivityDetail" component={ActivityDetailScreen} options={{ title: '대화 상세' }} /> */}
    </Stack.Navigator>
  );
}

export function ParentNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.parent.from,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
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
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{
          title: '대시보드',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: '프로필',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
