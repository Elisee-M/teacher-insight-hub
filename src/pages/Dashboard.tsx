import { useMemo, useEffect, useState } from 'react';
import { Users, CheckCircle2, XCircle, Clock, TrendingUp, LogOut, LogIn } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { useTeachers } from '@/hooks/useTeachers';
import { calculateAttendanceStats } from '@/utils/attendanceAnalyzer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ref, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import { parseAttendanceStatus } from '@/utils/statusParser';

export default function Dashboard() {
  const { teachers, loading } = useTeachers();
  const [todayStats, setTodayStats] = useState({
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    leftEarlyToday: 0,
    leftOnTimeToday: 0,
  });

  useEffect(() => {
    const fetchTodayStats = async () => {
      try {
        const teachersRef = ref(database, 'teachers');
        const snapshot = await get(teachersRef);
        const teachersData = snapshot.val();
        
        if (!teachersData) {
          return;
        }

        let present = 0;
        let absent = 0;
        let late = 0;
        let leftEarly = 0;
        let leftOnTime = 0;

        Object.values(teachersData).forEach((teacher: any) => {
          const status = (teacher.status || '').toLowerCase();
          
          // Count present if status contains "present"
          if (status.includes('present')) {
            present++;
          }
          
          // Count absent if status contains "absent"
          if (status.includes('absent')) {
            absent++;
          }
          
          // Count late if status contains "late"
          if (status.includes('late')) {
            late++;
          }
          
          // Count left early if status contains "left_early" or "left early"
          if (status.includes('left_early') || status.includes('left early')) {
            leftEarly++;
          }
          
          // Count left on time if status contains "left_on_time" or "left on time"
          if (status.includes('left_on_time') || status.includes('left on time')) {
            leftOnTime++;
          }
        });

        setTodayStats({
          presentToday: present,
          absentToday: absent,
          lateToday: late,
          leftEarlyToday: leftEarly,
          leftOnTimeToday: leftOnTime,
        });
      } catch (error) {
        console.error('Error fetching today stats:', error);
      }
    };

    if (!loading) {
      fetchTodayStats();
    }
  }, [loading]);

  const stats = useMemo(() => {
    let totalAttendanceRate = 0;

    teachers.forEach((teacher) => {
      const teacherStats = calculateAttendanceStats(teacher.attendanceRecords);
      totalAttendanceRate += teacherStats.attendanceRate;
    });

    const avgAttendanceRate = teachers.length > 0 ? totalAttendanceRate / teachers.length : 0;

    return {
      totalTeachers: teachers.length,
      ...todayStats,
      avgAttendanceRate: avgAttendanceRate.toFixed(1),
    };
  }, [teachers, todayStats]);

  const pieData = [
    { name: 'Absent', value: stats.absentToday, color: 'hsl(var(--destructive))' },
    { name: 'Late', value: stats.lateToday, color: 'hsl(var(--warning))' },
    { name: 'Left Early', value: stats.leftEarlyToday, color: 'hsl(var(--info))' },
    { name: 'Left On Time', value: stats.leftOnTimeToday, color: 'hsl(var(--primary))' },
  ];

  const barData = [
    { name: 'Present', count: stats.presentToday, fill: 'hsl(var(--success))' },
    { name: 'Absent', count: stats.absentToday, fill: 'hsl(var(--destructive))' },
    { name: 'Late', count: stats.lateToday, fill: 'hsl(var(--warning))' },
    { name: 'Left Early', count: stats.leftEarlyToday, fill: 'hsl(var(--info))' },
    { name: 'Left On Time', count: stats.leftOnTimeToday, fill: 'hsl(var(--primary))' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Teacher Attendance Dashboard</h1>
          <p className="text-muted-foreground">Real-time attendance monitoring and analysis</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <StatCard
            title="Total Teachers"
            value={stats.totalTeachers}
            icon={Users}
            colorClass="text-primary"
          />
          <StatCard
            title="Present Today"
            value={stats.presentToday}
            icon={CheckCircle2}
            colorClass="text-success"
          />
          <StatCard
            title="Absent Today"
            value={stats.absentToday}
            icon={XCircle}
            colorClass="text-destructive"
          />
          <StatCard
            title="Late Today"
            value={stats.lateToday}
            icon={Clock}
            colorClass="text-warning"
          />
          <StatCard
            title="Left Early Today"
            value={stats.leftEarlyToday}
            icon={LogOut}
            colorClass="text-info"
          />
          <StatCard
            title="Left On Time Today"
            value={stats.leftOnTimeToday}
            icon={LogIn}
            colorClass="text-primary"
          />
          <StatCard
            title="Avg Attendance"
            value={`${stats.avgAttendanceRate}%`}
            icon={TrendingUp}
            colorClass="text-muted-foreground"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Today's Attendance Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">Present Today</p>
                <p className="text-2xl font-bold text-success">
                  {stats.presentToday} ({stats.totalTeachers > 0 ? ((stats.presentToday / stats.totalTeachers) * 100).toFixed(1) : 0}%)
                </p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value} teachers`, 'Count']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      padding: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendance Count by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: 'hsl(var(--foreground))' }}
                    style={{ fontSize: '14px', fontWeight: 500 }}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--foreground))' }}
                    label={{ value: 'Number of Teachers', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--foreground))' } }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value} teachers`, 'Count']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      padding: '12px'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="circle"
                    formatter={() => 'Teacher Count'}
                  />
                  <Bar 
                    dataKey="count" 
                    radius={[8, 8, 0, 0]}
                    label={{ position: 'top', fill: 'hsl(var(--foreground))', fontWeight: 600 }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
