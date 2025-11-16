// 자녀별 정보
export interface ParentQuizChildViewModel {
    childProfileId: number;
    childName: string;
    childAvatarMediaId: string | null;
    isSolved?: boolean;
    rewardGranted?: boolean;
}

// 부모 퀴즈 카드
export interface ParentQuizViewModel {
    id: string;
    question: string;
    answer: string;
    hint?: string;
    reward: string;
    authorName: string;
    authorAvatarMediaId: string | null;
    publishDate: Date;
    isEditable?: boolean;
    children: ParentQuizChildViewModel[];
}