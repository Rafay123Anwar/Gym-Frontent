// import { useQuery } from '@apollo/client';
// import { Download, TrendingUp, Users, Activity, Target, ArrowUpRight, Shield, Loader2 } from 'lucide-react';
// import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
// import { motion } from 'framer-motion';

// import { GET_REPORTS_DATA } from '../graphql/queries';

// interface ChartData {
//   name: string;
//   value: number;
// }

// export default function ReportsPage() {
//   const { data, loading, error } = useQuery(GET_REPORTS_DATA, {
//     fetchPolicy: 'cache-and-network'
//   });

//   const stats = data?.dashboardStats;
//   const activities = data?.recentActivities?.results ?? [];

//   const handleExportCSV = () => {
//     const revenueTrend = stats?.revenueTrend || [];
//     const csvContent = "data:text/csv;charset=utf-8,Month,Revenue (Rs.)\n" 
//       + revenueTrend.map((e: ChartData) => `${e.name},${e.value}`).join("\n");
//     const encodedUri = encodeURI(csvContent);
//     const link = document.createElement("a");
//     link.setAttribute("href", encodedUri);
//     link.setAttribute("download", `revenue_report_${new Date().getFullYear()}.csv`);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   if (loading) return (
//     <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
//       <Loader2 className="w-12 h-12 text-primary animate-spin" />
//       <p className="text-textMuted animate-pulse uppercase tracking-[0.2em] font-bold text-[10px]">Compiling Analytics...</p>
//     </div>
//   );

//   if (error) return (
//     <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
//       Failed to load reports: {error.message}
//     </div>
//   );

//   return (
//     <div className="space-y-8">
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div>
//           <h1 className="text-3xl font-bold text-textMain">Membership Analytics</h1>
//           <p className="text-textMuted mt-1">Revenue insights and member activity reports</p>
//         </div>
//         <button 
//           onClick={handleExportCSV} 
//           className="btn-secondary flex items-center bg-white/5 border-white/10 hover:bg-white/10"
//         >
//           <Download className="w-5 h-5 mr-2" />
//           Download Data
//         </button>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {[
//           { label: 'Annual Revenue', value: `Rs.${stats.annualRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-primary', trend: '+12%' },
//           { label: 'Growth This Month', value: `+${stats.newMembersThisMonth}`, icon: Activity, color: 'text-emerald-400', trend: '+5%' },
//           { label: 'Active Members', value: stats.activeMembers ?? 0, icon: Target, color: 'text-blue-400', trend: `${stats.expiredMembers ?? 0} expired` },
//           { label: 'System Health', value: 'OPTIMAL', icon: Shield, color: 'text-purple-400', trend: '100%' },
//         ].map((item, i) => (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: i * 0.1 }}
//             key={item.label}
//             className="glass-panel p-6 border-white/5 relative group overflow-hidden"
//           >
//             <div className="flex items-center justify-between mb-4">
//               <item.icon className={`w-5 h-5 ${item.color}`} />
//               <span className="flex items-center text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
//                 <ArrowUpRight className="w-3 h-3 mr-1" /> {item.trend}
//               </span>
//             </div>
//             <p className="text-xs font-bold text-textMuted uppercase tracking-widest">{item.label}</p>
//             <h3 className="text-2xl font-black text-white mt-2">{item.value}</h3>
//           </motion.div>
//         ))}
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         <motion.div 
//           initial={{ opacity: 0, scale: 0.95 }}
//           animate={{ opacity: 1, scale: 1 }}
//           className="glass-panel p-8 min-h-[450px]"
//         >
//           <div className="flex justify-between items-center mb-10">
//             <h3 className="text-lg font-bold text-white flex items-center">
//               <TrendingUp className="w-5 h-5 mr-3 text-primary" />
//               Revenue Performance
//             </h3>
//             <div className="text-[10px] font-black text-textMuted uppercase tracking-tighter">Rolling 12 Months</div>
//           </div>
//           <div className="h-[300px]">
//             <ResponsiveContainer width="100%" height="100%">
//               <AreaChart data={stats.revenueTrend}>
//                 <defs>
//                   <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
//                     <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
//                   </linearGradient>
//                 </defs>
//                 <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
//                 <XAxis dataKey="name" stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false} />
//                 <YAxis stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `Rs.${v}`} />
//                 <Tooltip 
//                   contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
//                   itemStyle={{ color: '#d4af37' }}
//                 />
//                 <Area type="monotone" dataKey="value" stroke="#d4af37" strokeWidth={3} fill="url(#revenueGradient)" />
//               </AreaChart>
//             </ResponsiveContainer>
//           </div>
//         </motion.div>

