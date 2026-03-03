'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase, UserRating } from '@/lib/supabase';
import AuthModal from './AuthModal';

interface UserRatingsProps {
  companyName: string;
}

export default function UserRatings({ companyName }: UserRatingsProps) {
  const [ratings, setRatings] = useState<UserRating[]>([]);
  const [userRating, setUserRating] = useState<UserRating | null>(null);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  
  // Form state
  const [environmental, setEnvironmental] = useState(5);
  const [social, setSocial] = useState(5);
  const [governance, setGovernance] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const loadRatings = useCallback(async () => {
    const { data, error } = await supabase
      .from('user_ratings')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('company_name', companyName)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRatings(data);
    }
  }, [companyName]);

  const loadUserRating = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('user_ratings')
      .select('*')
      .eq('company_name', companyName)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single();

    if (data) {
      setUserRating(data);
      setEnvironmental(data.environmental);
      setSocial(data.social);
      setGovernance(data.governance);
      setComment(data.comment || '');
    }
  }, [companyName]);

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        loadUserRating(data.user.id);
      }
    });

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserRating(session.user.id);
      }
    });

    // Load all ratings asynchronously to avoid cascading renders
    const timer = setTimeout(() => {
      loadRatings();
    }, 0);

    return () => {
      clearTimeout(timer);
      authListener.subscription.unsubscribe();
    };
  }, [companyName, loadRatings, loadUserRating]);

  const calculateOverallScore = () => {
    return ((environmental + social + governance) / 3).toFixed(1);
  };

  const calculateCommunityAverage = () => {
    if (ratings.length === 0) return null;
    
    const avg = {
      environmental: ratings.reduce((sum, r) => sum + r.environmental, 0) / ratings.length,
      social: ratings.reduce((sum, r) => sum + r.social, 0) / ratings.length,
      governance: ratings.reduce((sum, r) => sum + r.governance, 0) / ratings.length,
    };

    const overall = (avg.environmental + avg.social + avg.governance) / 3;

    return {
      overall: overall.toFixed(1),
      environmental: avg.environmental.toFixed(1),
      social: avg.social.toFixed(1),
      governance: avg.governance.toFixed(1),
    };
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setShowAuth(true);
      return;
    }

    setLoading(true);

    const overallScore = parseFloat(calculateOverallScore());

    if (userRating) {
      // Update existing rating
      const { error } = await supabase
        .from('user_ratings')
        .update({
          esg_score: overallScore,
          environmental,
          social,
          governance,
          comment: comment.trim() || null,
        })
        .eq('id', userRating.id);

      if (!error) {
        setShowRatingForm(false);
        loadRatings();
        loadUserRating(user.id);
      }
    } else {
      // Create new rating
      const { error } = await supabase
        .from('user_ratings')
        .insert({
          company_name: companyName,
          user_id: user.id,
          esg_score: overallScore,
          environmental,
          social,
          governance,
          comment: comment.trim() || null,
        });

      if (!error) {
        setShowRatingForm(false);
        loadRatings();
        loadUserRating(user.id);
      }
    }

    setLoading(false);
  };

  const handleDeleteRating = async () => {
    if (!user || !userRating) return;

    // Soft delete
    await supabase
      .from('user_ratings')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', userRating.id);

    setUserRating(null);
    setShowRatingForm(false);
    loadRatings();
  };

  const communityAvg = calculateCommunityAverage();

  return (
    <div className="bg-gradient-to-br from-purple-900/50 to-black border-2 border-purple-500 rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-white">
          ⭐ Community ESG Ratings ({ratings.length})
        </h3>
        {user && !showRatingForm && (
          <button
            onClick={() => setShowRatingForm(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            {userRating ? 'Edit My Rating' : 'Rate This Company'}
          </button>
        )}
        {!user && (
          <button
            onClick={() => setShowAuth(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Sign In to Rate
          </button>
        )}
      </div>

      {/* Community Average */}
      {communityAvg && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500 rounded-xl p-6 mb-6"
        >
          <h4 className="text-xl font-bold text-white mb-4">Community Average Score</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400">{communityAvg.overall}</div>
              <div className="text-sm text-gray-400 mt-1">Overall</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{communityAvg.environmental}</div>
              <div className="text-sm text-gray-400 mt-1">Environmental</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">{communityAvg.social}</div>
              <div className="text-sm text-gray-400 mt-1">Social</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">{communityAvg.governance}</div>
              <div className="text-sm text-gray-400 mt-1">Governance</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Rating Form */}
      {showRatingForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          onSubmit={handleSubmitRating}
          className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-6"
        >
          <h4 className="text-xl font-bold text-white mb-4">
            {userRating ? 'Update Your Rating' : 'Rate This Company'}
          </h4>

          {/* Environmental */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              🌍 Environmental: {environmental}/10
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={environmental}
              onChange={(e) => setEnvironmental(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
          </div>

          {/* Social */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              👥 Social: {social}/10
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={social}
              onChange={(e) => setSocial(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Governance */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ⚖️ Governance: {governance}/10
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={governance}
              onChange={(e) => setGovernance(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
            />
          </div>

          {/* Overall Score */}
          <div className="bg-purple-600/20 border border-purple-500 rounded-lg p-4 mb-4">
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">Overall ESG Score</div>
              <div className="text-5xl font-bold text-purple-400">{calculateOverallScore()}/10</div>
            </div>
          </div>

          {/* Comment */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Comment (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share why you gave this rating..."
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all"
            >
              {loading ? 'Saving...' : userRating ? 'Update Rating' : 'Submit Rating'}
            </button>
            <button
              type="button"
              onClick={() => setShowRatingForm(false)}
              className="px-6 bg-gray-700 text-white font-bold py-3 rounded-lg hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
            {userRating && (
              <button
                type="button"
                onClick={handleDeleteRating}
                className="px-6 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-all"
              >
                Delete
              </button>
            )}
          </div>
        </motion.form>
      )}

      {/* Individual Ratings */}
      <div className="space-y-4">
        {ratings.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-lg">No ratings yet. Be the first to rate this company!</p>
          </div>
        ) : (
          ratings.slice(0, 5).map((rating, index) => (
            <motion.div
              key={rating.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 border border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {rating.profile?.full_name?.[0] || rating.profile?.username?.[0] || '?'}
                </div>

                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">
                        {rating.profile?.full_name || rating.profile?.username || 'Anonymous'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(rating.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-purple-400">
                      {rating.esg_score}/10
                    </div>
                  </div>

                  {/* Scores */}
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div className="text-center bg-green-500/10 rounded px-2 py-1">
                      <div className="text-xs text-gray-400">E</div>
                      <div className="text-sm font-bold text-green-400">{rating.environmental}</div>
                    </div>
                    <div className="text-center bg-blue-500/10 rounded px-2 py-1">
                      <div className="text-xs text-gray-400">S</div>
                      <div className="text-sm font-bold text-blue-400">{rating.social}</div>
                    </div>
                    <div className="text-center bg-yellow-500/10 rounded px-2 py-1">
                      <div className="text-xs text-gray-400">G</div>
                      <div className="text-sm font-bold text-yellow-400">{rating.governance}</div>
                    </div>
                  </div>

                  {/* Comment */}
                  {rating.comment && (
                    <p className="text-sm text-gray-300 italic">&quot;{rating.comment}&quot;</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}

        {ratings.length > 5 && (
          <div className="text-center text-gray-400 text-sm">
            + {ratings.length - 5} more ratings
          </div>
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
