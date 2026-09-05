export interface Question {
    id: number;
    text: string;
    type: string;
    category: string;
    difficulty: string;
    options?: string[];
}