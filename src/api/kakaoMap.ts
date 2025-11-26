/**
 * 카카오맵 API 서비스
 */
import {
  KakaoPlaceSearchResult,
  PlaceDetailInfo,
} from "../types/kakao-maps";

const KAKAO_REST_API_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY;

/**
 * 키워드로 장소 검색
 * @param query 검색 키워드
 * @param x 중심 경도 (optional)
 * @param y 중심 위도 (optional)
 * @param radius 반경 (meter, optional)
 */
export const searchPlacesByKeyword = async (
  query: string,
  x?: number,
  y?: number,
  radius?: number
): Promise<PlaceDetailInfo[]> => {
  try {
    let url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(
      query
    )}`;

    if (x && y) {
      url += `&x=${x}&y=${y}`;
    }

    if (radius) {
      url += `&radius=${radius}`;
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Kakao API Error: ${response.status}`);
    }

    const data: KakaoPlaceSearchResult = await response.json();

    return data.documents.map((place) => ({
      id: place.id,
      name: place.place_name,
      category: place.category_group_name || place.category_name,
      phone: place.phone,
      address: place.address_name,
      roadAddress: place.road_address_name,
      latitude: parseFloat(place.y),
      longitude: parseFloat(place.x),
      placeUrl: place.place_url,
      distance: place.distance,
    }));
  } catch (error) {
    console.error("Failed to search places:", error);
    throw error;
  }
};

/**
 * 카카오 Static Map 이미지 URL 생성
 * @param latitude 위도
 * @param longitude 경도
 * @param width 이미지 너비 (기본값: 500)
 * @param height 이미지 높이 (기본값: 300)
 */
export const getStaticMapImageUrl = (
  latitude: number,
  longitude: number,
  width: number = 500,
  height: number = 300
): string => {
  // 카카오 Static Map API 사용
  const markerParam = `${longitude},${latitude}`;
  return `https://dapi.kakao.com/v2/maps/staticmap?appkey=${KAKAO_REST_API_KEY}&center=${markerParam}&level=3&size=${width}x${height}&marker=${markerParam}`;
};

/**
 * 추천 장소 이름으로 검색하여 첫 번째 결과 반환
 * @param placeName 장소명
 */
export const searchPlaceByName = async (
  placeName: string
): Promise<PlaceDetailInfo | null> => {
  try {
    const places = await searchPlacesByKeyword(placeName);
    return places.length > 0 ? places[0] : null;
  } catch (error) {
    console.error("Failed to search place by name:", error);
    return null;
  }
};
