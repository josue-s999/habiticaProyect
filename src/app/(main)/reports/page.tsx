
'use client';

import { useState, useMemo } from 'react';
import { DateRange } from 'react-day-picker';
import { addDays, format, isWithinInterval, startOfDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/hooks/use-auth';
import { Habit, HabitEntry } from '@/lib/types';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { calculateStreak } from '@/lib/utils';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DateRangePicker } from '@/components/DateRangePicker';
import { Loader2, TrendingUp, CheckCircle, CalendarDays } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';

type ReportData = {
  totalEntries: number;
  completedEntries: number;
  completionRate: number;
  habitsBreakdown: {
    name: string;
    completed: number;
    total: number;
  }[];
  categoryBreakdown: {
    name: string;
    value: number;
  }[];
  longestStreak: number;
  activityByDay: { [date: string]: number };
};

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', '#8884d8', '#82ca9d', '#ffc658'];

export default function ReportsPage() {
  const { userDoc, loading } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfDay(addDays(new Date(), -30)),
    to: startOfDay(new Date()),
  });

  const habits: Habit[] = useMemo(() => {
    if (loading || !userDoc?.exists()) return [];
    return userDoc.data()?.habits || [];
  }, [userDoc, loading]);

  const reportData: ReportData | null = useMemo(() => {
    if (!dateRange?.from || !habits) return null;

    const interval = {
      start: startOfDay(dateRange.from),
      end: dateRange.to ? startOfDay(addDays(dateRange.to, 1)) : startOfDay(addDays(dateRange.from, 1)),
    };

    let totalEntries = 0;
    let completedEntries = 0;
    let longestStreak = 0;
    const habitsBreakdown: ReportData['habitsBreakdown'] = [];
    const categoryCounts: { [key: string]: number } = {};
    const activityByDay: { [date: string]: number } = {};

    habits.forEach(habit => {
      const streak = calculateStreak(habit.entries).count;
      if (streak > longestStreak) {
        longestStreak = streak;
      }
      
      const entriesInDateRange = habit.entries.filter(entry =>
        isWithinInterval(startOfDay(new Date(entry.date)), interval)
      );

      if (entriesInDateRange.length > 0) {
        const completedInDateRange = entriesInDateRange.filter(e => e.completed);
        totalEntries += entriesInDateRange.length;
        completedEntries += completedInDateRange.length;

        habitsBreakdown.push({
          name: habit.name,
          completed: completedInDateRange.length,
          total: entriesInDateRange.length,
        });

        completedInDateRange.forEach(entry => {
            const dateStr = format(parseISO(entry.date), 'yyyy-MM-dd');
            activityByDay[dateStr] = (activityByDay[dateStr] || 0) + 1;
        });

        // Check if habit is completed for category breakdown
        const mainEntriesCount = habit.entries.filter(e => !e.isExtra).length;
        if (mainEntriesCount >= habit.duration) {
            categoryCounts[habit.category] = (categoryCounts[habit.category] || 0) + 1;
        }
      }
    });

    const categoryBreakdown = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));

    return {
      totalEntries,
      completedEntries,
      completionRate: totalEntries > 0 ? (completedEntries / totalEntries) * 100 : 0,
      habitsBreakdown,
      categoryBreakdown,
      longestStreak,
      activityByDay
    };
  }, [dateRange, habits]);

  if (loading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  const chartData = reportData?.habitsBreakdown.map(h => ({ name: h.name, Días: h.completed })) || [];

  const modifiers = reportData?.activityByDay ? {
      activity: Object.keys(reportData.activityByDay).map(dateStr => new Date(dateStr))
  } : {};
  
  const modifiersStyles = {
    activity: { 
        backgroundColor: 'hsl(var(--primary) / 0.2)',
        color: 'hsl(var(--primary-foreground))',
        borderRadius: 'var(--radius)'
    }
  };


  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Informe de Rendimiento</h1>
          <p className="text-muted-foreground">Analiza tus patrones y mantén la motivación.</p>
        </div>
        <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
      </div>

      {!reportData || reportData.totalEntries === 0 ? (
         <Card className="text-center py-12">
            <CardContent>
                <p className="text-muted-foreground">No hay datos de actividad para el período seleccionado.</p>
                <p className="text-sm text-muted-foreground mt-1">Registra tu progreso o elige un rango de fechas diferente.</p>
            </CardContent>
         </Card>
      ) : (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tasa de Cumplimiento</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{reportData.completionRate.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">
                            {reportData.completedEntries} de {reportData.totalEntries} días completados.
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mejor Racha</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{reportData.longestStreak} días</div>
                        <p className="text-xs text-muted-foreground">
                            Tu racha más larga registrada.
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Días Completados</CardTitle>
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{reportData.completedEntries}</div>
                        <p className="text-xs text-muted-foreground">
                            Total en el período seleccionado.
                        </p>
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid gap-8 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Calendario de Actividad</CardTitle>
                        <CardDescription>Días en que completaste al menos un reto.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Calendar
                            mode="multiple"
                            selected={modifiers.activity}
                            modifiers={modifiers}
                            modifiersStyles={modifiersStyles}
                            month={dateRange?.from}
                            showOutsideDays
                            className="p-0"
                            locale={es}
                        />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Retos Completados por Categoría</CardTitle>
                        <CardDescription>Distribución de todos tus retos finalizados.</CardDescription>
                    </CardHeader>
                     <CardContent className="h-[250px]">
                        {reportData.categoryBreakdown.length > 0 ? (
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={reportData.categoryBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {reportData.categoryBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            background: "hsl(var(--background))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: "var(--radius)"
                                        }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground">
                                <p>Aún no has completado ningún reto.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Días Completados por Reto</CardTitle>
                    <CardDescription>Visualiza tu rendimiento para cada reto en el período seleccionado.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                            <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis
                                dataKey="name"
                                type="category"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                width={120}
                                tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                            />
                            <Tooltip
                                cursor={{ fill: 'hsl(var(--muted))' }}
                                contentStyle={{
                                    background: "hsl(var(--background))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "var(--radius)"
                                }}
                            />
                            <Bar dataKey="Días" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

        </>
      )}
    </div>
  );
}
