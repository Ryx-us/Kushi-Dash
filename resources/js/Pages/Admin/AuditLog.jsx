import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { LoadingScreen } from '@/components/loading-screen';

const AuditLogComp = () => {
    const [logs, setLogs] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await fetch('/admin/api/logs');
                const data = await response.text();
                const reversedLogs = data.split('\n').reverse().join('\n');
                setLogs(reversedLogs);
            } catch (error) {
                console.error('Error fetching logs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    const getLogStyle = (log) => {
        if (log.includes('ERROR')) {
            return 'text-red-500';
        } else if (log.startsWith('#')) {
            return 'text-green-500';
        }else if (log.includes('[stacktrace]')) {
            return 'text-red-500';
        }else if (log.includes('[previous exception]')) {
            return 'text-red-500';
        }else if (log.includes('WARNING')) {
            return 'text-yellow-500';
        } else {
            return 'text-green-800';
        }
    };

    return (
        <Card className="w-full max-w-screen mx-auto">
            <CardHeader>
                <CardTitle>Kushi Engine</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center items-center">
                       <LoadingScreen/>
                    </div>
                ) : (
                    <div className="overflow-auto max-h-screen max-w-screen ">
                        {logs.split('\n').map((log, index) => (
                            <p key={index} className={`whitespace-pre-wrap ${getLogStyle(log)}`}>
                                {log}
                            </p>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default AuditLogComp;
