// Hand-written to mirror packages/vocab-core/migrations/*.sql. Regenerate with
// `supabase gen types typescript` once a real project is linked; this manual
// version keeps local dev unblocked without a live Supabase project.

export interface Database {
  public: {
    Tables: {
      exam_profiles: {
        Row: {
          id: string;
          code: string;
          name: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['exam_profiles']['Insert']>;
      };
      words: {
        Row: {
          id: string;
          term: string;
          ipa: string | null;
          meanings: unknown;
          examples: unknown;
          audio_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          term: string;
          ipa?: string | null;
          meanings?: unknown;
          examples?: unknown;
          audio_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['words']['Insert']>;
      };
      word_tags: {
        Row: {
          id: string;
          word_id: string;
          exam_id: string;
          skill: string;
          context: string | null;
          difficulty_for_exam: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          word_id: string;
          exam_id: string;
          skill: string;
          context?: string | null;
          difficulty_for_exam?: number | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['word_tags']['Insert']>;
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          word_id: string;
          exam_id: string;
          is_known_at_onboarding: boolean;
          interval_days: number;
          ease_factor: number;
          repetitions: number;
          lapses: number;
          last_reviewed_at: string | null;
          next_review_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          word_id: string;
          exam_id: string;
          is_known_at_onboarding?: boolean;
          interval_days?: number;
          ease_factor?: number;
          repetitions?: number;
          lapses?: number;
          last_reviewed_at?: string | null;
          next_review_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['user_progress']['Insert']>;
      };
      questions: {
        Row: {
          id: string;
          exam_id: string;
          part: string;
          question_type: string;
          content: unknown;
          correct_answer: string;
          explanation: string | null;
          audio_url: string | null;
          source: string | null;
          difficulty_for_exam: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          exam_id: string;
          part: string;
          question_type: string;
          content: unknown;
          correct_answer: string;
          explanation?: string | null;
          audio_url?: string | null;
          source?: string | null;
          difficulty_for_exam?: number | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['questions']['Insert']>;
      };
      weakness_logs: {
        Row: {
          id: string;
          user_id: string;
          exam_id: string;
          skill: string;
          error_type: string;
          related_question_id: string | null;
          related_word_id: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          exam_id: string;
          skill: string;
          error_type: string;
          related_question_id?: string | null;
          related_word_id?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['weakness_logs']['Insert']>;
      };
      speaking_attempts: {
        Row: {
          id: string;
          user_id: string;
          exam_id: string;
          task_type: string;
          audio_url: string | null;
          transcript: string | null;
          rubric_scores: unknown;
          ai_feedback: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          exam_id: string;
          task_type: string;
          audio_url?: string | null;
          transcript?: string | null;
          rubric_scores?: unknown;
          ai_feedback?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['speaking_attempts']['Insert']>;
      };
      writing_attempts: {
        Row: {
          id: string;
          user_id: string;
          exam_id: string;
          task_type: string;
          submitted_text: string;
          rubric_scores: unknown;
          ai_feedback: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          exam_id: string;
          task_type: string;
          submitted_text: string;
          rubric_scores?: unknown;
          ai_feedback?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['writing_attempts']['Insert']>;
      };
    };
  };
}
