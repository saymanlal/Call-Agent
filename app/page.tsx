'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { SurveyProgress } from '@/components/SurveyProgress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Phone, Upload, BarChart3, CheckCircle } from 'lucide-react';

export default function Home() {
  const [surveyId, setSurveyId] = useState<string | null>(null);
  const [surveyFileName, setSurveyFileName] = useState<string>('');
  const [totalContacts, setTotalContacts] = useState(0);

  const handleUploadSuccess = (id: string, fileName: string, total: number) => {
    setSurveyId(id);
    setSurveyFileName(fileName);
    setTotalContacts(total);
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
            <h1 className="text-3xl sm:text-4xl font-bold text-white">IVR Survey Platform</h1>
          </div>
          <p className="text-gray-300 text-lg">
            Automated voice surveys with Excel integration
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {!surveyId ? (
            <>
              {/* Features Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3">
                    <Upload className="w-6 h-6 text-blue-400 mb-2" />
                    <CardTitle className="text-white">Upload Excel</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-300">
                      Upload a spreadsheet with names and phone numbers
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3">
                    <Phone className="w-6 h-6 text-green-400 mb-2" />
                    <CardTitle className="text-white">Auto Calling</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-300">
                      Platform automatically calls and greets contacts by name
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3">
                    <BarChart3 className="w-6 h-6 text-purple-400 mb-2" />
                    <CardTitle className="text-white">Get Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-300">
                      Download updated Excel with all responses
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Upload Component */}
              <FileUpload onUploadSuccess={handleUploadSuccess} />

              {/* Instructions */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">How It Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-300">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-600 text-white text-sm font-semibold">
                        1
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-white">Prepare Your Excel File</h3>
                      <p className="text-sm mt-1">
                        Column A: Contact Names | Column B: Phone Numbers
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-green-600 text-white text-sm font-semibold">
                        2
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-white">Upload & Start</h3>
                      <p className="text-sm mt-1">
                        Upload your file and click "Start Calling" to begin the survey
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-purple-600 text-white text-sm font-semibold">
                        3
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-white">IVR Survey Flow</h3>
                      <p className="text-sm mt-1">
                        Platform calls contacts, greets by name, and asks:
                      </p>
                      <ul className="text-sm mt-2 space-y-1 ml-4">
                        <li>• Have you passed 12th from Mathematics? (Yes/No)</li>
                        <li>• Interested in Engineering? (Yes/No)</li>
                        <li>• If No, which course? (Science/Commerce/Arts/Other)</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-yellow-600 text-white text-sm font-semibold">
                        4
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-white">Download Results</h3>
                      <p className="text-sm mt-1">
                        Get Excel file with all responses automatically filled in
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {/* Survey Progress */}
              <SurveyProgress
                surveyId={surveyId}
                fileName={surveyFileName}
                totalContacts={totalContacts}
              />

              {/* New Survey Button */}
              <button
                onClick={handleStartNewSurvey}
                className="w-full text-center text-gray-400 hover:text-gray-300 text-sm py-3 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Start New Survey
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>IVR Survey Platform v1.0 • Powered by Twilio • Data stored in Supabase</p>
        </div>
      </div>
    </main>
  );
}
