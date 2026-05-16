import { useQuery } from '@apollo/client';
import { Users, UserCheck, UserX, Wallet, Activity, AlertTriangle, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { DASHBOARD_QUERY } from '../graphql/queries';

interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  expiredMembers: number;
  paidMembers: number;
  unpaidMembers: number;
  monthlyRevenue: number;
  annualRevenue: number;
  newMembersThisMonth: number;
  revenueTrend: Array<{ name: string; value: number }>;
  memberGrowth: Array<{ name: string; value: number }>;
}

interface RecentPayment {
  id: string;
  amount: number;
  month: string;
  member: { fullName: string };
}

interface ExpiryAlert {
  memberId: string;
  memberName: string;
  daysRemaining: number;
  level: string;
  message: string;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(DASHBOARD_QUERY, {
    fetchPolicy: 'cache-and-network',
    pollInterval: 60000,
  });

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <motion.div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary shadow-[0_0_15px_rgba(212,175,55,0.2)]"></motion.div>
    </div>
  );

  if (error) return (
    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
      Error loading dashboard: {error.message}
    </div>
  );

  const stats = (data?.dashboardStats || {}) as DashboardStats;
  const recentPayments = (data?.recentPayments?.results || []) as RecentPayment[];
  const alerts = (data?.membershipExpiryAlerts || []) as ExpiryAlert[];

  const statCards = [
    { title: 'Total Members', value: stats.totalMembers ?? 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'Active Members', value: stats.activeMembers ?? 0, icon: UserCheck, color: 'text-green-400', bg: 'bg-green-400/10' },
    { title: 'Inactive', value: stats.inactiveMembers ?? 0, icon: UserX, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { title: 'Expired', value: stats.expiredMembers ?? 0, icon: Clock, color: 'text-red-400', bg: 'bg-red-400/10' },
    { title: 'Monthly Revenue', value: `Rs.${(stats.monthlyRevenue ?? 0).toLocaleString()}`, icon: Wallet, color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'Paid (This Month)', value: stats.paidMembers ?? 0, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { title: 'Unpaid (Active)', value: stats.unpaidMembers ?? 0, icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  ];

  const alertStyle = (level: string) => {
    if (level === 'today') return 'border-red-500/40 bg-red-500/10 text-red-300';
    if (level === '3_days') return 'border-orange-500/40 bg-orange-500/10 text-orange-300';
    return 'border-yellow-500/40 bg-yellow-500/10 text-yellow-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-textMain tracking-tight">Gym Overview</h1>
          <p className="text-sm text-textMuted font-bold uppercase tracking-widest mt-1">
            Real-time performance · membership validity based
          </p>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="glass-panel p-6 space-y-3">
          <h2 className="text-lg font-black text-textMain flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            Notifications
            <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300">
              {alerts.length}
            </span>
          </h2>
          <div className="space-y-2">
            {alerts.map((a) => (
              <button
                key={a.memberId}
                type="button"
                onClick={() => navigate(`/members/${a.memberId}`)}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-bold transition-colors hover:opacity-90 ${alertStyle(a.level)}`}
              >
                ⚠️ {a.message}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={card.title}
            className="glass-panel p-6 flex items-center justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]"
          >
            <div>
              <p className="text-xs sm:text-sm text-textMuted font-bold uppercase tracking-widest">{card.title}</p>
              <h3 className="text-2xl sm:text-3xl font-black text-textMain mt-2 tracking-tight">{card.value}</h3>
            </div>
            <div className={`p-4 rounded-2xl ${card.bg}`}>
              <card.icon className={`w-8 h-8 ${card.color}`} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-panel p-6"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h3 className="text-xl font-black text-textMain tracking-tight">Revenue Insights</h3>
              <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest mt-1">Growth trends & analytics</p>
            </div>
            <span className="text-[10px] text-primary font-black px-3 py-1 bg-primary/10 rounded-full border border-primary/20 tracking-widest">LIVE</span>
          </div>
          <div className="h-[300px] w-full">
            {(stats.revenueTrend?.length ?? 0) === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-textMuted">
                <p className="font-bold">No revenue data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.revenueTrend}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} />
                  <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} tickFormatter={(v) => `Rs.${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px' }}
                    formatter={(value) => [`Rs.${value ?? 0}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="value" stroke="#d4af37" strokeWidth={3} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-panel p-6"
        >
          <h3 className="text-lg font-black text-textMain mb-6 tracking-tight">Payment History</h3>
          <div className="space-y-4">
            {recentPayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 opacity-40">
                <Wallet className="w-10 h-10 text-textMuted" />
                <p className="text-sm text-textMuted font-bold uppercase tracking-widest">No payments found</p>
              </div>
            ) : (
              recentPayments.slice(0, 4).map((payment) => (
                <div key={payment.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-primary/5 transition-colors group">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Wallet className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-textMain group-hover:text-primary transition-colors">{payment.member.fullName}</p>
                    <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest">
                      Rs.{payment.amount} • {new Date(payment.month).toLocaleString('default', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          <button
            type="button"
            onClick={() => navigate('/payments')}
            className="w-full mt-6 py-2 text-sm text-primary rounded-lg border border-primary/20 hover:bg-primary/10 transition-colors"
          >
            View All Payments
          </button>
        </motion.div>
      </div>
    </div>
  );
}
