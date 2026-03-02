import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Activity, Play, Terminal, CheckCircle2, AlertTriangle } from "lucide-react";
import { API_CONFIG } from '@/config/api';

const HealthCheck = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runHealthCheck = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_CONFIG.baseUrl}/admin/system/health`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token || ''
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Health check failed');
      }

      setResult(data.output);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Health Check</h1>
        <p className="text-muted-foreground">Run automated diagnostics and workflow verification.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Diagnostic Tool
          </CardTitle>
          <CardDescription>
            This tool runs the server-side verification script (verify_workflow.js) to check database integrity and workflow continuity.
            <br />
            <span className="text-yellow-600 font-medium">Warning: This may create test data in the system.</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runHealthCheck} disabled={loading} className="w-full sm:w-auto">
            {loading ? (
              <>
                <Activity className="mr-2 h-4 w-4 animate-spin" />
                Running Diagnostics...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run System Verification
              </>
            )}
          </Button>

          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2 text-green-600 font-medium">
                <CheckCircle2 className="h-5 w-5" />
                Verification Complete
              </div>
              <div className="bg-black/90 text-green-400 p-4 rounded-md font-mono text-sm overflow-x-auto whitespace-pre-wrap h-96">
                {result}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthCheck;
