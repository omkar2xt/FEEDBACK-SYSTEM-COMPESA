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
}
