import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTeachers } from '@/hooks/useTeachers';
import { calculateAttendanceStats, analyzeAttendance } from '@/utils/attendanceAnalyzer';
import { ConditionBadge } from '@/components/ConditionBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function TeacherDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { teachers, loading } = useTeachers();

  const teacherData = useMemo(() => {
    const teacher = teachers.find((t) => t.id === id);
    if (!teacher) return null;

    const stats = calculateAttendanceStats(teacher.attendance);
    const analysis = analyzeAttendance(stats);

    // Prepare chart data
    const attendanceEntries = Object.entries(teacher.attendance || {})
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB));

    const trendData = attendanceEntries.map(([date, record]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      status: record.status === 'present' ? 1 : record.status === 'late' ? 0.5 : 0,
    }));

    // Weekly summary
    const weeklyData: Record<string, { present: number; absent: number; late: number }> = {};
    attendanceEntries.forEach(([date, record]) => {
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { present: 0, absent: 0, late: 0 };
      }
      
      if (record.status === 'present') weeklyData[weekKey].present++;
      else if (record.status === 'absent') weeklyData[weekKey].absent++;
      else if (record.status === 'late') weeklyData[weekKey].late++;
    });

    const weeklySummary = Object.entries(weeklyData).map(([week, data]) => ({
      week,
      ...data,
    }));

    return {
      teacher,
      stats,
      analysis,
      trendData,
      weeklySummary,
    };
  }, [teachers, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading teacher details...</p>
        </div>
      </div>
    );
  }

  if (!teacherData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Teacher Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              The requested teacher could not be found.
            </p>
            <Button onClick={() => navigate('/teachers')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Teachers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { teacher, stats, analysis, trendData, weeklySummary } = teacherData;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/teachers')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-4xl font-bold">{teacher.name}</h1>
            <p className="text-muted-foreground">ID: {teacher.id}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Days</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDays}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present Days</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.presentDays}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Absent Days</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.absentDays}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.attendanceRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              AI Analysis
              <ConditionBadge condition={analysis.condition} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-1">Assessment</h3>
              <p className="text-muted-foreground">{analysis.reason}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Recommendation</h3>
              <p className="text-muted-foreground">{analysis.advice}</p>
            </div>
            {analysis.latePattern && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Pattern Detected</AlertTitle>
                <AlertDescription>{analysis.latePattern}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 1]} ticks={[0, 0.5, 1]} />
                <Tooltip
                  formatter={(value: number) => {
                    if (value === 1) return 'Present';
                    if (value === 0.5) return 'Late';
                    return 'Absent';
                  }}
                />
                <Line type="monotone" dataKey="status" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklySummary}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="hsl(var(--success))" name="Present" />
                <Bar dataKey="late" fill="hsl(var(--warning))" name="Late" />
                <Bar dataKey="absent" fill="hsl(var(--destructive))" name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
