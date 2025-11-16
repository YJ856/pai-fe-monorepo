export interface ChildQuizViewModel {
    id: string;
    question: string;
    answer: string;
    hint?: string;
    reward: string;
    authorName: string;
    authorAvatarMediaId: string | null;
    date: Date;
    solved?: boolean;
    childAnswer?: string;
}
