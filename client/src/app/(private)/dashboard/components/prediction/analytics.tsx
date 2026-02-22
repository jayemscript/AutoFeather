'use client';

import { getAnalytics } from '@/api/protected/predict/predict-api';
import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Feather, Thermometer, Droplets, Bird } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AnalyticsData {
  totalRecords: number;
  featherDensityDistribution: { LOW: number; HIGH: number };
  fertilityLevelDistribution: { LOW: number; MEDIUM: number; HIGH: number };
  fertilityScoreOverTime: { date: string; averageFertilityScore: number }[];
  environmentalByFertility: {
    fertilityLevel: string;
    avgTemperature: number;
    avgHumidity: number;
    count: number;
  }[];
  recordsPerBreed: { breed: string; count: number }[];
  confidenceDistribution: { range: string; count: number }[];
}

// ─── Chart Configs ────────────────────────────────────────────────────────────

const featherChartConfig: ChartConfig = {
  LOW: { label: 'Low Density', color: 'var(--chart-2)' },
  HIGH: { label: 'High Density', color: 'var(--chart-1)' },
};

const fertilityChartConfig: ChartConfig = {
  LOW: { label: 'Low', color: 'var(--destructive)' },
  MEDIUM: { label: 'Medium', color: 'var(--chart-2)' },
  HIGH: { label: 'High', color: 'var(--chart-1)' },
};

const lineChartConfig: ChartConfig = {
  averageFertilityScore: {
    label: 'Avg Fertility Score',
    color: 'var(--chart-1)',
  },
};

const envChartConfig: ChartConfig = {
  avgTemperature: { label: 'Avg Temperature (°C)', color: 'var(--chart-1)' },
  avgHumidity: { label: 'Avg Humidity (%)', color: 'var(--chart-2)' },
};

const breedChartConfig: ChartConfig = {
  count: { label: 'Records', color: 'var(--chart-1)' },
};

