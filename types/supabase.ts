// Supabase Database Types
// These types are generated based on your Supabase schema
// You can regenerate these types using the Supabase CLI or by updating them manually

export interface Database {
  public: {
    Tables: {
      contacts: {
        Row: {
          id: string;
          fullname: string;
          email: string;
          subject: string;
          message: string;
          ip_address: string;
          user_agent: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          fullname: string;
          email: string;
          subject: string;
          message: string;
          ip_address: string;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          fullname?: string;
          email?: string;
          subject?: string;
          message?: string;
          ip_address?: string;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      temoignages: {
        Row: {
          id: string;
          prenom: string;
          age: number;
          scam_type: 'phishing' | 'romance' | 'fake-shop' | 'investment' | 'tech-support' | 'sms-livraison' | 'lottery' | 'fake-job' | 'identity' | 'harassment' | 'autre';
          incident_date: string;
          content: string;
          ip_address: string;
          user_agent: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          prenom: string;
          age: number;
          scam_type: 'phishing' | 'romance' | 'fake-shop' | 'investment' | 'tech-support' | 'sms-livraison' | 'lottery' | 'fake-job' | 'identity' | 'harassment' | 'autre';
          incident_date: string;
          content: string;
          ip_address: string;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          prenom?: string;
          age?: number;
          scam_type?: 'phishing' | 'romance' | 'fake-shop' | 'investment' | 'tech-support' | 'sms-livraison' | 'lottery' | 'fake-job' | 'identity' | 'harassment' | 'autre';
          incident_date?: string;
          content?: string;
          ip_address?: string;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      analysis_history: {
        Row: {
          id: string;
          input_type: string;
          input_value: string;
          score: number;
          risk: string;
          scam_types: string[];
          reported: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          input_type: string;
          input_value: string;
          score: number;
          risk: string;
          scam_types?: string[];
          reported?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          input_type?: string;
          input_value?: string;
          score?: number;
          risk?: string;
          scam_types?: string[];
          reported?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      admin_audit_log: {
        Row: {
          id: string;
          action: string;
          target: string;
          details: Record<string, unknown> | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          action: string;
          target: string;
          details?: Record<string, unknown> | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          action?: string;
          target?: string;
          details?: Record<string, unknown> | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      analyzer_blacklist: {
        Row: {
          id: string;
          value: string;
          type: string;
          reason: string;
          added_by: string;
          added_at: string;
        };
        Insert: {
          id?: string;
          value: string;
          type: string;
          reason: string;
          added_by?: string;
          added_at?: string;
        };
        Update: {
          id?: string;
          value?: string;
          type?: string;
          reason?: string;
          added_by?: string;
          added_at?: string;
        };
        Relationships: [];
      };
      analyzer_whitelist: {
        Row: {
          id: string;
          value: string;
          type: string;
          reason: string;
          added_by: string;
          added_at: string;
        };
        Insert: {
          id?: string;
          value: string;
          type: string;
          reason: string;
          added_by?: string;
          added_at?: string;
        };
        Update: {
          id?: string;
          value?: string;
          type?: string;
          reason?: string;
          added_by?: string;
          added_at?: string;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          scam_type: 'phishing' | 'romance' | 'fake-shop' | 'investment' | 'tech-support' | 'sms-livraison' | 'lottery' | 'fake-job' | 'identity' | 'harassment' | 'autre';
          incident_date: string;
          description: string;
          amount: number | null;
          contact_email: string | null;
          receive_copy: boolean;
          need_help: boolean;
          ip_address: string;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          scam_type: 'phishing' | 'romance' | 'fake-shop' | 'investment' | 'tech-support' | 'sms-livraison' | 'lottery' | 'fake-job' | 'identity' | 'harassment' | 'autre';
          incident_date: string;
          description: string;
          amount?: number | null;
          contact_email?: string | null;
          receive_copy?: boolean;
          need_help?: boolean;
          ip_address: string;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          scam_type?: 'phishing' | 'romance' | 'fake-shop' | 'investment' | 'tech-support' | 'sms-livraison' | 'lottery' | 'fake-job' | 'identity' | 'harassment' | 'autre';
          incident_date?: string;
          description?: string;
          amount?: number | null;
          contact_email?: string | null;
          receive_copy?: boolean;
          need_help?: boolean;
          ip_address?: string;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      chat_messages: {
        Row: {
          id: string;
          session_id: string;
          text: string;
          sender: 'user' | 'admin';
          timestamp: string;
        };
        Insert: {
          id: string;
          session_id: string;
          text: string;
          sender: 'user' | 'admin';
          timestamp: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          text?: string;
          sender?: 'user' | 'admin';
          timestamp?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
