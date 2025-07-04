
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const ConnectionTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'failed'>('testing');
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any[]>([]);

  const testConnection = async () => {
    setConnectionStatus('testing');
    setError(null);
    const results: any[] = [];

    try {
      // Test 1: Basic connection
      const startTime = Date.now();
      const { data, error: connectionError } = await supabase
        .from('boq_items')
        .select('count', { count: 'exact', head: true });
      
      const responseTime = Date.now() - startTime;
      
      if (connectionError) {
        results.push({
          test: 'Database Connection',
          status: 'failed',
          error: connectionError.message,
          time: responseTime
        });
      } else {
        results.push({
          test: 'Database Connection',
          status: 'success',
          count: data,
          time: responseTime
        });
      }

      // Test 2: Authentication
      const { data: authData, error: authError } = await supabase.auth.getSession();
      results.push({
        test: 'Authentication',
        status: authError ? 'failed' : 'success',
        user: authData?.session?.user?.id || 'No user',
        error: authError?.message
      });

      // Test 3: RLS policies
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('count', { count: 'exact', head: true });
      
      results.push({
        test: 'RLS Policies',
        status: profileError ? 'failed' : 'success',
        error: profileError?.message
      });

      setTestResults(results);
      setConnectionStatus(results.some(r => r.status === 'failed') ? 'failed' : 'connected');
    } catch (error) {
      console.error('Connection test failed:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setConnectionStatus('failed');
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'testing':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'success' ? 'default' : status === 'failed' ? 'destructive' : 'secondary';
    return <Badge variant={variant}>{status}</Badge>;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon(connectionStatus)}
          Database Connection Test
        </CardTitle>
        <CardDescription>
          Testing connection to Supabase database and authentication
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Overall Status:</span>
          {getStatusBadge(connectionStatus)}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="font-medium">Test Results:</h4>
          {testResults.map((result, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">{result.test}</span>
              <div className="flex items-center gap-2">
                {result.time && <span className="text-xs text-gray-500">{result.time}ms</span>}
                {getStatusBadge(result.status)}
              </div>
            </div>
          ))}
        </div>

        <Button onClick={testConnection} variant="outline" className="w-full">
          Test Again
        </Button>
      </CardContent>
    </Card>
  );
};

export default ConnectionTest;
