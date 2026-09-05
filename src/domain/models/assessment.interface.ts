import { Question } from "./question.interface";

export interface Assessment {
    id: number;
    questions: Question[];
}