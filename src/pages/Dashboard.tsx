import { useMemo } from 'react';
import { Users, CheckCircle2, XCircle, Clock, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { useTeachers } from '@/hooks/useTeachers';
import { calculateAttendanceStats } from '@/utils/attendanceAnalyzer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { teachers, loading } = useTeachers();

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    let presentToday = 0;
    let absentToday = 0;
    let lateToday = 0;
    let totalAttendanceRate = 0;

    teachers.forEach((teacher) => {
      const teacherStats = calculateAttendanceStats(teacher.attendanceRecords);
      totalAttendanceRate += teacherStats.attendanceRate;

      const todayRecord = teacher.attendanceRecords.find(r => r.date === today);
      if (todayRecord) {
        if (todayRecord.status === 'present') presentToday++;
        else if (todayRecord.status === 'absent') absentToday++;
        else if (todayRecord.status === 'late') lateToday++;
      }
    });

    const avgAttendanceRate = teachers.length > 0 ? totalAttendanceRate / teachers.length : 0;

    return {
      totalTeachers: teachers.length,
      presentToday,
      absentToday,
      lateToday,
      avgAttendanceRate: avgAttendanceRate.toFixed(1),
    };
  }, [teachers]);

  const pieData = [
    { name: 'Present', value: stats.presentToday, color: 'hsl(var(--success))' },
    { name: 'Absent', value: stats.absentToday, color: 'hsl(var(--destructive))' },
    { name: 'Late', value: stats.lateToday, color: 'hsl(var(--warning))' },
  ];

  const barData = [
    { name: 'Present', count: stats.presentToday, fill: 'hsl(var(--success))' },
    { name: 'Absent', count: stats.absentToday, fill: 'hsl(var(--destructive))' },
    { name: 'Late', count: stats.lateToday, fill: 'hsl(var(--warning))' },
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
            title="Avg Attendance"
            value={`${stats.avgAttendanceRate}%`}
            icon={TrendingUp}
            colorClass="text-info"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Today's Attendance Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendance Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