//         <motion.div 
//           initial={{ opacity: 0, scale: 0.95 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ delay: 0.2 }}
//           className="glass-panel p-8 min-h-[450px]"
//         >
//           <div className="flex justify-between items-center mb-10">
//             <h3 className="text-lg font-bold text-white flex items-center">
//               <Users className="w-5 h-5 mr-3 text-blue-400" />
//               Membership Growth
//             </h3>
//             <div className="text-[10px] font-black text-textMuted uppercase tracking-tighter">Registration Volume</div>
//           </div>
//           <div className="h-[300px]">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={stats.memberGrowth}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
//                 <XAxis dataKey="name" stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false} />
//                 <YAxis stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false} />
//                 <Tooltip 
//                   contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
//                   cursor={{ fill: 'rgba(255,255,255,0.05)' }}
//                 />
//                 <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </motion.div>
//       </div>

//       <motion.div className="glass-panel p-8">
//         <h3 className="text-lg font-bold text-textMain mb-6">Member Activity</h3>
//         {activities.length === 0 ? (
//           <p className="text-textMuted text-sm">No activity available</p>
//         ) : (
//           <ul className="space-y-3">
//             {activities.map((a: { id: string; description: string; createdAt: string }) => (
//               <li key={a.id} className="text-sm text-textMain border-b border-white/5 pb-2">
//                 {a.description}
//                 <span className="block text-[10px] text-textMuted mt-1">
//                   {new Date(a.createdAt).toLocaleString()}
//                 </span>
//               </li>
//             ))}
//           </ul>
//         )}
//       </motion.div>

//       <motion.div 
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="glass-panel p-8"
//       >
//         <h3 className="text-lg font-bold text-textMain mb-6">Historical Data Summary</h3>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
//           {[
//             { label: 'Avg Monthly Revenue', value: `Rs.${(stats.annualRevenue / 12).toFixed(0)}` },
//             { label: 'Highest Revenue', value: `Rs.${Math.max(...stats.revenueTrend.map((t: ChartData) => t.value)).toLocaleString()}` },
//             { label: 'Lowest Revenue', value: `Rs.${Math.min(...stats.revenueTrend.map((t: ChartData) => t.value)).toLocaleString()}` },
//             { label: 'Total Registrations', value: stats.totalMembers },
//           ].map(item => (
//             <div key={item.label}>
//               <p className="text-[10px] font-black text-textMuted uppercase tracking-tighter mb-1">{item.label}</p>
//               <p className="text-xl font-bold text-white">{item.value}</p>
//             </div>
//           ))}
//         </div>
//       </motion.div>
//     </div>
//   );
// }





import { useState } from 'react';

import { useQuery } from '@apollo/client';

import {
  Download,
  TrendingUp,
  Users,
  Activity,
  Target,
  ArrowUpRight,
  Shield,
  Loader2
} from 'lucide-react';

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';

import { motion } from 'framer-motion';

import { GET_REPORTS_DATA } from '../graphql/queries';

interface ChartData {
  name: string;
  value: number;
}

interface ActivityItem {
  id: string;
  description: string;
  createdAt: string;
}

