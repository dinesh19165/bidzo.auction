import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoaderCircle, Mic, RotateCcw, Square } from 'lucide-react';
import type { CategoryRecord } from '../api/categoryApi';
import { voiceProductSearch, type VoiceProductSearchData } from '../api/voiceSearchApi';
import { ApiError } from '../api/apiClient';
import { ErrorState } from './loading/LoadingComponents';
import { Modal } from './common/Feedback';
import { useLocaleContext } from '../context/LocaleContext';

interface SpeechRecognitionResultItem {
  isFinal: boolean;
  0: { transcript: string };
}

interface SpeechRecognitionEventLike extends Event {
  results: ArrayLike<SpeechRecognitionResultItem>;
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;
type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

interface Props {
  open: boolean;
  categories: CategoryRecord[];
  onClose: () => void;
}

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | undefined {
  if (typeof window === 'undefined') return undefined;
  const speechWindow = window as SpeechRecognitionWindow;
  return speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
}

function searchParams(keyword: string, categoryId: string): URLSearchParams {
  const params = new URLSearchParams({ page: '0' });
  if (keyword.trim()) params.set('q', keyword.trim());
  if (categoryId) params.set('categoryId', categoryId);
  return params;
}

export function VoiceSearchModal({ open, categories, onClose }: Props) {
  const navigate = useNavigate();
  const { language } = useLocaleContext();
  const openRef = useRef(open);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const discardRecordingRef = useRef(false);
  const mountedRef = useRef(true);
  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [unsupportedMessage, setUnsupportedMessage] = useState('');
  const [keywordOnlyMode, setKeywordOnlyMode] = useState(false);
  openRef.current = open;

  const stopCapture = (discard: boolean) => {
    discardRecordingRef.current = discard;
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    if (recognition) {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {
        recognition.abort();
      } catch {
        // Recognition may already have stopped.
      }
    }

    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      try {
        recorder.stop();
      } catch {
        // The stream is stopped below even if the recorder has already ended.
      }
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setListening(false);
    setProcessing(false);
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      discardRecordingRef.current = true;
      const recognition = recognitionRef.current;
      recognitionRef.current = null;
      if (recognition) {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        try {
          recognition.abort();
        } catch {
          // Recognition may already have stopped.
        }
      }
      const recorder = recorderRef.current;
      recorderRef.current = null;
      if (recorder) {
        recorder.ondataavailable = null;
        recorder.onstop = null;
        recorder.onerror = null;
        if (recorder.state !== 'inactive') {
          try {
            recorder.stop();
          } catch {
            // The stream is stopped below even if the recorder has already ended.
          }
        }
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      audioChunksRef.current = [];
    };
  }, []);

  const startCapture = async () => {
    const SpeechRecognition = getSpeechRecognitionConstructor();
    if (!SpeechRecognition) {
      setUnsupportedMessage('Voice search is not supported in this browser. Please type your search.');
      setError('');
      return;
    }
    setUnsupportedMessage('');
    setError('');
    setKeyword('');
    setAudioFile(null);
    setKeywordOnlyMode(false);
    setProcessing(true);
    discardRecordingRef.current = false;
    audioChunksRef.current = [];

    let stream: MediaStream | null = null;
    let recorder: MediaRecorder | null = null;
    if (typeof MediaRecorder !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        if (!mountedRef.current || !openRef.current) return;
        setProcessing(false);
        setError('Microphone permission is required for voice search.');
        return;
      }

      if (!mountedRef.current || !openRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      const supportedTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
      const mimeType = typeof MediaRecorder.isTypeSupported === 'function'
        ? supportedTypes.find((type) => MediaRecorder.isTypeSupported(type))
        : undefined;
      try {
        recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      } catch {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        stream = null;
        setKeywordOnlyMode(true);
        setError('Audio recording is unavailable. Speech recognition can still search by keyword.');
      }

      if (recorder && stream) {
        recorderRef.current = recorder;
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };
        recorder.onstop = () => {
          stream?.getTracks().forEach((track) => track.stop());
          if (streamRef.current === stream) streamRef.current = null;
          if (recorderRef.current === recorder) recorderRef.current = null;
          if (!mountedRef.current || discardRecordingRef.current) {
            audioChunksRef.current = [];
            return;
          }

          const type = recorder?.mimeType || audioChunksRef.current.find((chunk) => chunk.type)?.type || 'audio/webm';
          const blob = new Blob(audioChunksRef.current, { type });
          audioChunksRef.current = [];
          if (!blob.size) {
            setProcessing(false);
            setError('No audio was recorded. Please try again.');
            return;
          }

          const extension = type.includes('mp4') ? 'mp4' : type.includes('ogg') ? 'ogg' : 'webm';
          setAudioFile(new File([blob], `voice-search-${Date.now()}.${extension}`, { type }));
          setProcessing(false);
        };
        recorder.onerror = () => {
          if (!mountedRef.current) return;
          setError('Unable to record audio. Please try again.');
          stopCapture(true);
        };
      }
    } else {
      setKeywordOnlyMode(true);
    }

    let recognition: SpeechRecognitionLike;
    try {
      recognition = new SpeechRecognition();
    } catch {
      stream?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setProcessing(false);
      setError('Unable to start voice recognition. Please try typing your search.');
      return;
    }

    recognitionRef.current = recognition;

