/**
 * 카카오맵 API 타입 정의
 */

export interface KakaoPlaceSearchResult {
  documents: KakaoPlace[];
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
}

export interface KakaoPlace {
  id: string;
  place_name: string;
  category_name: string;
  category_group_code: string;
  category_group_name: string;
  phone: string;
  address_name: string;
  road_address_name: string;
  x: string; // longitude
  y: string; // latitude
  place_url: string;
  distance?: string;
}

export interface KakaoPlaceDetail {
  basicInfo: {
    cid: string;
    placenamefull: string;
    mainphotourl?: string;
    phonenum?: string;
    address?: {
      newaddr?: {
        newaddrfull: string;
      };
      region?: {
        fullname: string;
      };
    };
    homepage?: string;
    homepagenoprotocol?: string;
    openHour?: {
      periodList?: Array<{
        timeList?: Array<{
          timeName: string;
          timeSE: string;
          dayOfWeek: string;
        }>;
      }>;
      realtime?: {
        open: string;
        moreOpenOffInfoExists: string;
      };
    };
    feedback?: {
      scoresum: number;
      scorecnt: number;
    };
  };
  comment?: {
    kamapComntcnt?: number;
    blogrvwcnt?: number;
  };
  photo?: {
    photoList?: Array<{
      list: Array<{
        photoid: string;
        orgurl: string;
        imageUrl: string;
      }>;
    }>;
  };
}

export interface PlaceDetailInfo {
  id: string;
  name: string;
  category: string;
  phone: string;
  address: string;
  roadAddress: string;
  latitude: number;
  longitude: number;
  placeUrl: string;
  distance?: string;
  // 추가 상세 정보
  homepage?: string;
  mainPhotoUrl?: string;
  openingHours?: string[];
  isOpen?: boolean;
  rating?: number;
  reviewCount?: number;
  blogReviewCount?: number;
  photos?: string[];
}
