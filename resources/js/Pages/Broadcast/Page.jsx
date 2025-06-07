import React, { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowUpRight, 
  Server, 
  Cpu, 
  HardDrive, 
  Network, 
  Clock, 
  RefreshCw, 
  Info, 
  Activity,
  AlertTriangle,
  CheckCircle2,
  MemoryStick,
  Database,
  LineChart as LineChartIcon,
  Search
} from 'lucide-react';

// Import Recharts components
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function BroadcastPage({ auth }) {
  // Existing state variables
  const [streamData, setStreamData] = useState(null);
  const [uptimeData, setUptimeData] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cpuHistory, setCpuHistory] = useState([]);
  const [memoryHistory, setMemoryHistory] = useState([]);
  const [networkHistory, setNetworkHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const eventSourceRef = useRef(null);
  
  // New state variables for history points
  const [historyPoints, setHistoryPoints] = useState(50);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [historicalData, setHistoricalData] = useState({
    cpu: [],
    memory: [],
    network: [],
    disk: []
  });

  // All your existing utility functions
  const formatUptime = (uptime) => {
    if (!uptime) return 'N/A';
    
    const { days, hours, minutes, seconds } = uptime;
    const parts = [];
    
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0) parts.push(`${seconds}s`);
    
    return parts.length > 0 ? parts.join(' ') : '0s';
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (e) {
      return 'Invalid time';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    try {
      return new Date(timestamp).toLocaleDateString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch (e) {
      return 'Invalid date';
    }
  };

  const formatNumber = (num, precision = 2) => {
    if (num === undefined || num === null) return 'N/A';
    return Number(num).toFixed(precision);
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const getStatusColor = (percent) => {
    if (percent < 50) return 'success';
    if (percent < 80) return 'warning';
    return 'destructive';
  };

  const getBadgeVariant = (type) => {
    switch (type) {
      case 'system':
        return 'secondary';
      case 'error':
        return 'destructive';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      default:
        return 'outline';
    }
  };

  const CustomTooltip = ({ active, payload, label, valueFormatter }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-zinc-900 p-2 border border-zinc-200 dark:border-zinc-800 rounded shadow-md">
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name}: {valueFormatter ? valueFormatter(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Function to fetch historical data with specific point count
  const fetchHistoricalData = async (points = 50) => {
    setHistoryLoading(true);
    try {
      const response = await fetch(`https://india-uptime.ryx.us/history?i=${points}`);
      if (!response.ok) throw new Error('Failed to fetch historical data');
      
      const data = await response.json();
      setHistoryData(data);
      setTotalPoints(data.total_stats || 0);
      
      if (data.stats_array && data.stats_array.length > 0) {
        // Process the data for different charts
        const processedData = processHistoricalData(data.stats_array);
        setHistoricalData(processedData);
      }
      
      return data;
    } catch (err) {
      console.error('Error fetching historical data:', err);
      setError(`Failed to fetch historical data: ${err.message}`);
      return null;
    } finally {
      setHistoryLoading(false);
    }
  };

  // Process historical data for charts
  const processHistoricalData = (statsArray) => {
    // Ensure data is sorted by timestamp
    const sortedStats = [...statsArray].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
    
    // Process data for each chart type
    return {
      cpu: sortedStats.map(stat => ({
        time: formatDateTime(stat.timestamp),
        CPU: parseFloat((stat.cpu_usage * 100).toFixed(2))
      })),
      memory: sortedStats.map(stat => ({
        time: formatDateTime(stat.timestamp),
        Memory: parseFloat(stat.memory_usage.toFixed(2))
      })),
      network: sortedStats.map(stat => ({
        time: formatDateTime(stat.timestamp),
        In: stat.network_in,
        Out: stat.network_out
      })),
      disk: sortedStats.map(stat => ({
        time: formatDateTime(stat.timestamp),
        Usage: parseFloat(stat.disk_usage.toFixed(2))
      })),
      load: sortedStats.map(stat => ({
        time: formatDateTime(stat.timestamp),
        Load: parseFloat(stat.load_average.toFixed(2))
      }))
    };
  };

  // Handle change in history points
  const handleHistoryPointsChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setHistoryPoints(value);
    }
  };

  // Fetch historical data with new point count
  const fetchHistoryWithPoints = () => {
    fetchHistoricalData(historyPoints);
  };

  // Your existing useEffect with added code for initial history fetch
  useEffect(() => {
    const fetchUptimeData = async () => {
      try {
        const response = await fetch('https://india-uptime.ryx.us/uptime');
        if (!response.ok) throw new Error('Failed to fetch uptime data');
        const data = await response.json();
        setUptimeData(data);
      } catch (err) {
        console.error('Error fetching uptime data:', err);
        setError('Failed to fetch uptime data');
      }
    };

    const fetchHistoryData = async () => {
      await fetchHistoricalData(historyPoints);
    };

    const connectToStream = () => {
      // Your existing stream connection code
      try {
        eventSourceRef.current = new EventSource('https://india-uptime.ryx.us/stream');
        
        eventSourceRef.current.onopen = () => {
          setIsConnected(true);
          console.log('Connected to stream');
        };
        
        eventSourceRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setStreamData(data);
            setLoading(false);
            
            // Update charts with new data
            if (data && data.stats) {
              const time = formatTime(data.timestamp);
              
              // Update CPU history
              setCpuHistory(prev => {
                const newData = [...prev, { 
                  time, 
                  CPU: parseFloat((data.stats.cpu_usage * 100).toFixed(2))
                }];
                return newData.slice(-20); // Keep only last 20 entries
              });
              
              // Update Memory history
              setMemoryHistory(prev => {
                const newData = [...prev, { 
                  time, 
                  Memory: parseFloat(data.stats.memory_usage.toFixed(2))
                }];
                return newData.slice(-20); // Keep only last 20 entries
              });
              
              // Update Network history
              setNetworkHistory(prev => {
                const newData = [...prev, { 
                  time, 
                  In: data.stats.network_in,
                  Out: data.stats.network_out
                }];
                return newData.slice(-20); // Keep only last 20 entries
              });
            }
          } catch (err) {
            console.error('Error parsing stream data:', err, event.data);
          }
        };
        
        eventSourceRef.current.onerror = (err) => {
          console.error('Stream connection error:', err);
          setError('Connection to stream failed');
          setIsConnected(false);
          eventSourceRef.current.close();
          
          // Try to reconnect after 5 seconds
          setTimeout(connectToStream, 5000);
        };
      } catch (err) {
        console.error('Failed to create EventSource:', err);
        setError('Failed to connect to stream');
      }
    };

    // Initialize data fetching
    Promise.all([fetchUptimeData(), fetchHistoryData()])
      .then(() => {
        connectToStream();
        setLoading(false);
      })
      .catch(err => {
        console.error('Initialization error:', err);
        setLoading(false);
        setError('Failed to initialize monitoring');
      });

    // Cleanup function
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []); // Don't include historyPoints in dependencies to prevent unnecessary refetches

  // Your existing handleRefresh function
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const [uptimeResponse, historyResponse] = await Promise.all([
        fetch('https://india-uptime.ryx.us/uptime'),
        fetch(`https://india-uptime.ryx.us/history?i=${historyPoints}`)
      ]);
      
      if (!uptimeResponse.ok || !historyResponse.ok) {
        throw new Error('Failed to refresh data');
      }
      
      const uptime = await uptimeResponse.json();
      const history = await historyResponse.json();
      
      setUptimeData(uptime);
      setHistoryData(history);
      
      // Process historical data
      if (history.stats_array && history.stats_array.length > 0) {
        const processedData = processHistoricalData(history.stats_array);
        setHistoricalData(processedData);
        setTotalPoints(history.total_stats || 0);
      }
      
      // Reconnect to stream if not connected
      if (!isConnected && eventSourceRef.current) {
        eventSourceRef.current.close();
        const newEventSource = new EventSource('https://india-uptime.ryx.us/stream');
        eventSourceRef.current = newEventSource;
        setIsConnected(true);
      }
      
      setError(null);
    } catch (err) {
      console.error('Refresh error:', err);
      setError('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={'Home / Location-India'}
        sidebartab="broadcast-1"
      
    >

        {/*<div className="flex items-center justify-between">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Server Monitor - India Node
          </h2>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? 'success' : 'destructive'} className="mr-2">
              {isConnected ? 'Live' : 'Disconnected'}
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh} 
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>*/}
      <Head title="Server Monitor - India Node" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
          {error && (
            <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg mb-6 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span>{error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-auto" 
                onClick={handleRefresh}
              >
                Try Again
              </Button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center">
                <RefreshCw className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg text-gray-600 dark:text-gray-300">Loading server data...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Server Status Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Your existing cards */}
                {/* CPU Usage */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Cpu className="h-5 w-5 mr-2 text-blue-500" />
                        <h3 className="font-medium">CPU Usage</h3>
                      </div>
                      <Badge 
                        variant={getStatusColor(streamData?.stats?.cpu_usage * 100 || 0)}
                      >
                        {formatNumber(streamData?.stats?.cpu_usage * 100 || 0)}%
                      </Badge>
                    </div>
                    <Progress 
                      value={streamData?.stats?.cpu_usage * 100 || 0} 
                      className="h-2"
                    />
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Load Average: {streamData?.stats?.load_average || 'N/A'}
                    </div>
                  </CardContent>
                </Card>

                {/* Memory Usage */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <MemoryStick className="h-5 w-5 mr-2 text-purple-500" />
                        <h3 className="font-medium">Memory Usage</h3>
                      </div>
                      <Badge 
                        variant={getStatusColor(streamData?.stats?.memory_usage || 0)}
                      >
                        {formatNumber(streamData?.stats?.memory_usage || 0)}%
                      </Badge>
                    </div>
                    <Progress 
                      value={streamData?.stats?.memory_usage || 0} 
                      className="h-2"
                    />
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {formatBytes(streamData?.stats?.memory_used || 0)} / {formatBytes(streamData?.stats?.memory_total || 0)}
                    </div>
                  </CardContent>
                </Card>

                {/* Disk Usage */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <HardDrive className="h-5 w-5 mr-2 text-amber-500" />
                        <h3 className="font-medium">Disk Usage</h3>
                      </div>
                      <Badge 
                        variant={getStatusColor(streamData?.stats?.disk_usage || 0)}
                      >
                        {formatNumber(streamData?.stats?.disk_usage || 0)}%
                      </Badge>
                    </div>
                    <Progress 
                      value={streamData?.stats?.disk_usage || 0} 
                      className="h-2"
                    />
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {formatBytes(streamData?.stats?.disk_used || 0)} / {formatBytes(streamData?.stats?.disk_total || 0)}
                    </div>
                  </CardContent>
                </Card>

                {/* Uptime */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-green-500" />
                        <h3 className="font-medium">System Uptime</h3>
                      </div>
                      <Badge variant="outline">
                        {formatUptime(streamData?.server_uptime)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-gray-500 dark:text-gray-400">App Uptime:</span>
                      <span className="text-xs font-medium">
                        {formatUptime(streamData?.app_uptime)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Goroutines:</span>
                      <span className="text-xs font-medium">
                        {streamData?.stats?.goroutines || 'N/A'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs for detailed data */}
              <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="network">Network</TabsTrigger>
                  <TabsTrigger value="history">Event Log</TabsTrigger>
                  <TabsTrigger value="historical">Historical Data</TabsTrigger>
                </TabsList>
                
                {/* Your existing tab content */}
                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                  {/* Your existing overview content */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* CPU Usage Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <Cpu className="h-5 w-5 mr-2 text-blue-500" />
                          CPU Usage History
                        </CardTitle>
                        <CardDescription>
                          Real-time CPU utilization over time
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          {cpuHistory.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart
                                data={cpuHistory}
                                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                              >
                                <defs>
                                  <linearGradient id="colorCPU" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                                <XAxis 
                                  dataKey="time" 
                                  tick={{ fontSize: 12 }}
                                  className="text-gray-600 dark:text-gray-400"
                                />
                                <YAxis 
                                  domain={[0, 100]} 
                                  tickFormatter={(value) => `${value}%`}
                                  tick={{ fontSize: 12 }}
                                  className="text-gray-600 dark:text-gray-400"
                                />
                                <Tooltip content={<CustomTooltip valueFormatter={(value) => `${value}%`} />} />
                                <Area 
                                  type="monotone" 
                                  dataKey="CPU" 
                                  stroke="#3b82f6" 
                                  fillOpacity={1} 
                                  fill="url(#colorCPU)" 
                                  name="CPU Usage"
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                              No CPU data available
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Memory Usage Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <MemoryStick className="h-5 w-5 mr-2 text-purple-500" />
                          Memory Usage History
                        </CardTitle>
                        <CardDescription>
                          Memory utilization trend
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          {memoryHistory.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart
                                data={memoryHistory}
                                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                              >
                                <defs>
                                  <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                                <XAxis 
                                  dataKey="time"
                                  tick={{ fontSize: 12 }}
                                  className="text-gray-600 dark:text-gray-400"
                                />
                                <YAxis 
                                  domain={[0, 100]}
                                  tickFormatter={(value) => `${value}%`}
                                  tick={{ fontSize: 12 }}
                                  className="text-gray-600 dark:text-gray-400"
                                />
                                <Tooltip content={<CustomTooltip valueFormatter={(value) => `${value}%`} />} />
                                <Area 
                                  type="monotone" 
                                  dataKey="Memory" 
                                  stroke="#a855f7" 
                                  fillOpacity={1} 
                                  fill="url(#colorMemory)" 
                                  name="Memory Usage"
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                              No memory data available
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* System Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Server className="h-5 w-5 mr-2 text-gray-500" />
                        System Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Your existing system info content */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Timestamps</h4>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-sm">Current:</span>
                              <span className="text-sm font-medium">{formatDate(streamData?.timestamp)} {formatTime(streamData?.timestamp)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">First Run:</span>
                              <span className="text-sm font-medium">{formatDate(uptimeData?.first_run)} {formatTime(uptimeData?.first_run)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Last Run:</span>
                              <span className="text-sm font-medium">{formatDate(uptimeData?.last_run)} {formatTime(uptimeData?.last_run)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Uptime</h4>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-sm">Server:</span>
                              <span className="text-sm font-medium">{formatUptime(streamData?.server_uptime)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Application:</span>
                              <span className="text-sm font-medium">{formatUptime(streamData?.app_uptime)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Server Stats</h4>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-sm">Goroutines:</span>
                              <span className="text-sm font-medium">{streamData?.stats?.goroutines || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Load Average:</span>
                              <span className="text-sm font-medium">{streamData?.stats?.load_average || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Data Points:</span>
                              <span className="text-sm font-medium">{historyData?.total_stats || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Network Tab */}
                <TabsContent value="network" className="space-y-4">
                  {/* Your existing network content */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Network className="h-5 w-5 mr-2 text-emerald-500" />
                        Network Traffic
                      </CardTitle>
                      <CardDescription>
                        Incoming and outgoing network traffic
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-72">
                        {networkHistory.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={networkHistory}
                              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                              <XAxis 
                                dataKey="time"
                                tick={{ fontSize: 12 }}
                                className="text-gray-600 dark:text-gray-400"
                              />
                              <YAxis 
                                tickFormatter={(value) => `${value} B/s`}
                                tick={{ fontSize: 12 }}
                                className="text-gray-600 dark:text-gray-400"
                              />
                              <Tooltip content={<CustomTooltip valueFormatter={(value) => `${value} B/s`} />} />
                              <Legend />
                              <Bar dataKey="In" fill="#10b981" name="Incoming" />
                              <Bar dataKey="Out" fill="#3b82f6" name="Outgoing" />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                            No network data available
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full mr-1"></div>
                          <span>Incoming</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                          <span>Outgoing</span>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Activity className="h-5 w-5 mr-2 text-blue-500" />
                        Current Network Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Incoming Traffic</h4>
                            <div className="flex items-center">
                              <ArrowUpRight className="h-5 w-5 mr-2 text-emerald-500 rotate-180" />
                              <div className="text-2xl font-bold">{streamData?.stats?.network_in || 0}</div>
                              <div className="ml-2 text-sm text-gray-500 dark:text-gray-400">B/s</div>
                            </div>
                          </div>
                          <Progress 
                            value={Math.min(100, (streamData?.stats?.network_in || 0) / 100)}
                            className="h-2 bg-gray-100 dark:bg-gray-800"
                          />
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Outgoing Traffic</h4>
                            <div className="flex items-center">
                              <ArrowUpRight className="h-5 w-5 mr-2 text-blue-500" />
                              <div className="text-2xl font-bold">{streamData?.stats?.network_out || 0}</div>
                              <div className="ml-2 text-sm text-gray-500 dark:text-gray-400">B/s</div>
                            </div>
                          </div>
                          <Progress 
                            value={Math.min(100, (streamData?.stats?.network_out || 0) / 100)}
                            className="h-2 bg-gray-100 dark:bg-gray-800"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Event Log Tab */}
                <TabsContent value="history" className="space-y-4">
                  {/* Your existing event log content */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Info className="h-5 w-5 mr-2 text-blue-500" />
                        System Events
                      </CardTitle>
                      <CardDescription>
                        Log of system events and notifications
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {historyData?.notes && historyData.notes.length > 0 ? (
                        <div className="space-y-3">
                          {historyData.notes.map((note, index) => (
                            <div key={index} className="flex p-3 rounded-md bg-gray-50 dark:bg-gray-800/50">
                              <Badge variant={getBadgeVariant(note.type)} className="self-start mr-3">
                                {note.type}
                              </Badge>
                              <div className="space-y-1">
                                <div className="font-medium">{note.message}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatDate(note.timestamp)} {formatTime(note.timestamp)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          No system events recorded
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Total events: {historyData?.notes?.length || 0}
                      </div>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                {/* NEW HISTORICAL DATA TAB */}
                <TabsContent value="historical" className="space-y-4">
                  <Card>
                    <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                      <div>
                        <CardTitle className="text-lg flex items-center">
                          <Database className="h-5 w-5 mr-2 text-indigo-500" />
                          Historical Performance Data
                        </CardTitle>
                        <CardDescription>
                          View long-term performance trends from stored metrics
                        </CardDescription>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            min="1"
                            max={totalPoints}
                            value={historyPoints}
                            onChange={handleHistoryPointsChange}
                            className="w-20"
                            placeholder="Points"
                          />
                          <span className="text-sm text-gray-500 dark:text-gray-400">of {totalPoints}</span>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={fetchHistoryWithPoints}
                          disabled={historyLoading}
                        >
                          {historyLoading ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      {historyLoading ? (
                        <div className="flex items-center justify-center h-64">
                          <div className="flex flex-col items-center">
                            <RefreshCw className="h-10 w-10 animate-spin text-primary mb-4" />
                            <p className="text-gray-600 dark:text-gray-300">Loading historical data...</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-8">
                          {/* CPU History Chart */}
                          <div>
                            <h3 className="text-md font-medium mb-2 flex items-center">
                              <Cpu className="h-4 w-4 mr-2 text-blue-500" />
                              CPU Usage History
                            </h3>
                            <div className="h-64 border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                              {historicalData.cpu.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart
                                    data={historicalData.cpu}
                                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                                    <XAxis 
                                      dataKey="time"
                                      tick={{ fontSize: 12 }}
                                      className="text-gray-600 dark:text-gray-400"
                                    />
                                    <YAxis 
                                      domain={[0, 100]}
                                      tickFormatter={(value) => `${value}%`}
                                      tick={{ fontSize: 12 }}
                                      className="text-gray-600 dark:text-gray-400"
                                    />
                                    <Tooltip content={<CustomTooltip valueFormatter={(value) => `${value}%`} />} />
                                    <Line 
                                      type="monotone" 
                                      dataKey="CPU" 
                                      stroke="#3b82f6" 
                                      strokeWidth={2}
                                      dot={{ r: 2 }}
                                      activeDot={{ r: 5 }}
                                      name="CPU Usage"
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              ) : (
                                <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                                  No historical CPU data available
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Memory History Chart */}
                          <div>
                            <h3 className="text-md font-medium mb-2 flex items-center">
                              <MemoryStick className="h-4 w-4 mr-2 text-purple-500" />
                              Memory Usage History
                            </h3>
                            <div className="h-64 border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                              {historicalData.memory.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart
                                    data={historicalData.memory}
                                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                                    <XAxis 
                                      dataKey="time"
                                      tick={{ fontSize: 12 }}
                                      className="text-gray-600 dark:text-gray-400"
                                    />
                                    <YAxis 
                                      domain={[0, 100]}
                                      tickFormatter={(value) => `${value}%`}
                                      tick={{ fontSize: 12 }}
                                      className="text-gray-600 dark:text-gray-400"
                                    />
                                    <Tooltip content={<CustomTooltip valueFormatter={(value) => `${value}%`} />} />
                                    <Line 
                                      type="monotone" 
                                      dataKey="Memory" 
                                      stroke="#a855f7" 
                                      strokeWidth={2}
                                      dot={{ r: 2 }}
                                      activeDot={{ r: 5 }}
                                      name="Memory Usage"
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              ) : (
                                <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                                  No historical memory data available
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Disk Usage History */}
                          <div>
                            <h3 className="text-md font-medium mb-2 flex items-center">
                              <HardDrive className="h-4 w-4 mr-2 text-amber-500" />
                              Disk Usage History
                            </h3>
                            <div className="h-64 border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                              {historicalData.disk.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart
                                    data={historicalData.disk}
                                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                                    <XAxis 
                                      dataKey="time"
                                      tick={{ fontSize: 12 }}
                                      className="text-gray-600 dark:text-gray-400"
                                    />
                                    <YAxis 
                                      domain={[0, 100]}
                                      tickFormatter={(value) => `${value}%`}
                                      tick={{ fontSize: 12 }}
                                      className="text-gray-600 dark:text-gray-400"
                                    />
                                    <Tooltip content={<CustomTooltip valueFormatter={(value) => `${value}%`} />} />
                                    <Line 
                                      type="monotone" 
                                      dataKey="Usage" 
                                      stroke="#f59e0b" 
                                      strokeWidth={2}
                                      dot={{ r: 2 }}
                                      activeDot={{ r: 5 }}
                                      name="Disk Usage"
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              ) : (
                                <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                                  No historical disk data available
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Network History */}
                          <div>
                            <h3 className="text-md font-medium mb-2 flex items-center">
                              <Network className="h-4 w-4 mr-2 text-emerald-500" />
                              Network Traffic History
                            </h3>
                            <div className="h-64 border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                              {historicalData.network.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart
                                    data={historicalData.network}
                                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                                    <XAxis 
                                      dataKey="time"
                                      tick={{ fontSize: 12 }}
                                      className="text-gray-600 dark:text-gray-400"
                                    />
                                    <YAxis 
                                      tickFormatter={(value) => `${value} B/s`}
                                      tick={{ fontSize: 12 }}
                                      className="text-gray-600 dark:text-gray-400"
                                    />
                                    <Tooltip content={<CustomTooltip valueFormatter={(value) => `${value} B/s`} />} />
                                    <Legend />
                                    <Line 
                                      type="monotone" 
                                      dataKey="In" 
                                      stroke="#10b981" 
                                      strokeWidth={2}
                                      dot={{ r: 2 }}
                                      activeDot={{ r: 5 }}
                                      name="Incoming"
                                    />
                                    <Line 
                                      type="monotone" 
                                      dataKey="Out" 
                                      stroke="#3b82f6" 
                                      strokeWidth={2}
                                      dot={{ r: 2 }}
                                      activeDot={{ r: 5 }}
                                      name="Outgoing"
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              ) : (
                                <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                                  No historical network data available
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Load Average History */}
                          <div>
                            <h3 className="text-md font-medium mb-2 flex items-center">
                              <LineChartIcon className="h-4 w-4 mr-2 text-rose-500" />
                              Load Average History
                            </h3>
                            <div className="h-64 border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                              {historicalData.load.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart
                                    data={historicalData.load}
                                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                                    <XAxis 
                                      dataKey="time"
                                      tick={{ fontSize: 12 }}
                                      className="text-gray-600 dark:text-gray-400"
                                    />
                                    <YAxis 
                                      tick={{ fontSize: 12 }}
                                      className="text-gray-600 dark:text-gray-400"
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line 
                                      type="monotone" 
                                      dataKey="Load" 
                                      stroke="#f43f5e" 
                                      strokeWidth={2}
                                      dot={{ r: 2 }}
                                      activeDot={{ r: 5 }}
                                      name="Load Average"
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              ) : (
                                <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                                  No historical load data available
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                    
                    <CardFooter className="flex justify-between">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Total data points available: {totalPoints}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Showing: {historicalData.cpu.length} points
                      </div>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}