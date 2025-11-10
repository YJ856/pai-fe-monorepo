/**
 * 개발용 임시 네비게이터 화면
 * - 모든 페이지로 직접 이동 가능
 * - 디자인 확인용
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function DevNavigatorScreen() {
  const navigation = useNavigation<any>();

  const sections = [
    {
      title: '네비게이터',
      routes: [
        { label: '인증 화면들', navigator: 'Auth' },
        { label: '프로필 화면들', navigator: 'Profile' },
        { label: '자녀 앱', navigator: 'ChildApp' },
        { label: '부모 앱', navigator: 'ParentApp' },
      ],
    },
  ];

  const navigateToNavigator = (navigator: string) => {
    try {
      navigation.navigate(navigator);
    } catch (error) {
      console.error(`Failed to navigate to ${navigator}:`, error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>개발용 페이지 네비게이터</Text>
        <Text style={styles.subtitle}>디자인 확인을 위한 임시 화면입니다</Text>
      </View>

      {sections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.routes.map((route, routeIndex) => (
            <TouchableOpacity
              key={routeIndex}
              style={styles.button}
              onPress={() => navigateToNavigator(route.navigator)}
            >
              <Text style={styles.buttonText}>{route.label}</Text>
              <Text style={styles.buttonSubtext}>{route.navigator}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          * 각 네비게이터로 이동하면 해당 영역의 화면들을 확인할 수 있습니다
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  button: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  buttonSubtext: {
    fontSize: 12,
    color: '#999',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
