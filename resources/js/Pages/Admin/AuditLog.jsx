import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2, RefreshCw, Download, Clock } from "lucide-react";
import { LoadingScreen } from '@/components/loading-screen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const AuditLogComp = () => {
    const [logs, setLogs] = useState('');
    const [loading, setLoading] = useState(true);
    const [lineCount, setLineCount] = useState(250);
    const [refreshing, setRefreshing] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [refreshInterval, setRefreshInterval] = useState(null);

    const fetchLogs = async (lines = lineCount) => {
        setRefreshing(true);
        try {
            const response = await fetch(`/admin/api/logs?l=${lines}`);
            const data = await response.text();
            const reversedLogs = data.split('\n').reverse().join('\n');
            setLogs(reversedLogs);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        
        return () => {
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
        };
    }, []);
    
    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(() => {
                fetchLogs();
            }, 5000); // Refresh every 5 seconds
            setRefreshInterval(interval);
        } else if (refreshInterval) {
            clearInterval(refreshInterval);
            setRefreshInterval(null);
        }
        
        return () => {
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
        };
    }, [autoRefresh]);

    const handleRefresh = () => {
        fetchLogs();
    };

    const handleLineCountChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value > 0) {
            setLineCount(value);
        }
    };

    const handleLineCountSubmit = (e) => {
        e.preventDefault();
        fetchLogs(lineCount);
    };

    const toggleAutoRefresh = () => {
        setAutoRefresh(!autoRefresh);
    };

    const getLogStyle = (log) => {
        if (log.includes('ERROR')) {
            return 'text-red-500';
        } else if (log.startsWith('#')) {
            return 'text-green-500';
        } else if (log.includes('[stacktrace]')) {
            return 'text-red-500 pl-4';
        } else if (log.includes('[previous exception]')) {
            return 'text-red-500 pl-4';
        } else if (log.includes('WARNING')) {
            return 'text-yellow-500';
        } else {
            return 'text-green-800';
        }
    };

    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-lg">Engine Logs</CardTitle>
                        <CardDescription>
                            Showing the last {lineCount} log entries (newest first)
                        </CardDescription>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <form onSubmit={handleLineCountSubmit} className="flex items-center gap-2">
                            <div className="w-24">
                                <Input
                                    id="lineCount"
                                    type="number"
                                    min="4"
                                    max="100000"
                                    className="h-8"
                                    value={lineCount}
                                    onChange={handleLineCountChange}
                                    placeholder="Lines"
                                />
                            </div>
                            <Button 
                                type="submit" 
                                variant="outline"
                                size="sm"
                                disabled={loading || refreshing}
                            >
                                Apply
                            </Button>
                        </form>
                        
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="auto-refresh"
                                checked={autoRefresh}
                                onCheckedChange={toggleAutoRefresh}
                            />
                            <Label htmlFor="auto-refresh" className="text-sm">Auto</Label>
                        </div>
                        
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={loading || refreshing}
                        >
                            {refreshing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            
            <CardContent className="max-w-screen-xl">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <LoadingScreen />
                    </div>
                ) : (
                    <div className="relative">
                        <div className="overflow-auto h-[500px] p-4 rounded-md font-mono text-sm border">
                            {logs.split('\n').map((log, index) => (
                                <p key={index} className={`whitespace-pre-wrap ${getLogStyle(log)} mb-1`}>
                                    {log}
                                </p>
                            ))}
                        </div>
                        {refreshing && (
                            <div className="absolute bottom-4 right-4 bg-primary/10 p-2 rounded-full w-10 h-10 flex items-center justify-center shadow-md">
                                <Loader2 className="animate-spin h-5 w-5 text-primary" />
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default AuditLogComp;