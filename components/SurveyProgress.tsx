'use client';

import {
  useEffect,
  useRef,
  useState
} from 'react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Alert,
  AlertDescription
} from '@/components/ui/alert';

import {
  Loader2,
  Phone,
  Download,
  RefreshCw,
  Eye
} from 'lucide-react';

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

interface Props {
  surveyId: string;
  fileName: string;
  totalContacts: number;
}

export function SurveyProgress({
  surveyId,
  fileName,
  totalContacts
}: Props) {
  const API =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    'https://call-agent-envo.onrender.com';

  const [data, setData] =
    useState<ProgressData | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [starting, setStarting] =
    useState(false);

  const timer =
    useRef<NodeJS.Timeout | null>(
      null
    );

  const fetchProgress =
    async () => {
      const res = await fetch(
        `${API}/api/surveys/${surveyId}/progress?t=${Date.now()}`,
        { cache: 'no-store' }
      );

      const json =
        await res.json();

      setData(json);
      setLoading(false);

      if (json.pending === 0) {
        if (timer.current)
          clearInterval(
            timer.current
          );
      }
    };

  useEffect(() => {
    fetchProgress();

    timer.current =
      setInterval(
        fetchProgress,
        3000
      );

    return () => {
      if (timer.current)
        clearInterval(
          timer.current
        );
    };
  }, []);

  const startCalls =
    async () => {
      setStarting(true);

      await fetch(
        `${API}/api/surveys/${surveyId}/start-calls`,
        { method: 'POST' }
      );

      fetchProgress();
      setStarting(false);
    };

  const openSheet = () => {
    window.open(
      `${API}/api/surveys/${surveyId}/download?t=${Date.now()}`,
      '_blank'
    );
  };

  if (loading) {
    return (
      <Card className="bg-[#0f1117] border-white/10 text-white rounded-2xl">
        <CardContent className="py-10 flex justify-center items-center gap-3">
          <Loader2 className="animate-spin w-5 h-5" />
          Loading
        </CardContent>
      </Card>
    );
  }

  const total =
    data?.totalContacts ||
    totalContacts;

  const completed =
    data?.completed || 0;

  const failed =
    data?.failed || 0;

  const pending =
    data?.pending || 0;

  const percent =
    data?.progress
      ?.percentage || 0;

  const status =
    data?.status ||
    'pending';

  const stats = [
    ['Total', total],
    ['Completed', completed],
    ['Failed', failed],
    ['Pending', pending]
  ];

  return (
    <Card className="bg-[#0f1117] border-white/10 text-white rounded-2xl shadow-2xl overflow-hidden">

      <div className="h-1 bg-gradient-to-r from-zinc-700 via-white to-zinc-700" />

      <CardHeader>
        <CardTitle className="text-2xl">
          Survey Agent 101
        </CardTitle>

        <CardDescription className="text-zinc-400 truncate">
          {fileName}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div
              key={s[0]}
              className="rounded-xl border border-white/10 bg-white/5 p-4 text-center"
            >
              <p className="text-xs text-zinc-400">
                {s[0]}
              </p>

              <p className="text-2xl font-semibold mt-1">
                {s[1]}
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-zinc-400">
            <span>Progress</span>
            <span>{percent}%</span>
          </div>

          <Progress
            value={percent}
            className="h-2 bg-white/10"
          />
        </div>

        {status ===
          'in_progress' && (
          <Alert className="border-white/10 bg-white/5 text-zinc-300">
            <AlertDescription>
              Live calling campaign
              running
            </AlertDescription>
          </Alert>
        )}

        {status ===
          'completed' && (
          <Alert className="border-green-500/20 bg-green-500/10 text-green-300">
            <AlertDescription>
              Campaign completed
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-3 gap-3">

          {status ===
            'pending' && (
            <Button
              onClick={
                startCalls
              }
              disabled={
                starting
              }
              className="bg-white text-black hover:bg-zinc-200"
            >
              <Phone className="w-4 h-4 mr-2" />
              {starting
                ? 'Starting'
                : 'Start Calling'}
            </Button>
          )}

          <Button
            variant="outline"
            onClick={
              fetchProgress
            }
            className="border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>

          <Button
            onClick={
              openSheet
            }
            className="bg-white/10 hover:bg-white/15 border border-white/10"
          >
            <Eye className="w-4 h-4 mr-2" />
            Sheet Viewer
          </Button>

          <Button
            onClick={
              openSheet
            }
            className="bg-white text-black hover:bg-zinc-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>

        </div>
      </CardContent>
    </Card>
  );
}