const confidenceChartConfig: ChartConfig = {
  count: { label: 'Count', color: 'var(--chart-2)' },
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardDescription className="text-xs font-medium uppercase tracking-wide">
            {title}
          </CardDescription>
          <div className="bg-primary/10 text-primary rounded-md p-1.5">
            <Icon size={14} />
          </div>
        </div>
        <CardTitle className="text-3xl font-bold">{value}</CardTitle>
      </CardHeader>
      {description && (
        <CardContent className="pt-0">
          <p className="text-muted-foreground text-xs">{description}</p>
        </CardContent>
      )}
    </Card>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="bg-muted h-4 w-1/3 animate-pulse rounded" />
        <div className="bg-muted h-3 w-1/2 animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="bg-muted h-48 w-full animate-pulse rounded-md" />
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await getAnalytics();
        setData(res?.data ?? res);
      } catch (err: any) {
        setError(err?.message ?? 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="bg-muted h-4 w-2/3 animate-pulse rounded" />
                <div className="bg-muted h-7 w-1/2 animate-pulse rounded" />
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <SkeletonCard />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-destructive/40 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive text-sm">
            Failed to load analytics
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Transform data for charts
  const featherPieData = [
    { name: 'LOW', value: data.featherDensityDistribution.LOW },
    { name: 'HIGH', value: data.featherDensityDistribution.HIGH },
  ];

  const fertilityBarData = [
    { level: 'Low', count: data.fertilityLevelDistribution.LOW },
    { level: 'Medium', count: data.fertilityLevelDistribution.MEDIUM },
    { level: 'High', count: data.fertilityLevelDistribution.HIGH },
  ];

  const totalFertility =
    data.fertilityLevelDistribution.LOW +
    data.fertilityLevelDistribution.MEDIUM +
    data.fertilityLevelDistribution.HIGH;

  const highFertilityPct = totalFertility
    ? Math.round((data.fertilityLevelDistribution.HIGH / totalFertility) * 100)
    : 0;

  const avgScore =
    data.fertilityScoreOverTime.length > 0
      ? (
          data.fertilityScoreOverTime.reduce(
            (sum, d) => sum + d.averageFertilityScore,
            0,
          ) / data.fertilityScoreOverTime.length
        ).toFixed(1)
      : '—';

  return (
    <div className="space-y-6">
      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          title="Total Records"
          value={data.totalRecords}
          description="All prediction records"
          icon={Bird}
        />
        <StatCard
          title="High Fertility"
          value={`${highFertilityPct}%`}
          description={`${data.fertilityLevelDistribution.HIGH} of ${totalFertility} records`}
          icon={TrendingUp}
        />
        <StatCard
          title="Avg Fertility Score"
          value={avgScore}
          description="Across all time periods"
          icon={Feather}
        />
        <StatCard
          title="Breeds Tracked"
          value={data.recordsPerBreed.length}
          description="Unique chicken breeds"
          icon={Bird}
        />
      </div>

      {/* ── Row 1: Feather Density + Fertility Level ── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Feather Density Donut */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Feather size={15} className="text-primary" />
              Feather Density Distribution
            </CardTitle>
            <CardDescription>
              Proportion of LOW vs HIGH feather density classifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={featherChartConfig}
              className="mx-auto h-52"
            >
              <PieChart>
                <ChartTooltip
                  content={<ChartTooltipContent nameKey="name" />}
                />
                <Pie
                  data={featherPieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {featherPieData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={
                        featherChartConfig[entry.name as keyof typeof featherChartConfig]
                          ?.color
                      }
                    />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Fertility Level Bar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <TrendingUp size={15} className="text-primary" />
              Fertility Level Distribution
            </CardTitle>
            <CardDescription>
              Number of records per fertility level category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={fertilityChartConfig} className="h-52 w-full">
              <BarChart data={fertilityBarData} barSize={48}>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="level"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                  allowDecimals={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {fertilityBarData.map((entry) => (
                    <Cell
                      key={entry.level}
                      fill={
                        entry.level === 'Low'
                          ? 'var(--destructive)'
                          : entry.level === 'Medium'
                            ? 'var(--chart-2)'
                            : 'var(--chart-1)'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 2: Fertility Over Time (full width) ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <TrendingUp size={15} className="text-primary" />
            Average Fertility Score Over Time
          </CardTitle>
          <CardDescription>
            Daily average fertility score across all prediction records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.fertilityScoreOverTime.length === 0 ? (
            <div className="text-muted-foreground flex h-48 items-center justify-center text-sm">
              No time-series data available yet.
            </div>
          ) : (
            <ChartContainer config={lineChartConfig} className="h-56 w-full">
              <LineChart data={data.fertilityScoreOverTime}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  tickFormatter={(v) =>
                    new Date(v).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }
                />
                <YAxis
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  tickFormatter={(v) => `${v}`}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  labelFormatter={(label) =>
                    new Date(label).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  }
                />
                <Line
                  type="monotone"
                  dataKey="averageFertilityScore"
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: 'var(--chart-1)', strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* ── Row 3: Environmental + Breed ── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Environmental by Fertility Level */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Thermometer size={15} className="text-primary" />
              Avg Temperature & Humidity by Fertility
            </CardTitle>
            <CardDescription>
              Environmental conditions grouped by fertility outcome
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={envChartConfig} className="h-52 w-full">
              <BarChart data={data.environmentalByFertility} barGap={4}>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="fertilityLevel"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="avgTemperature"
                  fill="var(--chart-1)"
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
                <Bar
                  dataKey="avgHumidity"
                  fill="var(--chart-2)"
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Records per Breed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Bird size={15} className="text-primary" />
              Records per Chicken Breed
            </CardTitle>
            <CardDescription>
              Total prediction records submitted per breed
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.recordsPerBreed.length === 0 ? (
              <div className="text-muted-foreground flex h-48 items-center justify-center text-sm">
                No breed data available.
              </div>
            ) : (
              <ChartContainer config={breedChartConfig} className="h-52 w-full">
                <BarChart
                  data={data.recordsPerBreed}
                  layout="vertical"
                  margin={{ left: 8 }}
                >
                  <CartesianGrid
                    horizontal={false}
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                  />
                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="breed"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    width={100}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="count"
                    fill="var(--chart-1)"
                    radius={[0, 4, 4, 0]}
                    barSize={18}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Row 4: Confidence Distribution ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Droplets size={15} className="text-primary" />
            Model Confidence Distribution
          </CardTitle>
          <CardDescription>
            How confident the YOLOv8 model was across all predictions (binned by
            percentage)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={confidenceChartConfig}
            className="h-48 w-full"
          >
            <BarChart data={data.confidenceDistribution} barSize={56}>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="var(--border)"
              />
              <XAxis
                dataKey="range"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                allowDecimals={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="count"
                fill="var(--chart-2)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}