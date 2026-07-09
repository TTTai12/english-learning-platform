import { TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface WeeklyDataPoint {
  day: string;
  minutes: number;
  words: number;
}

interface ProgressChartProps {
  data: WeeklyDataPoint[];
}

export function ProgressChart({ data }: ProgressChartProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h3 className="text-foreground text-sm font-semibold">Hoạt động tuần này</h3>
      </div>
      <div className="w-full h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'var(--foreground)'
              }}
              formatter={(value: any, name: any) => {
                const display = Array.isArray(value) ? value.join(', ') : (value ?? '-');
                return [
                  name === 'minutes' ? `${display} phút` : `${display} từ`,
                  name === 'minutes' ? 'Thời gian' : 'Từ mới'
                ];
              }}
            />
            <Bar dataKey="minutes" fill="var(--primary)" name="minutes" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