export default function ReportsPage() {

  const { data, loading, error } = useQuery(
    GET_REPORTS_DATA,
    {
      fetchPolicy: 'cache-and-network'
    }
  );

  const stats = data?.dashboardStats;

  const activities =
    data?.recentActivities?.results ?? [];

  // PAGINATION
  const [activityPage, setActivityPage] =
    useState(1);

  const activityPerPage = 5;

  const totalActivityPages = Math.ceil(
    activities.length / activityPerPage
  );

  const activityStartIndex =
    (activityPage - 1) *
    activityPerPage;

  const paginatedActivities =
    activities.slice(
      activityStartIndex,
      activityStartIndex +
        activityPerPage
    );

  const handleExportCSV = () => {

    const revenueTrend =
      stats?.revenueTrend || [];

    const csvContent =
      'data:text/csv;charset=utf-8,Month,Revenue (Rs.)\n' +
      revenueTrend
        .map(
          (e: ChartData) =>
            `${e.name},${e.value}`
        )
        .join('\n');

    const encodedUri =
      encodeURI(csvContent);

    const link =
      document.createElement('a');

    link.setAttribute(
      'href',
      encodedUri
    );

    link.setAttribute(
      'download',
      `revenue_report_${new Date().getFullYear()}.csv`
    );

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">

        <Loader2 className="w-12 h-12 text-primary animate-spin" />

        <p className="text-textMuted animate-pulse uppercase tracking-[0.2em] font-bold text-[10px]">
          Compiling Analytics...
        </p>

      </div>
    );

  if (error)
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">

        Failed to load reports:
        {' '}
        {error.message}

      </div>
    );

  return (

    <div className="space-y-8">

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

        <div>

          <h1 className="text-3xl font-bold text-textMain">
            Membership Analytics
          </h1>

          <p className="text-textMuted mt-1">
            Revenue insights and member activity reports
          </p>

        </div>

        <button
          onClick={handleExportCSV}
          className="btn-secondary flex items-center bg-white/5 border-white/10 hover:bg-white/10"
        >

          <Download className="w-5 h-5 mr-2" />

          Download Data

        </button>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {[
          {
            label: 'Annual Revenue',
            value: `Rs.${stats.annualRevenue.toLocaleString()}`,
            icon: TrendingUp,
            color: 'text-primary',
            trend: '+12%'
          },

          {
            label: 'Growth This Month',
            value: `+${stats.newMembersThisMonth}`,
            icon: Activity,
            color: 'text-emerald-400',
            trend: '+5%'
          },

          {
            label: 'Active Members',
            value:
              stats.activeMembers ?? 0,
            icon: Target,
            color: 'text-blue-400',
            trend: `${stats.expiredMembers ?? 0} expired`
          },

          {
            label: 'System Health',
            value: 'OPTIMAL',
            icon: Shield,
            color: 'text-purple-400',
            trend: '100%'
          },

        ].map((item, i) => (

          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              delay: i * 0.1
            }}
            key={item.label}
            className="glass-panel p-6 border-white/5 relative group overflow-hidden"
          >

            <div className="flex items-center justify-between mb-4">

              <item.icon
                className={`w-5 h-5 ${item.color}`}
              />

              <span className="flex items-center text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">

                <ArrowUpRight className="w-3 h-3 mr-1" />

                {item.trend}

              </span>

            </div>

            <p className="text-xs font-bold text-textMuted uppercase tracking-widest">

              {item.label}

            </p>

            <h3 className="text-2xl font-black text-white mt-2">

              {item.value}

            </h3>

          </motion.div>

        ))}

      </div>

      {/* CHARTS */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* REVENUE */}

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95
          }}
          animate={{
            opacity: 1,
            scale: 1
          }}
          className="glass-panel p-8 min-h-[450px]"
        >

          <div className="flex justify-between items-center mb-10">

            <h3 className="text-lg font-bold text-white flex items-center">

              <TrendingUp className="w-5 h-5 mr-3 text-primary" />

              Revenue Performance

            </h3>

            <div className="text-[10px] font-black text-textMuted uppercase tracking-tighter">

              Rolling 12 Months

            </div>

          </div>

          <div className="h-[300px]">

            <ResponsiveContainer width="100%" height="100%">

              <AreaChart data={stats.revenueTrend}>

                <defs>

                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >

                    <stop
                      offset="5%"
                      stopColor="#d4af37"
                      stopOpacity={0.3}
                    />

                    <stop
                      offset="95%"
                      stopColor="#d4af37"
                      stopOpacity={0}
                    />

                  </linearGradient>

                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  stroke="#4b5563"
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  stroke="#4b5563"
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    `Rs.${v}`
                  }
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111',
                    border:
                      '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px'
                  }}
                  itemStyle={{
                    color: '#d4af37'
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#d4af37"
                  strokeWidth={3}
                  fill="url(#revenueGradient)"
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>

        </motion.div>

        {/* MEMBERSHIP GROWTH */}

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95
          }}
          animate={{
            opacity: 1,
            scale: 1
          }}
          transition={{
            delay: 0.2
          }}
          className="glass-panel p-8 min-h-[450px]"
        >

          <div className="flex justify-between items-center mb-10">

            <h3 className="text-lg font-bold text-white flex items-center">

              <Users className="w-5 h-5 mr-3 text-blue-400" />

              Membership Growth

            </h3>

            <div className="text-[10px] font-black text-textMuted uppercase tracking-tighter">

              Registration Volume

            </div>

          </div>

          <div className="h-[300px]">

            <ResponsiveContainer width="100%" height="100%">

              <BarChart data={stats.memberGrowth}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  stroke="#4b5563"
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  stroke="#4b5563"
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111',
                    border:
                      '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px'
                  }}
                  cursor={{
                    fill:
                      'rgba(255,255,255,0.05)'
                  }}
                />

                <Bar
                  dataKey="value"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </motion.div>

      </div>

      {/* MEMBER ACTIVITY */}

      <motion.div className="glass-panel p-8">

        <h3 className="text-lg font-bold text-textMain mb-6">

          Member Activity

        </h3>

        {paginatedActivities.length === 0 ? (

          <p className="text-textMuted text-sm">

            No activity available

          </p>

        ) : (

          <>
            <ul className="space-y-3">

              {paginatedActivities.map(
                (a: ActivityItem) => (

                  <li
                    key={a.id}
                    className="text-sm text-textMain border-b border-white/5 pb-3"
                  >

                    {a.description}

                    <span className="block text-[10px] text-textMuted mt-1">

                      {new Date(
                        a.createdAt
                      ).toLocaleString()}

                    </span>

                  </li>

                )
              )}

            </ul>

            {/* PAGINATION */}

            {totalActivityPages > 1 && (

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">

                <div className="text-sm text-textMuted font-bold">

                  Page
                  {' '}
                  {activityPage}
                  {' '}
                  of
                  {' '}
                  {totalActivityPages}

                </div>

                <div className="flex items-center gap-2 flex-wrap justify-center">

                  <button
                    onClick={() =>
                      setActivityPage(
                        (prev) =>
                          Math.max(
                            prev - 1,
                            1
                          )
                      )
                    }
                    disabled={
                      activityPage === 1
                    }
                    className="px-4 py-2 rounded-xl border border-primary/20 hover:bg-primary/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >

                    Previous

                  </button>

                  {Array.from(
                    {
                      length:
                        totalActivityPages
                    },
                    (_, i) => i + 1
                  ).map((page) => (

                    <button
                      key={page}
                      onClick={() =>
                        setActivityPage(
                          page
                        )
                      }
                      className={`w-10 h-10 rounded-xl font-bold transition-all ${
                        activityPage ===
                        page
                          ? 'bg-primary text-black'
                          : 'border border-primary/20 text-textMain hover:bg-primary/10'
                      }`}
                    >

                      {page}

                    </button>

                  ))}

                  <button
                    onClick={() =>
                      setActivityPage(
                        (prev) =>
                          Math.min(
                            prev + 1,
                            totalActivityPages
                          )
                      )
                    }
                    disabled={
                      activityPage ===
                      totalActivityPages
                    }
                    className="px-4 py-2 rounded-xl border border-primary/20 hover:bg-primary/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >

                    Next

                  </button>

                </div>

              </div>

            )}

          </>
        )}

      </motion.div>

      {/* SUMMARY */}

      <motion.div
        initial={{
          opacity: 0,
          y: 20
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        className="glass-panel p-8"
      >

        <h3 className="text-lg font-bold text-textMain mb-6">

          Historical Data Summary

        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          {[
            {
              label:
                'Avg Monthly Revenue',

              value: `Rs.${(
                stats.annualRevenue /
                12
              ).toFixed(0)}`
            },

            {
              label:
                'Highest Revenue',

              value: `Rs.${Math.max(
                ...stats.revenueTrend.map(
                  (
                    t: ChartData
                  ) => t.value
                )
              ).toLocaleString()}`
            },

            {
              label:
                'Lowest Revenue',

              value: `Rs.${Math.min(
                ...stats.revenueTrend.map(
                  (
                    t: ChartData
                  ) => t.value
                )
              ).toLocaleString()}`
            },

            {
              label:
                'Total Registrations',

              value:
                stats.totalMembers
            },

          ].map((item) => (

            <div key={item.label}>

              <p className="text-[10px] font-black text-textMuted uppercase tracking-tighter mb-1">

                {item.label}

              </p>

              <p className="text-xl font-bold text-white">

                {item.value}

              </p>

            </div>

          ))}

        </div>

      </motion.div>

    </div>

  );
}