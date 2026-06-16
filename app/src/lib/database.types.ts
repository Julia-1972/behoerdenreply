export type CaseStatus =
  | "uploaded"
  | "analyzing"
  | "questioning"
  | "done"
  | "cancelled";

export type Plan = "free" | "payperuse" | "subscription";

export type MessageRole = "ai_question" | "user_answer";

export type PaymentType = "per_document" | "subscription";

export interface Profile {
  id: string;
  language: "ru" | "de";
  plan: Plan;
  free_used: boolean;
  subscription_active: boolean;
  subscription_documents_used: number;
  subscription_period_start: string | null;
  created_at: string;
}

export interface Case {
  id: string;
  user_id: string;
  status: CaseStatus;
  original_pdf_path: string;
  created_at: string;
  completed_at: string | null;
  analysis_summary: string | null;
  error_reason: string | null;
}

export interface CaseMessage {
  id: string;
  case_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
}

export interface CaseResult {
  id: string;
  case_id: string;
  final_text: string;
  pdf_path: string | null;
  docx_path: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  case_id: string | null;
  amount: number;
  type: PaymentType;
  created_at: string;
}
