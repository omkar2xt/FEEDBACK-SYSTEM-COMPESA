export type Mood = "happy" | "neutral" | "sad";
export type SentimentLabel = "Positive" | "Neutral" | "Negative";

export type OverallExperience = "Excellent" | "Good" | "Average" | "Poor";
export type LearningOutcome = "Yes, a lot" | "Some useful things" | "Not really";
export type MostUsefulTopic =
  | "Mini Projects"
  | "GitHub"
  | "LinkedIn"
  | "Latest Technologies"
  | "Career Guidance";
export type ClarityLevel = "Very clear" | "Somewhat clear" | "Difficult";
export type EngagementLevel = "Very engaging" | "Okay" | "Boring";
export type SpeakerSupportLevel = "Excellent" | "Good" | "Average" | "Needs improvement";
export type ImpactPlan =
  | "Learning coding"
  | "Building a project"
  | "Creating GitHub"
  | "Improving skills";
export type RecommendationChoice = "Yes" | "Maybe" | "No";

// ============================================
// MULTI-YEAR & DYNAMIC QUESTION TYPES
// ============================================

export type YearCode = "FY" | "SY" | "TY" | "BTECH";

export interface YearItem {
  id: string;
  code: YearCode;
  label: string;
  displayOrder: number;
  isOpen: boolean;
}

export interface SessionItem {
  id: string;
  yearId: string;
  title: string;
  description?: string;
  sessionDate?: string;
  venue?: string;
  feedbackOpen: boolean;
}

export type QuestionType =
  | "short_text"
  | "paragraph"
  | "star_rating"
  | "emoji_rating"
  | "yes_no"
  | "single_choice"
  | "multiple_choice"
  | "dropdown";

export interface QuestionItem {
  id: string;
  yearId: string;
  label: string;
  questionType: QuestionType;
  options: string[];
  placeholder?: string;
  helperText?: string;
  isRequired: boolean;
  orderIndex: number;
}

export interface AnswerInput {
  questionId: string;
  answerValue: any;
}

export interface MultiYearResponseInput {
  sessionId: string;
  yearId: string;
  studentName: string;
  division: string;
  rollNo: string;
  overallRating?: number;
  recommendation?: RecommendationChoice;
  answers: AnswerInput[];
}

export interface AnswerRecord {
  id?: string;
  responseId?: string;
  questionId: string;
  questionLabel?: string;
  questionType?: QuestionType;
  answerValue: any;
}

export interface ResponseRecord {
  id: string;
  sessionId: string;
  yearId: string;
  yearCode?: YearCode;
  yearLabel?: string;
  sessionTitle?: string;
  studentName: string;
  division: string;
  rollNo: string;
  overallRating: number;
  recommendation: RecommendationChoice;
  sentiment: SentimentLabel;
  submittedAt: number;
  answers?: AnswerRecord[];
}

// Legacy Feedback Input & Record
export interface FeedbackInput {
  name: string;
  email: string;
  mood: Mood;
  rating: number;
  category: "UX" | "Performance" | "Features" | "Support";
  message: string;
  wouldRecommend: boolean;
  followUp?: string;
  overallExperience: OverallExperience;
  learningOutcome: LearningOutcome;
  mostUsefulTopic: MostUsefulTopic;
  clarity: ClarityLevel;
  engagement: EngagementLevel;
  speakerSupport: SpeakerSupportLevel;
  impactPlan: ImpactPlan;
  impactPlans: ImpactPlan[];
  recommendation: RecommendationChoice;
  suggestions?: string;
}

export interface AnalysisResult {
  sentiment: SentimentLabel;
  score: number;
  summary: string;
  suggestions: string[];
  thankYouMessage: string;
}

export interface FeedbackRecord extends FeedbackInput {
  id?: string;
  createdAt: number;
  sentiment: SentimentLabel;
  sentimentScore: number;
  summary: string;
  // Multi-year fields (optional for backward compatibility)
  yearCode?: YearCode;
  sessionTitle?: string;
  division?: string;
  rollNo?: string;
}
