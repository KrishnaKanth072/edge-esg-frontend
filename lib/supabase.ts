import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Profile {
  internal_id: number;
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  reputation: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Comment {
  internal_id: number;
  id: string;
  company_name: string;
  user_id: string;
  content: string;
  upvotes: number;
  downvotes: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  profile?: Profile;
}

export interface UserRating {
  internal_id: number;
  id: string;
  company_name: string;
  user_id: string;
  esg_score: number;
  environmental: number;
  social: number;
  governance: number;
  comment: string | null;
  created_at: string;
  deleted_at: string | null;
  profile?: Profile;
}

export interface CommentVote {
  internal_id: number;
  id: string;
  comment_id: string;
  user_id: string;
  vote_type: 'up' | 'down';
  created_at: string;
  deleted_at: string | null;
}

export interface Report {
  internal_id: number;
  id: string;
  company_name: string;
  user_id: string;
  report_type: string;
  title: string;
  description: string;
  evidence_url: string | null;
  status: 'pending' | 'verified' | 'rejected';
  upvotes: number;
  created_at: string;
  deleted_at: string | null;
  profile?: Profile;
}
