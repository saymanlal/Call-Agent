'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { Download, Phone, CheckCircle, XCircle, Clock } from 'lucide-react';

interface ProgressData {
  surveyId: string;
  status: string;
  totalContacts: number;
  completed: number;
  failed: number;
  pending: number;
  progress: {
    percentage: number;
    completed: number;
    total: number;
  };
}

interface SurveyProgressProps {
  surveyId: string;
  fileName: string;
  totalContacts: number;
  onStartCalls?: () => void;
}

export function SurveyProgress({
  surveyId,
  fileName,
  totalContacts,
  onStartCalls
}: SurveyProgressProps) {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pollInterval, setPollInterval] = useState<number | null>(null);

  // Fetch progress data
  const fetchProgress = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/surveys/${surveyId}/progress`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }

      const data = await response.json();
      setProgress(data);
      setError(null);

      // Stop polling if all calls are completed or failed
      if (data.status === 'completed' || data.status === 'finished') {
        setPollInterval(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching progress';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchProgress();
  }, [surveyId]);

  // Poll for progress updates
  useEffect(() => {
    if (!pollInterval) return;

    const timer = setInterval(fetchProgress, 2000);
    return () => clearInterval(timer);
  }, [pollInterval, surveyId]);

  const handleStartCalls = async () => {
    setIsStarting(true);
    setError(null);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/surveys/${surveyId}/start-calls`, {
        method: 'POST'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start calls');
      }

      // Start polling for updates
      setPollInterval(2000);
      onStartCalls?.();
      
      // Fetch initial progress
      await fetchProgress();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start calls';
      setError(errorMessage);
    } finally {
      setIsStarting(false);
    }
  };

  const handleDownload = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/surveys/${surveyId}/download`);

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      // Get filename from header or use default
      const contentDisposition = response.headers.get('content-disposition');
      const fileName = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : 'survey-results.xlsx';

      // Create blob and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download file');
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-8">
          <Spinner className="h-6 w-6" />
          <span className="ml-2">Loading survey status...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Survey Progress</CardTitle>
        <CardDescription>{fileName}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {progress?.totalContacts || totalContacts}
            </div>
            <div className="text-xs text-gray-600 mt-1">Total Contacts</div>
          </div>

          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <div className="text-2xl font-bold text-green-600">{progress?.completed || 0}</div>
            </div>
            <div className="text-xs text-gray-600 mt-1">Completed</div>
          </div>

          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="flex items-center justify-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <div className="text-2xl font-bold text-red-600">{progress?.failed || 0}</div>
            </div>
            <div className="text-xs text-gray-600 mt-1">Failed</div>
          </div>

          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <div className="text-2xl font-bold text-yellow-600">{progress?.pending || 0}</div>
            </div>
            <div className="text-xs text-gray-600 mt-1">Pending</div>
          </div>
        </div>

        {/* Progress Bar */}
        {progress && (
          <>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">Calls Progress</span>
                <span className="text-gray-600">{progress.progress.percentage}%</span>
              </div>
              <Progress
                value={progress.progress.percentage}
                className="h-3"
              />
              <p className="text-xs text-gray-500">
                {progress.progress.completed} of {progress.progress.total} calls completed
              </p>
            </div>
          </>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Status Message */}
        {progress?.status === 'pending' && (
          <Alert className="border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-800">
              Survey is ready to begin. Click "Start Calling" to initiate calls to all contacts.
            </AlertDescription>
          </Alert>
        )}

        {progress?.status === 'in_progress' && (
          <Alert className="border-purple-200 bg-purple-50">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-purple-600" />
              <AlertDescription className="text-purple-800">
                Calls are in progress. You can close this window and return later to check results.
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 flex-col sm:flex-row">
          {progress?.status === 'pending' && (
            <Button
              onClick={handleStartCalls}
              disabled={isStarting}
              className="flex-1"
            >
              {isStarting ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Starting...
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4 mr-2" />
                  Start Calling
                </>
              )}
            </Button>
          )}

          {(progress?.completed || progress?.failed) > 0 && (
            <Button
              onClick={handleDownload}
              variant="outline"
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Results
            </Button>
          )}
        </div>

        {/* Refresh Button for in-progress surveys */}
        {progress?.status === 'in_progress' && (
          <Button
            onClick={fetchProgress}
            variant="outline"
            className="w-full"
          >
            Refresh Status
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
