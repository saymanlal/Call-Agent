'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Alert,
  AlertDescription
} from '@/components/ui/alert';
import {
  UploadCloud,
  Loader2,
  Check,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';

interface FileUploadProps {
  onUploadSuccess: (
    surveyId: string,
    fileName: string,
    totalContacts: number
  ) => void;
  isLoading?: boolean;
}

export function FileUpload({
  onUploadSuccess,
  isLoading = false
}: FileUploadProps) {
  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [dragging, setDragging] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const [fileName, setFileName] =
    useState('');

  const [error, setError] =
    useState('');

  const [success, setSuccess] =
    useState(false);

  const API =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    'https://call-agent-envo.onrender.com';

  const validateFile = (file: File) => {
    const ok =
      file.name.match(/\.(xlsx?|csv|json)$/i);

    if (!ok) {
      setError(
        'Allowed formats: XLSX, XLS, CSV, JSON'
      );
      return false;
    }

    return true;
  };

  const uploadFile = async (
    file: File
  ) => {
    setUploading(true);
    setProgress(0);
    setError('');
    setSuccess(false);

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();

    xhr.open(
      'POST',
      `${API}/api/surveys/upload`
    );

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round(
          (e.loaded / e.total) * 100
        );

        setProgress(percent);
      }
    };

    xhr.onload = () => {
      setUploading(false);

      if (
        xhr.status >= 200 &&
        xhr.status < 300
      ) {
        const data = JSON.parse(
          xhr.responseText
        );

        setSuccess(true);

        onUploadSuccess(
          data.survey.id,
          data.survey.fileName,
          data.survey.totalContacts
        );
      } else {
        const err = JSON.parse(
          xhr.responseText
        );

        setError(
          err.error || 'Upload failed'
        );
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      setError('Network error');
    };

    xhr.send(formData);
  };

  const onSelect = async (
    file: File
  ) => {
    if (!validateFile(file)) return;

    setFileName(file.name);
    uploadFile(file);
  };

  return (
    <Card className="border-white/10 bg-[#0f1117] text-white shadow-2xl rounded-2xl overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-slate-600 via-zinc-300 to-slate-600" />

      <CardHeader>
        <CardTitle className="text-2xl tracking-tight">
          Survey Agent 101
        </CardTitle>

        <CardDescription className="text-zinc-400">
          Upload source sheet to begin
          automated survey campaign
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() =>
            setDragging(false)
          }
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);

            if (
              e.dataTransfer.files[0]
            ) {
              onSelect(
                e.dataTransfer.files[0]
              );
            }
          }}
          className={`rounded-2xl border-2 border-dashed p-10 text-center transition ${
            dragging
              ? 'border-white bg-white/5'
              : 'border-white/10'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".xlsx,.xls,.csv,.json"
            onChange={(e) => {
              if (
                e.target.files?.[0]
              ) {
                onSelect(
                  e.target.files[0]
                );
              }
            }}
          />

          <div className="space-y-4 flex flex-col items-center">
            {uploading ? (
              <Loader2 className="w-10 h-10 animate-spin text-white" />
            ) : (
              <UploadCloud className="w-10 h-10 text-zinc-400" />
            )}

            <div className="space-y-1">
              <p className="font-medium">
                {uploading
                  ? `Uploading ${progress}%`
                  : 'Drop file here'}
              </p>

              <p className="text-sm text-zinc-500">
                or choose file manually
              </p>
            </div>

            <Button
              onClick={() =>
                fileInputRef.current?.click()
              }
              disabled={
                uploading ||
                isLoading
              }
              className="bg-white text-black hover:bg-zinc-200"
            >
              Browse Files
            </Button>
          </div>
        </div>

        {uploading && (
          <div className="space-y-2">
            <div className="text-sm text-zinc-400 flex justify-between">
              <span>Transfer</span>
              <span>{progress}%</span>
            </div>

            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-white transition-all"
                style={{
                  width: `${progress}%`
                }}
              />
            </div>
          </div>
        )}

        {fileName && (
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex items-center gap-3">
            <FileSpreadsheet className="w-4 h-4 text-zinc-300" />
            <span className="text-sm truncate">
              {fileName}
            </span>
          </div>
        )}

        {error && (
          <Alert className="border-red-500/30 bg-red-500/10 text-red-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500/30 bg-green-500/10 text-green-200">
            <Check className="h-4 w-4" />
            <AlertDescription>
              File uploaded successfully
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}