    recognition.lang = language === 'en' ? (navigator.language || 'en-US') : `${language}-IN`;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .filter((result) => result.isFinal)
        .map((result) => result[0].transcript.trim())
        .filter(Boolean)
        .join(' ');
      if (transcript) setKeyword(transcript.slice(0, 100));
      recognition.stop();
    };
    recognition.onerror = (event) => {
      if (!mountedRef.current) return;
      const message = event.error === 'not-allowed' || event.error === 'service-not-allowed'
        ? 'Microphone permission is required for voice search.'
        : event.error === 'no-speech'
          ? 'No speech was detected. Please try again.'
          : 'Speech recognition failed. Please try again.';
      setError(message);
      stopCapture(true);
    };
    recognition.onend = () => {
      if (!mountedRef.current || discardRecordingRef.current) return;
      recognitionRef.current = null;
      setListening(false);
      const activeRecorder = recorderRef.current;
      if (activeRecorder?.state === 'recording') {
        setProcessing(true);
        activeRecorder.stop();
      } else {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setProcessing(false);
      }
    };

    try {
      if (recorder) {
        try {
          recorder.start();
        } catch {
          recorderRef.current = null;
          stream?.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
          stream = null;
          recorder = null;
          setKeywordOnlyMode(true);
          setError('Audio recording is unavailable. Speech recognition can still search by keyword.');
        }
      }
      recognition.start();
      setListening(true);
      setProcessing(false);
    } catch {
      setError('Unable to start voice search. Please check microphone permission and try again.');
      stopCapture(true);
    }
  };

  const retryCapture = () => {
    stopCapture(true);
    setAudioFile(null);
    setKeyword('');
    setError('');
    setUnsupportedMessage('');
    setKeywordOnlyMode(false);
    void startCapture();
  };

  const cancel = () => {
    stopCapture(true);
    setAudioFile(null);
    setKeyword('');
    setCategoryId('');
    setError('');
    setUnsupportedMessage('');
    setKeywordOnlyMode(false);
    onClose();
  };

  const submitSearch = async () => {
    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword && !categoryId) {
      setError('Enter a keyword or select a category.');
      return;
    }

    if (unsupportedMessage || keywordOnlyMode) {
      stopCapture(true);
      onClose();
      navigate(`/search?${searchParams(trimmedKeyword, categoryId).toString()}`);
      return;
    }
    if (!audioFile) {
      setError('Record a voice search before submitting.');
      return;
    }

    setSearching(true);
    setError('');
    stopCapture(true);
    try {
      const data: VoiceProductSearchData = await voiceProductSearch(audioFile, trimmedKeyword, categoryId || undefined);
      stopCapture(true);
      setAudioFile(null);
      onClose();
      navigate(`/search?${searchParams(trimmedKeyword, categoryId).toString()}`, { state: { voiceSearch: data } });
    } catch (searchError) {
      if (searchError instanceof ApiError && searchError.status === 400) {
        setError(searchError.message || 'Enter a keyword or select a category.');
      } else {
        setError('Unable to search by voice. Please try again.');
      }
    } finally {
      if (mountedRef.current) setSearching(false);
    }
  };

  const canSearch = Boolean(keyword.trim() || categoryId);
  const showTypedSearch = Boolean(unsupportedMessage);

  return <Modal open={open} title="Voice product search" onClose={cancel}>
    <div className="space-y-4">
      {unsupportedMessage ? <p role="status" className="rounded-xl border border-amber-400/20 bg-amber-500/10 p-3 text-sm text-amber-200">{unsupportedMessage}</p> : null}
      {!showTypedSearch ? <div className="flex min-h-28 flex-col items-center justify-center gap-3 rounded-xl border border-white/10 bg-slate-950/60 p-4 text-center">
        {listening ? <span className="relative flex h-12 w-12 items-center justify-center"><span className="absolute inset-0 animate-ping rounded-full bg-rose-500/30" /><Mic className="relative h-6 w-6 text-rose-300" /></span> : processing || searching ? <LoaderCircle className="h-7 w-7 animate-spin text-blue-300" /> : <Mic className="h-6 w-6 text-slate-300" />}
        <p role="status" className="text-sm text-slate-200">{listening ? 'Listening...' : processing ? 'Preparing recording...' : searching ? 'Finding matching products...' : audioFile ? 'Review your recognized search.' : 'Start speaking to search products.'}</p>
      </div> : null}
      {keywordOnlyMode ? <p role="status" className="text-xs text-amber-200">Audio recording is unavailable here; speech recognition can still search by keyword.</p> : null}
      <input aria-label="Voice search keyword" maxLength={100} value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Recognized text or type a keyword" className="min-h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none focus:border-blue-400/50" />
      <select aria-label="Voice search category" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="min-h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none focus:border-blue-400/50">
        <option value="">Select category (optional)</option>
        {categories.map((category) => <option key={category.id} value={String(category.id)}>{category.parentId === undefined || category.parentId === null || category.parentId === '' ? category.name : `  - ${category.name}`}</option>)}
      </select>
      {error ? <ErrorState title="Voice search failed" description={error} /> : null}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" disabled={searching} onClick={cancel} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 px-4 text-sm font-medium text-slate-200 disabled:opacity-50">Cancel</button>
        {listening ? <button type="button" onClick={() => recognitionRef.current?.stop()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-rose-400/30 px-4 text-sm font-medium text-rose-200"><Square className="h-3.5 w-3.5 fill-current" /> Stop</button> : null}
        {!showTypedSearch && !listening && !processing && !searching && (!audioFile || error) ? <button type="button" onClick={() => { void startCapture(); }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-medium text-slate-200"><Mic className="h-4 w-4" />{error ? 'Try Again' : audioFile ? 'Record again' : 'Start'}</button> : null}
        {audioFile && !listening && !processing && !searching ? <button type="button" onClick={retryCapture} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-medium text-slate-200"><RotateCcw className="h-4 w-4" /> Retry</button> : null}
        {!listening && !processing ? <button type="button" disabled={!canSearch || searching} onClick={() => { void submitSearch(); }} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50">{searching ? 'Finding matching products...' : 'Search'}</button> : null}
      </div>
    </div>
  </Modal>;
}