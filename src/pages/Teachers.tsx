import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeachers } from '@/hooks/useTeachers';
import { calculateAttendanceStats, analyzeAttendance } from '@/utils/attendanceAnalyzer';
import { ConditionBadge } from '@/components/ConditionBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye } from 'lucide-react';

export default function Teachers() {
  const { teachers, loading } = useTeachers();
  const navigate = useNavigate();

  const teacherAnalyses = useMemo(() => {
    return teachers.map((teacher) => {
      const stats = calculateAttendanceStats(teacher.attendance);
      const analysis = analyzeAttendance(stats);
      return {
        ...teacher,
        stats,
        analysis,
      };
    });
  }, [teachers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading teachers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Teachers List</h1>
          <p className="text-muted-foreground">
            Comprehensive attendance analysis for all teachers
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Teacher Attendance Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Total Days</TableHead>
                    <TableHead className="text-right">Present</TableHead>
                    <TableHead className="text-right">Absent</TableHead>
                    <TableHead className="text-right">Late</TableHead>
                    <TableHead className="text-right">Attendance %</TableHead>
                    <TableHead>AI Condition</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teacherAnalyses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No teachers found in database
                      </TableCell>
                    </TableRow>
                  ) : (
                    teacherAnalyses.map((teacher) => (
                      <TableRow key={teacher.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{teacher.name}</TableCell>
                        <TableCell className="text-right">{teacher.stats.totalDays}</TableCell>
                        <TableCell className="text-right text-success">
                          {teacher.stats.presentDays}
                        </TableCell>
                        <TableCell className="text-right text-destructive">
                          {teacher.stats.absentDays}
                        </TableCell>
                        <TableCell className="text-right text-warning">
                          {teacher.stats.lateDays}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {teacher.stats.attendanceRate.toFixed(1)}%
                        </TableCell>
                        <TableCell>
                          <ConditionBadge condition={teacher.analysis.condition} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/teacher/${teacher.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
