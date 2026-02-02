'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, DashboardStats, Game, User } from '@/lib/supabase';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { he } from 'date-fns/locale';
import {
  Users,
  Calendar,
  TrendingUp,
  MapPin,
  LogOut,
  BarChart3,
  Activity,
  UserPlus,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentGames, setRecentGames] = useState<Game[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const [usersResult, gamesResult, participantsResult] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('games').select('*', { count: 'exact', head: true }),
        supabase.from('game_participants').select('*', { count: 'exact', head: true }),
      ]);

      const weekStart = format(startOfWeek(new Date()), 'yyyy-MM-dd');

      const [weekGamesResult, weekUsersResult, activeGamesResult] = await Promise.all([
        supabase
          .from('games')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', weekStart),
        supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', weekStart),
        supabase
          .from('games')
          .select('*', { count: 'exact', head: true })
          .in('status', ['open', 'full']),
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        totalGames: gamesResult.count || 0,
        activeGames: activeGamesResult.count || 0,
        totalParticipants: participantsResult.count || 0,
        gamesThisWeek: weekGamesResult.count || 0,
        newUsersThisWeek: weekUsersResult.count || 0,
      });

      // Fetch recent games
      const { data: games } = await supabase
        .from('games')
        .select(`
          *,
          organizer:users!organizer_id (name, profile_photo_url)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentGames(games || []);

      // Fetch recent users
      const { data: users } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentUsers(users || []);

      // Fetch chart data (games per day for last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        return format(date, 'yyyy-MM-dd');
      });

      const chartDataPromises = last7Days.map(async (date) => {
        const { count } = await supabase
          .from('games')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', `${date}T00:00:00`)
          .lt('created_at', `${date}T23:59:59`);

        return {
          date: format(new Date(date), 'EEE', { locale: he }),
          games: count || 0,
        };
      });

      const chartResults = await Promise.all(chartDataPromises);
      setChartData(chartResults);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                קדור ⚽ Admin
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <LogOut size={20} />
              <span>התנתק</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="סה״כ משתמשים"
            value={stats?.totalUsers || 0}
            icon={<Users className="text-primary-500" />}
            trend={`+${stats?.newUsersThisWeek || 0} השבוע`}
          />
          <StatCard
            title="סה״כ משחקים"
            value={stats?.totalGames || 0}
            icon={<Calendar className="text-football-400" />}
            trend={`+${stats?.gamesThisWeek || 0} השבוע`}
          />
          <StatCard
            title="משחקים פעילים"
            value={stats?.activeGames || 0}
            icon={<Activity className="text-orange-500" />}
          />
          <StatCard
            title="הצטרפויות"
            value={stats?.totalParticipants || 0}
            icon={<UserPlus className="text-purple-500" />}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              משחקים ב-7 ימים אחרונים
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: 'none',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="games" fill="#007AFF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              משחקים אחרונים
            </h3>
            <div className="space-y-4">
              {recentGames.map((game) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {game.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {(game.organizer as any)?.name} • {game.format}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {game.current_players}/{game.max_players}
                    </p>
                    <StatusBadge status={game.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            משתמשים חדשים
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-right text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-3 font-medium">שם</th>
                  <th className="pb-3 font-medium">עיר</th>
                  <th className="pb-3 font-medium">עמדה</th>
                  <th className="pb-3 font-medium">משחקים</th>
                  <th className="pb-3 font-medium">הצטרף</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentUsers.map((user) => (
                  <tr key={user.id} className="text-sm">
                    <td className="py-3 font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </td>
                    <td className="py-3 text-gray-600 dark:text-gray-300">
                      {user.city || '-'}
                    </td>
                    <td className="py-3 text-gray-600 dark:text-gray-300">
                      {user.position || '-'}
                    </td>
                    <td className="py-3 text-gray-600 dark:text-gray-300">
                      {user.games_played}
                    </td>
                    <td className="py-3 text-gray-600 dark:text-gray-300">
                      {format(new Date(user.created_at), 'd/M/yy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-500 dark:text-gray-400 text-sm">{title}</span>
        {icon}
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      {trend && (
        <p className="text-sm text-football-400 mt-2 flex items-center gap-1">
          <TrendingUp size={14} />
          {trend}
        </p>
      )}
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const styles = {
    open: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    full: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    completed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
  };

  const labels = {
    open: 'פתוח',
    full: 'מלא',
    cancelled: 'בוטל',
    completed: 'הסתיים',
  };

  return (
    <span
      className={`text-xs px-2 py-1 rounded-full ${styles[status as keyof typeof styles] || styles.open}`}
    >
      {labels[status as keyof typeof labels] || status}
    </span>
  );
}
