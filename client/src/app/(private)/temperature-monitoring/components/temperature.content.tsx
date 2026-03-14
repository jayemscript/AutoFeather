'use client';

import React, { useContext, useEffect, useState, useMemo } from 'react';
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';
import { SocketContext } from '@/providers/socket-provider';
import {
  startTemperatureSimulation,
  stopTemperatureSimulation,
} from '@/api/protected/temperature-api/temperature-sensor.api';
import { TemperatureData } from '@/api/protected/temperature-api/temperature-sensor.interface';
import { showToastSuccess, showToastError } from '@/utils/toast-config';
import { extractErrorMessage } from '@/configs/api.helper';
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
} from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Thermometer,
  Activity,
  Droplets,
  Clock,
  WifiOff,
  Play,
  Square,
  Loader2,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatDate } from '@syntaxsentinel/date-utils';

const chartConfig = {
  temperature: {
    label: 'Temperature',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export default function TemperatureContent() {
  const { socket } = useContext(SocketContext);
  const [currentTemp, setCurrentTemp] = useState<TemperatureData | null>(null);
  const [tempHistory, setTempHistory] = useState<TemperatureData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState<'optimal' | 'low' | 'high'>('optimal');
  const [loading, setLoading] = useState<boolean>(false);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);

  const chartData = useMemo(() => {
    return tempHistory
      .slice()
      .reverse()
      .map((reading, index) => {
        return {
          timestamp: formatDate.readableDateTime(reading.timestamp),
          temperature: Number(reading.temperature),
          index: index,
        };
      });
  }, [tempHistory]);

  useEffect(() => {
    if (!socket) return;

    setIsConnected(socket.connected);

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    const handleTemperatureData = (data: TemperatureData) => {
      const tempData = {
        ...data,
        timestamp: new Date(data.timestamp),
      };

      setCurrentTemp(tempData);
      setTempHistory((prev) => [tempData, ...prev].slice(0, 20));
      setIsSimulationRunning(true);

      if (tempData.temperature < 25) {
        setStatus('low');
      } else if (tempData.temperature > 32) {
        setStatus('high');
      } else {
        setStatus('optimal');
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('sensor:temperature', handleTemperatureData);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('sensor:temperature', handleTemperatureData);
    };
  }, [socket]);

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await startTemperatureSimulation();
      setIsSimulationRunning(true);
      showToastSuccess(
        'Monitoring Started',
        res.message || 'Temperature monitoring started successfully',
        'bottom-right',
      );
    } catch (error: unknown) {
      showToastError(
        'Operation Failed',
        extractErrorMessage(error),
        'bottom-right',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      const res = await stopTemperatureSimulation();
      setIsSimulationRunning(false);
      showToastSuccess(
        'Monitoring Stopped',
        res.message || 'Temperature monitoring stopped',
        'bottom-right',
      );
    } catch (error: unknown) {
      showToastError(
        'Operation Failed',
        extractErrorMessage(error),
        'bottom-right',
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'low':
        return 'text-blue-500';
      case 'high':
        return 'text-destructive';
      case 'optimal':
        return 'text-primary';
    }
  };

  const getStatusBadgeVariant = () => {
    switch (status) {
      case 'low':
        return 'secondary';
      case 'high':
        return 'destructive';
      case 'optimal':
        return 'default';
    }
  };

  if (!socket || !isConnected) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            WebSocket disconnected. Please check your connection.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 gap-4 overflow-hidden">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Temperature Monitoring
          </h1>
          <p className="text-muted-foreground text-sm">
            Real-time Poultry temperature tracking
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant={isConnected ? 'default' : 'destructive'}
            className="h-8"
          >
            <Activity className="w-3 h-3 mr-1" />
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
          {isSimulationRunning ? (
            <Button
              onClick={handleStop}
              disabled={loading}
              variant="destructive"
              size="sm"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Square className="w-4 h-4 mr-2" />
              )}
              Stop Monitoring
            </Button>
          ) : (
            <Button
              onClick={handleStart}
              disabled={loading}
              variant="default"
              size="sm"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Start Monitoring
            </Button>
          )}
        </div>
      </div>

      {/* ── Two-Panel Layout ── */}
      <div className="flex flex-1 gap-4 overflow-hidden min-h-0 flex-col lg:flex-row">
        {/* ── LEFT PANEL — Current reading, stats, chart ── */}
        <div className="flex flex-col gap-4 lg:w-[58%] overflow-y-auto">
          {/* Current Temperature Card */}
          <Card className="border-2 shrink-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Thermometer className="w-4 h-4" />
                Current Temperature
              </CardTitle>
              <CardDescription className="text-xs">
                Poultry Environment temperature sensor
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentTemp ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-5xl font-bold ${getStatusColor()}`}>
                        {currentTemp.temperature}°C
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatDate.timeOnly(currentTemp.timestamp)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={getStatusBadgeVariant()} className="mb-2">
                        {status.toUpperCase()}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {currentTemp.sensorId}
                      </div>
                    </div>
                  </div>

                  {/* Threshold row */}
                  <div className="grid grid-cols-3 gap-3 pt-3 border-t">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">
                        Low Threshold
                      </div>
                      <div className="text-base font-semibold text-blue-500">
                        25°C
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">
                        Optimal Range
                      </div>
                      <div className="text-base font-semibold text-primary">
                        25–32°C
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">
                        High Threshold
                      </div>
                      <div className="text-base font-semibold text-destructive">
                        32°C
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <Droplets className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Waiting for temperature data...</p>
                  <p className="text-xs mt-1">
                    Click "Start Monitoring" to begin
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  Average Temp
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-xl font-bold">
                  {tempHistory.length > 0
                    ? (
                        tempHistory.reduce((sum, r) => sum + r.temperature, 0) /
                        tempHistory.length
                      ).toFixed(2)
                    : '0.00'}
                  °C
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  Highest Temp
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-xl font-bold text-destructive">
                  {tempHistory.length > 0
                    ? Math.max(
                        ...tempHistory.map((r) => r.temperature),
                      ).toFixed(2)
                    : '0.00'}
                  °C
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  Lowest Temp
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-xl font-bold text-blue-500">
                  {tempHistory.length > 0
                    ? Math.min(
                        ...tempHistory.map((r) => r.temperature),
                      ).toFixed(2)
                    : '0.00'}
                  °C
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card className="flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="w-4 h-4" />
                Temperature Trend
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time visualization (last 20 readings)
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              {chartData.length > 0 ? (
                <ChartContainer
                  config={chartConfig}
                  className="aspect-auto h-45 w-full"
                >
                  <LineChart
                    accessibilityLayer
                    data={chartData}
                    margin={{ left: 12, right: 12 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="timestamp"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={32}
                      tick={{ fontSize: 11 }}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          className="w-45"
                          formatter={(value) => [
                            `${Number(value).toFixed(2)}°C`,
                            'Temperature',
                          ]}
                        />
                      }
                    />
                    <Line
                      dataKey="temperature"
                      type="monotone"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', r: 4 }}
                      activeDot={{ r: 6, fill: '#2563eb' }}
                    />
                  </LineChart>
                </ChartContainer>
              ) : (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  <p>No data available yet</p>
                  <p className="text-xs mt-1">Start monitoring to see trends</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── RIGHT PANEL — Logs / Recent Readings ── */}
        <div className="flex flex-col lg:w-[42%] min-h-0">
          <Card className="flex flex-col flex-1 min-h-0">
            <CardHeader className="pb-2 shrink-0">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="w-4 h-4" />
                Recent Readings
              </CardTitle>
              <CardDescription className="text-xs">
                Last 20 temperature measurements
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              {tempHistory.length > 0 ? (
                <div className="h-full overflow-y-auto px-4 pb-4 space-y-1.5">
                  {tempHistory.map((reading, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        {/* Index badge */}
                        <span className="text-[0.65em] font-mono text-muted-foreground w-5 text-right shrink-0">
                          {tempHistory.length - index}
                        </span>
                        <Thermometer className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span
                          className={`font-semibold text-sm ${
                            reading.temperature < 25
                              ? 'text-blue-500'
                              : reading.temperature > 32
                                ? 'text-destructive'
                                : 'text-primary'
                          }`}
                        >
                          {reading.temperature}°C
                        </span>
                        <Badge
                          variant={
                            reading.temperature < 25
                              ? 'secondary'
                              : reading.temperature > 32
                                ? 'destructive'
                                : 'default'
                          }
                          className="text-[0.6em] h-4 px-1.5"
                        >
                          {reading.temperature < 25
                            ? 'LOW'
                            : reading.temperature > 32
                              ? 'HIGH'
                              : 'OK'}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate.readableDateTime(reading.timestamp)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground pb-8">
                  <Droplets className="w-10 h-10 mb-3 opacity-40" />
                  <p className="text-sm">No readings yet</p>
                  <p className="text-xs mt-1">Start monitoring to see logs</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
