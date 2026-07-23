// Hand-written to mirror packages/vocab-core/migrations/*.sql. Regenerate with
// `supabase gen types typescript` once a real project is linked; this manual
// version keeps local dev unblocked without a live Supabase project.
//
// Every table carries a `Relationships` array (FK name/columns/referenced
// table) because @supabase/postgrest-js's embedded-resource query parser
// (e.g. `.select('word_id, words(term)')`) resolves the joined table type by
// matching against these entries, not just structurally against Row/Insert/
// Update — omitting Relationships (or the top-level Views/Functions) makes
// every query resolve to `never` instead of a real row type.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

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
        Relationships: [];
      };
      words: {
        Row: {
          id: string;
          term: string;
          ipa: string | null;
          meanings: Json;
          examples: Json;
          audio_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          term: string;
          ipa?: string | null;
          meanings?: Json;
          examples?: Json;
          audio_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['words']['Insert']>;
        Relationships: [];
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
        Relationships: [
          {
            foreignKeyName: 'word_tags_word_id_fkey';
            columns: ['word_id'];
            isOneToOne: false;
            referencedRelation: 'words';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'word_tags_exam_id_fkey';
            columns: ['exam_id'];
            isOneToOne: false;
            referencedRelation: 'exam_profiles';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'user_progress_word_id_fkey';
            columns: ['word_id'];
            isOneToOne: false;
            referencedRelation: 'words';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_progress_exam_id_fkey';
            columns: ['exam_id'];
            isOneToOne: false;
            referencedRelation: 'exam_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      questions: {
        Row: {
          id: string;
          exam_id: string;
          part: string;
          question_type: string;
          content: Json;
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
          content: Json;
          correct_answer: string;
          explanation?: string | null;
          audio_url?: string | null;
          source?: string | null;
          difficulty_for_exam?: number | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['questions']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'questions_exam_id_fkey';
            columns: ['exam_id'];
            isOneToOne: false;
            referencedRelation: 'exam_profiles';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'weakness_logs_exam_id_fkey';
            columns: ['exam_id'];
            isOneToOne: false;
            referencedRelation: 'exam_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'weakness_logs_related_question_id_fkey';
            columns: ['related_question_id'];
            isOneToOne: false;
            referencedRelation: 'questions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'weakness_logs_related_word_id_fkey';
            columns: ['related_word_id'];
            isOneToOne: false;
            referencedRelation: 'words';
            referencedColumns: ['id'];
          },
        ];
      };
      speaking_attempts: {
        Row: {
          id: string;
          user_id: string;
          exam_id: string;
          task_type: string;
          audio_url: string | null;
          transcript: string | null;
          rubric_scores: Json;
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
          rubric_scores?: Json;
          ai_feedback?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['speaking_attempts']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'speaking_attempts_exam_id_fkey';
            columns: ['exam_id'];
            isOneToOne: false;
            referencedRelation: 'exam_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      writing_attempts: {
        Row: {
          id: string;
          user_id: string;
          exam_id: string;
          task_type: string;
          submitted_text: string;
          rubric_scores: Json;
          ai_feedback: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          exam_id: string;
          task_type: string;
          submitted_text: string;
          rubric_scores?: Json;
          ai_feedback?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['writing_attempts']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'writing_attempts_exam_id_fkey';
            columns: ['exam_id'];
            isOneToOne: false;
            referencedRelation: 'exam_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
