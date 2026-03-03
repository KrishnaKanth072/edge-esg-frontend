'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalComments: 0,
    totalRatings: 0,
    totalReports: 0,
    pendingModeration: 0,
  });

  useEffect(() => {
    checkAdminAccess();
    loadStats();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'admin' || profile?.role === 'moderator') {
      setIsAdmin(true);
    } else {
      router.push('/');
    }
    
    setLoading(false);
  };

  const loadStats = async () => {
    const [users, comments, ratings, reports, moderation] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('comments').select('id', { count: 'exact', head: true }).is('deleted_at', null),
      supabase.from('user_ratings').select('id', { count: 'exact', head: true }).is('deleted_at', null),
      supabase.from('reports').select('id', { count: 'exact', head: true }).is('deleted_at', null),
      supabase.from('moderation_queue').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);

    setStats({
      totalUsers: users.count || 0,
      totalComments: comments.count || 0,
      totalRatings: ratings.count || 0,
      totalReports: reports.count || 0,
      pendingModeration: moderation.count || 0,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">🛡️ Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon="👥"
            color="blue"
          />
          <StatCard
            title="Comments"
            value={stats.totalComments}
            icon="💬"
            color="green"
          />
          <StatCard
            title="Ratings"
            value={stats.totalRatings}
            icon="⭐"
            color="yellow"
          />
          <StatCard
            title="Reports"
            value={stats.totalReports}
            icon="🚨"
            color="red"
          />
          <StatCard
            title="Pending Review"
            value={stats.pendingModeration}
            icon="⏳"
            color="purple"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ActionCard
            title="User Management"
            description="Manage users, roles, and bans"
            icon="👮"
            href="/admin/users"
          />
          <ActionCard
            title="Content Moderation"
            description="Review flagged comments and ratings"
            icon="🔍"
            href="/admin/moderation"
          />
          <ActionCard
            title="Analytics"
            description="View platform statistics and trends"
            icon="📊"
            href="/admin/analytics"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) {
  const colors = {
    blue: 'from-blue-600 to-blue-800',
    green: 'from-green-600 to-green-800',
    yellow: 'from-yellow-600 to-yellow-800',
    red: 'from-red-600 to-red-800',
    purple: 'from-purple-600 to-purple-800',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color as keyof typeof colors]} rounded-xl p-6 text-white`}>
      <div className="text-4xl mb-2">{icon}</div>
      <div className="text-3xl font-bold mb-1">{value.toLocaleString()}</div>
      <div className="text-sm opacity-90">{title}</div>
    </div>
  );
}

function ActionCard({ title, description, icon, href }: { title: string; description: string; icon: string; href: string }) {
  return (
    <a
      href={href}
      className="bg-gray-800/50 border-2 border-gray-700 rounded-xl p-6 hover:border-purple-500 transition-all group"
    >
      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </a>
  );
}
