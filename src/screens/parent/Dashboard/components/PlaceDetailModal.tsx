/**
 * 장소 상세 정보 모달
 *
 * 주요 기능:
 * - 카카오맵 API로 검색한 장소 정보 표시
 * - 장소명, 주소, 전화번호, 카테고리 등 표시
 * - 카카오맵으로 이동 버튼
 */

import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Linking,
  Alert,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
} from "../../../../design/tokens";
import { PlaceDetailInfo } from "../../../../types/kakao-maps";
import { searchPlaceByName } from "../../../../api/kakaoMap";

interface PlaceDetailModalProps {
  visible: boolean;
  placeName: string;
  onClose: () => void;
}

export default function PlaceDetailModal({
  visible,
  placeName,
  onClose,
}: PlaceDetailModalProps) {
  const [placeInfo, setPlaceInfo] = useState<PlaceDetailInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && placeName) {
      fetchPlaceInfo();
    } else if (!visible) {
      // 모달이 닫힐 때 상태 초기화
      setPlaceInfo(null);
      setError(null);
    }
  }, [visible, placeName]);

  const fetchPlaceInfo = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Searching for place:", placeName);
      const info = await searchPlaceByName(placeName);
      console.log("Place info received:", info);

      if (info) {
        setPlaceInfo(info);
      } else {
        setError("장소 정보를 찾을 수 없습니다.");
      }
    } catch (err) {
      console.error("Failed to fetch place info:", err);
      setError("장소 정보를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenKakaoMap = async () => {
    if (!placeInfo) return;

    try {
      const url = placeInfo.placeUrl;
      const canOpen = await Linking.canOpenURL(url);

      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert("알림", "카카오맵을 열 수 없습니다.");
      }
    } catch (error) {
      console.error("Failed to open Kakao Map:", error);
      Alert.alert("오류", "카카오맵을 여는 중 오류가 발생했습니다.");
    }
  };

  const handleCall = async () => {
    if (!placeInfo?.phone) {
      Alert.alert("알림", "전화번호가 없습니다.");
      return;
    }

    try {
      const phoneNumber = placeInfo.phone.replace(/[^0-9]/g, "");
      const url = `tel:${phoneNumber}`;
      const canOpen = await Linking.canOpenURL(url);

      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert("알림", "전화를 걸 수 없습니다.");
      }
    } catch (error) {
      console.error("Failed to make call:", error);
      Alert.alert("오류", "전화 연결 중 오류가 발생했습니다.");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {placeInfo?.name || "장소 정보"}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
          >
            {isLoading ? (
              <View style={styles.centerContent}>
                <ActivityIndicator size="large" color={colors.parent.from} />
                <Text style={styles.loadingText}>
                  장소 정보를 불러오는 중...
                </Text>
              </View>
            ) : error ? (
              <View style={styles.centerContent}>
                <Ionicons
                  name="alert-circle-outline"
                  size={48}
                  color={colors.text.secondary}
                />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={fetchPlaceInfo}
                >
                  <Text style={styles.retryButtonText}>다시 시도</Text>
                </TouchableOpacity>
              </View>
            ) : placeInfo ? (
              <View style={styles.placeInfoContainer}>
                {/* Address */}
                {placeInfo.address && (
                  <View style={styles.infoSection}>
                    <View style={styles.iconWrapper}>
                      <Ionicons
                        name="map-outline"
                        size={20}
                        color={colors.text.secondary}
                      />
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>주소</Text>
                      <Text style={styles.infoValue}>{placeInfo.address}</Text>
                      {placeInfo.roadAddress && (
                        <Text style={styles.infoValueSecondary}>
                          {placeInfo.roadAddress}
                        </Text>
                      )}
                    </View>
                  </View>
                )}

                {/* Phone */}
                {placeInfo.phone && (
                  <TouchableOpacity
                    style={styles.infoSection}
                    onPress={handleCall}
                  >
                    <View style={styles.iconWrapper}>
                      <Ionicons
                        name="call-outline"
                        size={20}
                        color={colors.text.secondary}
                      />
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>전화번호</Text>
                      <Text style={[styles.infoValue, styles.linkText]}>
                        {placeInfo.phone}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={colors.text.secondary}
                    />
                  </TouchableOpacity>
                )}

                {/* Distance */}
                {placeInfo.distance && (
                  <View style={styles.infoSection}>
                    <View style={styles.iconWrapper}>
                      <Ionicons
                        name="navigate-outline"
                        size={20}
                        color={colors.text.secondary}
                      />
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>거리</Text>
                      <Text style={styles.infoValue}>
                        {(parseInt(placeInfo.distance) / 1000).toFixed(1)}km
                      </Text>
                    </View>
                  </View>
                )}

                {/* Map Preview */}
                <TouchableOpacity
                  style={styles.mapContainer}
                  onPress={handleOpenKakaoMap}
                  activeOpacity={0.9}
                >
                  <Text style={styles.mapLabel}>
                    위치 (탭하여 카카오맵에서 보기)
                  </Text>
                  <WebView
                    originWhitelist={["*"]}
                    source={{
                      html: `
                        <!DOCTYPE html>
                        <html>
                          <head>
                            <meta charset="utf-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
                            <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.EXPO_PUBLIC_KAKAO_JS_API_KEY}"></script>
                            <style>
                              * { margin: 0; padding: 0; box-sizing: border-box; }
                              html, body {
                                width: 100%;
                                height: 100%;
                                overflow: hidden;
                              }
                              #map {
                                width: 100%;
                                height: 100%;
                              }
                            </style>
                          </head>
                          <body>
                            <div id="map"></div>
                            <script>
                              setTimeout(function() {
                                try {
                                  var container = document.getElementById('map');
                                  var options = {
                                    center: new kakao.maps.LatLng(${placeInfo.latitude}, ${placeInfo.longitude}),
                                    level: 3,
                                    disableDoubleClickZoom: true,
                                    draggable: false,
                                    scrollwheel: false
                                  };
                                  var map = new kakao.maps.Map(container, options);

                                  var markerPosition = new kakao.maps.LatLng(${placeInfo.latitude}, ${placeInfo.longitude});
                                  var marker = new kakao.maps.Marker({
                                    position: markerPosition
                                  });
                                  marker.setMap(map);
                                } catch(e) {
                                  console.error('Map error:', e);
                                }
                              }, 100);
                            </script>
                          </body>
                        </html>
                      `,
                    }}
                    style={styles.mapWebView}
                    scrollEnabled={false}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    scalesPageToFit={true}
                    pointerEvents="none"
                  />
                </TouchableOpacity>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: borderRadius["2xl"],
    width: "95%",
    maxWidth: 800,

    height: "90%",

    ...shadows.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h3,
    fontSize: 18,
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.md,
  },
  closeButton: {
    padding: spacing.xs,
  },
  scrollContent: {
    flex: 1,
    padding: spacing.lg,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl * 2,
  },
  loadingText: {
    ...typography.body1,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  errorText: {
    ...typography.body1,
    color: colors.text.secondary,
    marginTop: spacing.md,
    textAlign: "center",
  },
  retryButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.parent.from,
    borderRadius: borderRadius.lg,
  },
  retryButtonText: {
    ...typography.button,
    color: "#fff",
  },
  placeInfoContainer: {
    gap: spacing.sm,
  },
  infoSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  iconWrapper: {
    width: 32,
    alignItems: "center",
    paddingTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  placeName: {
    ...typography.h3,
    fontSize: 20,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  category: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  infoLabel: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  infoValue: {
    ...typography.body1,
    color: colors.text.primary,
  },
  infoValueSecondary: {
    ...typography.body2,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  linkText: {
    color: colors.parent.from,
  },
  mapContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  mapLabel: {
    ...typography.h4,
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  mapWebView: {
    width: "100%",
    height: 400,
    borderRadius: borderRadius.lg,
    backgroundColor: "#f3f4f6",
    overflow: "hidden",
  },
});
