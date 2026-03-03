'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase, Comment } from '@/lib/supabase';
import AuthModal from './AuthModal';

interface CommentSectionProps {
  companyName: string;
}

export default function CommentSection({ companyName }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  const loadComments = useCallback(async () => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('company_name', companyName)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setComments(data);
    }
  }, [companyName]);

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    // Load comments asynchronously to avoid cascading renders
    const timer = setTimeout(() => {
      loadComments();
    }, 0);

    // Subscribe to real-time comment updates
    const channel = supabase
      .channel(`comments:${companyName}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `company_name=eq.${companyName}`,
        },
        () => {
          loadComments();
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timer);
      authListener.subscription.unsubscribe();
      channel.unsubscribe();
    };
  }, [companyName, loadComments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setShowAuth(true);
      return;
    }

    if (!newComment.trim()) return;

    setLoading(true);

    const { error } = await supabase
      .from('comments')
      .insert({
        company_name: companyName,
        user_id: user.id,
        content: newComment.trim(),
      });

    if (!error) {
      setNewComment('');
      loadComments();
    }

    setLoading(false);
  };

  const handleVote = async (commentId: string, voteType: 'up' | 'down') => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('comment_votes')
      .select('*')
      .eq('comment_id', commentId)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single();

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // Remove vote (soft delete)
        await supabase
          .from('comment_votes')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', existingVote.id);
      } else {
        // Change vote
        await supabase
          .from('comment_votes')
          .update({ vote_type: voteType })
          .eq('id', existingVote.id);
      }
    } else {
      // New vote
      await supabase
        .from('comment_votes')
        .insert({
          comment_id: commentId,
          user_id: user.id,
          vote_type: voteType,
        });
    }

    // Update comment vote counts
    const { data: votes } = await supabase
      .from('comment_votes')
      .select('vote_type')
      .eq('comment_id', commentId)
      .is('deleted_at', null);

    const upvotes = votes?.filter(v => v.vote_type === 'up').length || 0;
    const downvotes = votes?.filter(v => v.vote_type === 'down').length || 0;

    await supabase
      .from('comments')
      .update({ upvotes, downvotes })
      .eq('id', commentId);

    loadComments();
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;

    // Soft delete
    await supabase
      .from('comments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', commentId)
      .eq('user_id', user.id);

    loadComments();
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-blue-500 rounded-2xl p-6">
      <h3 className="text-2xl font-bold text-white mb-4">
        💬 Community Discussion ({comments.length})
      </h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={user ? "Share your thoughts..." : "Sign in to comment"}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
          disabled={!user}
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-gray-400">
            {user ? `Posting as ${user.email}` : 'Sign in to join the discussion'}
          </span>
          <button
            type="submit"
            disabled={loading || !user || !newComment.trim()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-lg">No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 border border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {comment.profile?.full_name?.[0] || comment.profile?.username?.[0] || '?'}
                </div>

                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-white">
                      {comment.profile?.full_name || comment.profile?.username || 'Anonymous'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                    {comment.profile?.reputation > 0 && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                        ⭐ {comment.profile.reputation}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <p className="text-gray-300 mb-3">{comment.content}</p>

                  {/* Actions */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleVote(comment.id, 'up')}
                      className="flex items-center gap-1 text-sm text-gray-400 hover:text-green-400 transition-colors"
                    >
                      <span>👍</span>
                      <span>{comment.upvotes}</span>
                    </button>

                    <button
                      onClick={() => handleVote(comment.id, 'down')}
                      className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <span>👎</span>
                      <span>{comment.downvotes}</span>
                    </button>

                    {user?.id === comment.user_id && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-sm text-gray-400 hover:text-red-400 transition-colors ml-auto"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={() => setShowAuth(false)}
      />
    </div>
  );
}
