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

    const stats = calculateAttendanceStats(teacher.attendanceRecords);
    const analysis = analyzeAttendance(stats);

    // Prepare chart data from attendanceRecords
    const trendData = teacher.attendanceRecords.map((record) => {
      let statusValue = 0;
      if (record.status === 'present') statusValue = 1;
      else if (record.status === 'late') statusValue = 0.75;
      else if (record.status === 'left_early') statusValue = 0.5;
      else if (record.status === 'left_on_time') statusValue = 0.25;
      else statusValue = 0; // absent
      
      return {
        date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        status: statusValue,
      };
    });

    // Weekly summary
    const weeklyData: Record<string, { present: number; absent: number; late: number; leftEarly: number; leftOnTime: number }> = {};
    teacher.attendanceRecords.forEach((record) => {
      const weekStart = new Date(record.date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { present: 0, absent: 0, late: 0, leftEarly: 0, leftOnTime: 0 };
      }
      
      if (record.status === 'present') weeklyData[weekKey].present++;
      else if (record.status === 'absent') weeklyData[weekKey].absent++;
      else if (record.status === 'late') weeklyData[weekKey].late++;
      else if (record.status === 'left_early') weeklyData[weekKey].leftEarly++;
      else if (record.status === 'left_on_time') weeklyData[weekKey].leftOnTime++;
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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-6">
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
              <CardTitle className="text-sm font-medium">Late Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats.lateDays}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Left Early</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-info">{stats.leftEarlyDays}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Left On Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.leftOnTimeDays}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats.attendanceRate.toFixed(1)}%</div>
            <p className="text-sm text-muted-foreground mt-2">Based on {stats.presentDays} present days out of {stats.totalDays} total days</p>
          </CardContent>
        </Card>

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
            <CardTitle>Daily Attendance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: 'hsl(var(--foreground))' }}
                  style={{ fontSize: '12px' }}
                  label={{ value: 'Date', position: 'insideBottom', offset: -10, style: { fill: 'hsl(var(--foreground))' } }}
                />
                <YAxis 
                  domain={[0, 1]} 
                  ticks={[0, 0.25, 0.5, 0.75, 1]}
                  tick={{ fill: 'hsl(var(--foreground))' }}
                  tickFormatter={(value) => {
                    if (value === 1) return 'Present';
                    if (value === 0.75) return 'Late';
                    if (value === 0.5) return 'Left Early';
                    if (value === 0.25) return 'Left On Time';
                    return 'Absent';
                  }}
                  label={{ value: 'Status', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--foreground))' } }}
                />
                <Tooltip
                  formatter={(value: number) => {
                    if (value === 1) return ['Present', 'Status'];
                    if (value === 0.75) return ['Late', 'Status'];
                    if (value === 0.5) return ['Left Early', 'Status'];
                    if (value === 0.25) return ['Left On Time', 'Status'];
                    return ['Absent', 'Status'];
                  }}
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
                  iconType="line"
                  formatter={() => 'Attendance Status'}
                />
                <Line 
                  type="monotone" 
                  dataKey="status" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  name="Status"
                  dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Attendance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklySummary} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="week" 
                  tick={{ fill: 'hsl(var(--foreground))' }}
                  style={{ fontSize: '12px' }}
                  label={{ value: 'Week Starting', position: 'insideBottom', offset: -10, style: { fill: 'hsl(var(--foreground))' } }}
                />
                <YAxis 
                  tick={{ fill: 'hsl(var(--foreground))' }}
                  label={{ value: 'Number of Days', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--foreground))' } }}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [`${value} days`, name]}
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
                  iconType="rect"
                />
                <Bar dataKey="present" fill="hsl(var(--success))" name="Present" radius={[4, 4, 0, 0]} />
                <Bar dataKey="late" fill="hsl(var(--warning))" name="Late" radius={[4, 4, 0, 0]} />
                <Bar dataKey="leftEarly" fill="hsl(var(--info))" name="Left Early" radius={[4, 4, 0, 0]} />
                <Bar dataKey="leftOnTime" fill="hsl(var(--primary))" name="Left On Time" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" fill="hsl(var(--destructive))" name="Absent" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
