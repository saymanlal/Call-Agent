'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { SurveyProgress } from '@/components/SurveyProgress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Upload, BarChart3 } from 'lucide-react';

export default function Home() {
  const [surveyId, setSurveyId] = useState<string | null>(null);
  const [surveyFileName, setSurveyFileName] = useState('');
  const [totalContacts, setTotalContacts] = useState(0);

  const handleUploadSuccess = async (
    id: string,
    fileName: string,
    total: number
  ) => {
    try {
      const API =
        process.env.NEXT_PUBLIC_API_URL ||
        'https://call-agent-envo.onrender.com';

      // set UI first
      setSurveyId(id);
      setSurveyFileName(fileName);
      setTotalContacts(total);

      // AUTO START CALLING
      const res = await fetch(
        `${API}/api/surveys/${id}/start-calls`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await res.json();
      console.log('Calling started:', data);
    } catch (error) {
      console.error('Failed to start calling:', error);
      alert('Survey uploaded but failed to start calls.');
    }
  };

  const handleStartNewSurvey = () => {
    setSurveyId(null);
    setSurveyFileName('');
    setTotalContacts(0);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Phone className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              IVR Survey Platform
            </h1>
          </div>

          <p className="text-gray-300 text-lg">
            Automated voice surveys with Excel integration
          </p>
        </div>

        {!surveyId ? (
          <div className="space-y-6">

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <Upload className="w-6 h-6 text-blue-400 mb-2" />
                  <CardTitle className="text-white">
                    Upload Excel
                  </CardTitle>
                </CardHeader>

                <CardContent className="text-gray-300 text-sm">
                  Upload names and phone numbers
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <Phone className="w-6 h-6 text-green-400 mb-2" />
                  <CardTitle className="text-white">
                    Auto Calling
                  </CardTitle>
                </CardHeader>

                <CardContent className="text-gray-300 text-sm">
                  Calls begin automatically after upload
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <BarChart3 className="w-6 h-6 text-purple-400 mb-2" />
                  <CardTitle className="text-white">
                    Results
                  </CardTitle>
                </CardHeader>

                <CardContent className="text-gray-300 text-sm">
                  Download completed survey Excel
                </CardContent>
              </Card>

            </div>

            {/* Upload Component */}
            <FileUpload onUploadSuccess={handleUploadSuccess} />

          </div>
        ) : (
          <div className="space-y-6">

            <SurveyProgress
              surveyId={surveyId}
              fileName={surveyFileName}
              totalContacts={totalContacts}
            />

            <button
              onClick={handleStartNewSurvey}
              className="w-full py-3 border border-slate-700 rounded-lg text-gray-300 hover:bg-slate-800"
            >
              Start New Survey
            </button>

          </div>
        )}

        <div className="mt-12 text-center text-gray-500 text-sm">
          IVR Survey Platform v1.0 • Powered by Twilio • Data stored in Supabase
        </div>

      </div>
    </main>
  );
}