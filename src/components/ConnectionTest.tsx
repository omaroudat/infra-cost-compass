
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

const ConnectionTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'failed'>('testing');
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRetesting, setIsRetesting] = useState(false);

  const testConnection = async () => {
    console.log('Starting connection test...');
    setConnectionStatus('testing');
    setError(null);
    setIsRetesting(true);
    const results: any[] = [];

    try {
      // Test 1: Basic Supabase connection
      console.log('Testing basic Supabase connection...');
      const startTime = Date.now();
      
      try {
        const { data, error: connectionError, count } = await supabase
          .from('boq_items')
          .select('*', { count: 'exact', head: true });
        
        const responseTime = Date.now() - startTime;
        
        if (connectionError) {
          console.error('Database connection error:', connectionError);
          results.push({
            test: 'Database Connection',
            status: 'failed',
            error: connectionError.message,
            time: responseTime
          });
        } else {
          console.log('Database connection successful, count:', count);
          results.push({
            test: 'Database Connection',
            status: 'success',
            count: count,
            time: responseTime
          });
        }
      } catch (err) {
        console.error('Database connection failed with exception:', err);
        results.push({
          test: 'Database Connection',
          status: 'failed',
          error: err instanceof Error ? err.message : 'Network error',
          time: Date.now() - startTime
        });
      }

      // Test 2: Authentication status
      console.log('Testing authentication...');
      try {
        const { data: authData, error: authError } = await supabase.auth.getSession();
        
        if (authError) {
          console.error('Auth error:', authError);
          results.push({
            test: 'Authentication',
            status: 'failed',
            error: authError.message
          });
        } else {
          console.log('Auth session:', authData?.session ? 'Active' : 'No session');
          results.push({
            test: 'Authentication',
            status: authData?.session ? 'success' : 'warning',
            user: authData?.session?.user?.id || 'No active session'
          });
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        results.push({
          test: 'Authentication',
          status: 'failed',
          error: err instanceof Error ? err.message : 'Auth check failed'
        });
      }

      // Test 3: Network connectivity
      console.log('Testing network connectivity...');
      try {
        const response = await fetch('https://xlxqgasvhfohmmyftskf.supabase.co/rest/v1/', {
          method: 'HEAD',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhseHFnYXN2aGZvaG1teWZ0c2tmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMTQ1MjQsImV4cCI6MjA2MzY5MDUyNH0.m9h9_1zwvdbQ4RTuXfAz6Llsix5YZFsWFYOizbTer78'
          }
        });
        
        results.push({
          test: 'Network Connectivity',
          status: response.ok ? 'success' : 'failed',
          statusCode: response.status
        });
      } catch (err) {
        console.error('Network test failed:', err);
        results.push({
          test: 'Network Connectivity',
          status: 'failed',
          error: 'Network unreachable'
        });
      }

      setTestResults(results);
      const hasFailures = results.some(r => r.status === 'failed');
      setConnectionStatus(hasFailures ? 'failed' : 'connected');
      
      console.log('Connection test completed. Results:', results);
      
    } catch (error) {
      console.error('Connection test failed completely:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setConnectionStatus('failed');
    } finally {
      setIsRetesting(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'testing':
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'success': 'default' as const,
      'failed': 'destructive' as const,
      'warning': 'secondary' as const,
      'testing': 'secondary' as const
    };
    return <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>{status}</Badge>;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon(connectionStatus)}
          Database Connection Test
        </CardTitle>
        <CardDescription>
          Testing connection to Supabase database and services
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Overall Status:</span>
          {getStatusBadge(connectionStatus)}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm font-medium">Critical Error:</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="font-medium">Test Results:</h4>
          {testResults.length === 0 && connectionStatus === 'testing' ? (
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <Clock className="w-4 h-4 animate-spin" />
              <span className="text-sm">Running tests...</span>
            </div>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex-1">
                  <span className="text-sm font-medium">{result.test}</span>
                  {result.error && (
                    <p className="text-xs text-red-600 mt-1">{result.error}</p>
                  )}
                  {result.count !== undefined && (
                    <p className="text-xs text-gray-500 mt-1">Records available: {result.count}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {result.time && <span className="text-xs text-gray-500">{result.time}ms</span>}
                  {result.statusCode && <span className="text-xs text-gray-500">HTTP {result.statusCode}</span>}
                  {getStatusBadge(result.status)}
                </div>
              </div>
            ))
          )}
        </div>

        <Button 
          onClick={testConnection} 
          variant="outline" 
          className="w-full" 
          disabled={isRetesting}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRetesting ? 'animate-spin' : ''}`} />
          {isRetesting ? 'Testing...' : 'Test Again'}
        </Button>

        {connectionStatus === 'failed' && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h5 className="font-medium text-blue-800 mb-2">Troubleshooting Tips:</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Check your internet connection</li>
              <li>• Try refreshing the page</li>
              <li>• Verify Supabase service status</li>
              <li>• Check browser console for detailed errors</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectionTest;
