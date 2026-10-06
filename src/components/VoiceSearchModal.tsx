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
  resultIndex?: number;
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
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

type VoiceRecognitionState = 'idle' | 'starting' | 'listening' | 'recognizing' | 'success' | 'no-speech' | 'not-allowed' | 'error' | 'unsupported';

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

function getBrowserLabel(): string {
  if (typeof navigator === 'undefined') return 'Browser';
  const userAgent = navigator.userAgent;
  if (/Android/i.test(userAgent) && /Chrome/i.test(userAgent)) return 'Android Chrome';
  if (/iPhone|iPad|iPod/i.test(userAgent) && /Safari/i.test(userAgent)) return 'iPhone Safari';
  return 'Current browser';
}

export function VoiceSearchModal({ open, categories, onClose }: Props) {
  const navigate = useNavigate();
  const { language } = useLocaleContext();
  const openRef = useRef(open);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const recognitionStartTimeoutRef = useRef<number | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const discardRecordingRef = useRef(false);
  const captureGenerationRef = useRef(0);
  const mediaSetupPendingRef = useRef(false);
  const recognitionEndedRef = useRef(false);
  const transcriptRef = useRef('');
  const finalTranscriptRef = useRef('');
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
  const [voiceState, setVoiceState] = useState<VoiceRecognitionState>('idle');
  const [recognitionStarted, setRecognitionStarted] = useState(false);
  const [recognitionResultReceived, setRecognitionResultReceived] = useState(false);
  const [recognitionErrorCode, setRecognitionErrorCode] = useState('');
  openRef.current = open;

  const stopCapture = (discard: boolean) => {
    captureGenerationRef.current += 1;
    if (recognitionStartTimeoutRef.current !== null) window.clearTimeout(recognitionStartTimeoutRef.current);
    recognitionStartTimeoutRef.current = null;
    mediaSetupPendingRef.current = false;
    discardRecordingRef.current = discard;
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    if (recognition) {
      recognition.onstart = null;
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
      captureGenerationRef.current += 1;
      if (recognitionStartTimeoutRef.current !== null) window.clearTimeout(recognitionStartTimeoutRef.current);
      recognitionStartTimeoutRef.current = null;
      mediaSetupPendingRef.current = false;
      discardRecordingRef.current = true;
      const recognition = recognitionRef.current;
      recognitionRef.current = null;
      if (recognition) {
        recognition.onstart = null;
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

  const startCapture = () => {
    const speechWindow = typeof window === 'undefined' ? null : window as SpeechRecognitionWindow;
    const standardRecognition = speechWindow?.SpeechRecognition;
    const webkitRecognition = speechWindow?.webkitSpeechRecognition;
    const SpeechRecognition = standardRecognition || webkitRecognition;
    if (import.meta.env.DEV) {
      console.debug('[Bidzo voice search] browser support', {
        speechRecognition: Boolean(standardRecognition),
        webkitSpeechRecognition: Boolean(webkitRecognition),
      });
    }
    if (!SpeechRecognition) {
      stopCapture(true);
      setUnsupportedMessage('Voice search is not supported in this browser. Please type your search.');
      setError('');
      setVoiceState('unsupported');
      return;
    }
    stopCapture(true);
    setUnsupportedMessage('');
    setError('');
    setKeyword('');
    setAudioFile(null);
    setKeywordOnlyMode(false);
    setProcessing(true);
    discardRecordingRef.current = false;
    audioChunksRef.current = [];
    transcriptRef.current = '';
    finalTranscriptRef.current = '';
    recognitionEndedRef.current = false;
    setVoiceState('starting');
    setRecognitionStarted(false);
    setRecognitionResultReceived(false);
    setRecognitionErrorCode('');

    const generation = ++captureGenerationRef.current;
    let recorder: MediaRecorder | null = null;
    let mediaAccess: Promise<MediaStream> | null = null;
    const canRecord = typeof MediaRecorder !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia);
    if (!canRecord) {
      setKeywordOnlyMode(true);
    }

    let recognition: SpeechRecognitionLike;
    try {
      recognition = new SpeechRecognition();
    } catch {
      setProcessing(false);
      setError('Unable to start voice recognition. Please try typing your search.');
      setVoiceState('error');
      return;
    }

    recognitionRef.current = recognition;
    recognition.lang = language === 'en' ? (navigator.language || 'en-IN') : `${language}-IN`;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      if (recognitionStartTimeoutRef.current !== null) window.clearTimeout(recognitionStartTimeoutRef.current);
      recognitionStartTimeoutRef.current = null;
      if (import.meta.env.DEV) console.debug('[Bidzo voice search] recognition onstart');
      if (mountedRef.current && openRef.current) {
        setRecognitionStarted(true);
        setVoiceState('listening');
        setListening(true);
        setProcessing(false);
      }
    };
    recognition.onresult = (event) => {
      setRecognitionResultReceived(true);
      const results = Array.from(event.results);
      const finalTranscript = results.filter((result) => result.isFinal).map((result) => result[0].transcript.trim()).filter(Boolean).join(' ');
      const interimTranscript = results.filter((result) => !result.isFinal).map((result) => result[0].transcript.trim()).filter(Boolean).join(' ');
      const transcript = [finalTranscript, interimTranscript].filter(Boolean).join(' ').slice(0, 100);
      if (import.meta.env.DEV) console.debug('[Bidzo voice search] recognition onresult', { resultCount: results.length, resultIndex: event.resultIndex, finalTranscript, interimTranscript });
      if (transcript) {
        transcriptRef.current = transcript;
        finalTranscriptRef.current = finalTranscript;
        setKeyword(transcript);
        setError('');
        setVoiceState(finalTranscript ? 'success' : 'recognizing');
      }
      if (finalTranscript) {
        setListening(false);
        try {
          recognition.stop();
        } catch {
          // Recognition may have ended between the result event and stop call.
        }
      }
    };
    recognition.onerror = (event) => {
      if (recognitionStartTimeoutRef.current !== null) window.clearTimeout(recognitionStartTimeoutRef.current);
      recognitionStartTimeoutRef.current = null;
      if (!mountedRef.current) return;
      if (import.meta.env.DEV) console.warn('[Bidzo voice search] recognition onerror', { code: event.error });
      const messages: Record<string, string> = {
        'not-allowed': 'Microphone permission was denied. Please allow microphone access and try again.',
        'service-not-allowed': 'Microphone permission was denied. Please allow microphone access and try again.',
        'audio-capture': 'Microphone is unavailable. Please check your microphone permission.',
        'no-speech': 'No speech detected. Please try again.',
        network: 'Voice recognition is unavailable right now. Please try again or type your search.',
        'language-not-supported': 'Voice recognition does not support this language. Please try another language or type your search.',
        aborted: 'Voice recognition stopped. Please try again.',
      };
      const message = messages[event.error] || 'Speech recognition failed. Please try again.';
      setRecognitionErrorCode(event.error);
      setError(message);
      setVoiceState(event.error === 'no-speech' ? 'no-speech' : event.error === 'not-allowed' || event.error === 'service-not-allowed' ? 'not-allowed' : 'error');
      stopCapture(true);
    };
    recognition.onend = () => {
      if (recognitionStartTimeoutRef.current !== null) window.clearTimeout(recognitionStartTimeoutRef.current);
      recognitionStartTimeoutRef.current = null;
      recognitionEndedRef.current = true;
      if (import.meta.env.DEV) console.debug('[Bidzo voice search] recognition onend', { transcript: transcriptRef.current });
      if (!mountedRef.current || discardRecordingRef.current) return;
      recognitionRef.current = null;
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      setListening(false);
      const activeRecorder = recorderRef.current;
      if (activeRecorder?.state === 'recording') {
        activeRecorder.stop();
      } else if (!mediaSetupPendingRef.current) {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setProcessing(false);
      if (transcriptRef.current) {
        setKeyword(finalTranscriptRef.current || transcriptRef.current);
        setError('');
        setVoiceState('success');
      } else {
        setError('No speech detected. Please try again.');
        setRecognitionErrorCode((current) => current || 'no-speech');
        setVoiceState('no-speech');
      }
    };

    try {
      if (import.meta.env.DEV) console.debug('[Bidzo voice search] recognition.start called');
      recognition.start();
      setListening(false);
      setProcessing(true);
      recognitionStartTimeoutRef.current = window.setTimeout(() => {
        if (recognitionRef.current !== recognition) return;
        setRecognitionErrorCode('start-timeout');
        setError('Voice recognition did not start. Please try again.');
        stopCapture(true);
        setVoiceState('error');
      }, 10000);
    } catch (startError) {
      if (import.meta.env.DEV) console.warn('[Bidzo voice search] recognition.start failed', { message: startError instanceof Error ? startError.message : 'Unknown start error' });
      stopCapture(true);
      setError('Unable to start voice search. Please check microphone permission and try again.');
      setVoiceState('error');
      return;
    }

    if (canRecord) {
      try {
        mediaAccess = navigator.mediaDevices.getUserMedia({ audio: true });
        mediaSetupPendingRef.current = true;
      } catch {
        setKeywordOnlyMode(true);
      }
    }

    if (mediaAccess) {
      void mediaAccess.then((stream) => {
        mediaSetupPendingRef.current = false;
        if (generation !== captureGenerationRef.current || !mountedRef.current || !openRef.current || recognitionEndedRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          if (generation === captureGenerationRef.current && mountedRef.current && openRef.current && transcriptRef.current) {
            setKeywordOnlyMode(true);
            setProcessing(false);
          }
          return;
        }

        streamRef.current = stream;
        const supportedTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
        const mimeType = typeof MediaRecorder.isTypeSupported === 'function' ? supportedTypes.find((type) => MediaRecorder.isTypeSupported(type)) : undefined;
        try {
          recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
          recorderRef.current = recorder;
          recorder.ondataavailable = (recordingEvent) => {
            if (recordingEvent.data.size > 0) audioChunksRef.current.push(recordingEvent.data);
          };
          recorder.onstop = () => {
            stream.getTracks().forEach((track) => track.stop());
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
          recorder.start();
        } catch (recorderError) {
          stream.getTracks().forEach((track) => track.stop());
          if (streamRef.current === stream) streamRef.current = null;
          recorderRef.current = null;
          setKeywordOnlyMode(true);
          setProcessing(false);
          if (import.meta.env.DEV) console.warn('[Bidzo voice search] MediaRecorder unavailable', { message: recorderError instanceof Error ? recorderError.message : 'Unknown recorder error' });
        }
      }).catch((permissionError: unknown) => {
        mediaSetupPendingRef.current = false;
        if (generation !== captureGenerationRef.current || !mountedRef.current || !openRef.current) return;
        const permissionName = permissionError instanceof DOMException ? permissionError.name : '';
        if (import.meta.env.DEV) console.warn('[Bidzo voice search] microphone permission failed', { name: permissionName || 'Error' });
        const permissionMessage = permissionName === 'NotFoundError' || permissionName === 'DevicesNotFoundError'
          ? 'Microphone is unavailable. Please check your microphone permission.'
          : 'Microphone permission was denied. Please allow microphone access and try again.';
        setKeywordOnlyMode(true);
        setRecognitionErrorCode(permissionName || 'audio-permission-denied');
        setError(`${permissionMessage} Speech recognition will continue without an audio attachment.`);
      });
    }
  };

  const retryCapture = () => {
    stopCapture(true);
    setAudioFile(null);
    setKeyword('');
    setError('');
    setUnsupportedMessage('');
    setKeywordOnlyMode(false);
    transcriptRef.current = '';
    finalTranscriptRef.current = '';
    setVoiceState('idle');
    setRecognitionStarted(false);
    setRecognitionResultReceived(false);
    setRecognitionErrorCode('');
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
    transcriptRef.current = '';
    finalTranscriptRef.current = '';
    setVoiceState('idle');
    setRecognitionStarted(false);
    setRecognitionResultReceived(false);
    setRecognitionErrorCode('');
    onClose();
  };

  const submitSearch = async () => {
    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword && !categoryId) {
      setError('Enter a keyword or select a category.');
      return;
    }

    if (unsupportedMessage || keywordOnlyMode || !audioFile) {
      stopCapture(true);
      onClose();
      navigate(`/search?${searchParams(trimmedKeyword, categoryId).toString()}`);
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
  const speechWindow = typeof window === 'undefined' ? null : window as SpeechRecognitionWindow;
  const voiceStatusText: Record<VoiceRecognitionState, string> = {
    idle: 'Tap the microphone and speak',
    starting: 'Starting microphone...',
    listening: 'Listening... Speak now',
    recognizing: 'Recognizing...',
    success: 'Recognition complete',
    'no-speech': 'No speech detected. Please try again.',
    'not-allowed': 'Microphone permission was denied. Allow microphone access and try again.',
    error: error ? `Voice recognition failed: ${error}` : 'Voice recognition failed. Please try again.',
    unsupported: 'Voice search is not supported in this browser. Please type your search.',
  };

  return <Modal open={open} title="Voice product search" onClose={cancel}>
    <div className="space-y-4">
      {unsupportedMessage ? <p role="status" className="rounded-xl border border-amber-400/20 bg-amber-500/10 p-3 text-sm text-amber-200">{unsupportedMessage}</p> : null}
      {!showTypedSearch ? <div className="flex min-h-28 flex-col items-center justify-center gap-3 rounded-xl border border-white/10 bg-slate-950/60 p-4 text-center">
        {listening ? <span className="relative flex h-12 w-12 items-center justify-center"><span className="absolute inset-0 animate-ping rounded-full bg-rose-500/30" /><Mic className="relative h-6 w-6 text-rose-300" /></span> : processing || searching ? <LoaderCircle className="h-7 w-7 animate-spin text-blue-300" /> : <Mic className="h-6 w-6 text-slate-300" />}
        <p role="status" className="text-sm text-slate-200">{searching ? 'Finding matching products...' : processing ? 'Starting microphone...' : voiceStatusText[voiceState]}</p>
      </div> : null}
      <div role="status" aria-label="Voice search diagnostics" className="space-y-1 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-400">
        <p>Browser: {getBrowserLabel()}</p>
        <p>SpeechRecognition: {speechWindow?.SpeechRecognition ? 'YES' : 'NO'}</p>
        <p>webkitSpeechRecognition: {speechWindow?.webkitSpeechRecognition ? 'YES' : 'NO'}</p>
        <p>Status: {voiceStatusText[voiceState]}</p>
        <p>onstart: {recognitionStarted ? 'fired' : 'not fired'}</p>
        <p>onresult: {recognitionResultReceived ? 'fired' : 'not fired'}</p>
        <p>Error: {recognitionErrorCode || 'none'}</p>
      </div>
      {keywordOnlyMode ? <p role="status" className="text-xs text-amber-200">Audio recording is unavailable here; speech recognition can still search by keyword.</p> : null}
      {voiceState === 'success' && keyword.trim() ? <p role="status" className="text-sm font-medium text-emerald-300">Recognized: {keyword.trim()}</p> : null}
      <input aria-label="Voice search keyword" maxLength={100} value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Recognized text or type a keyword" className="min-h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none focus:border-blue-400/50" />
      <select aria-label="Voice search category" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="min-h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none focus:border-blue-400/50">
        <option value="">Select category (optional)</option>
        {categories.map((category) => <option key={category.id} value={String(category.id)}>{category.parentId === undefined || category.parentId === null || category.parentId === '' ? category.name : `  - ${category.name}`}</option>)}
      </select>
      {error ? <ErrorState title="Voice search failed" description={error} /> : null}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" disabled={searching} onClick={cancel} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 px-4 text-sm font-medium text-slate-200 disabled:opacity-50">Cancel</button>
        {listening ? <button type="button" onClick={() => recognitionRef.current?.stop()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-rose-400/30 px-4 text-sm font-medium text-rose-200"><Square className="h-3.5 w-3.5 fill-current" /> Stop</button> : null}
        {!showTypedSearch && !listening && !processing && !searching && (!audioFile || error) ? <button type="button" onClick={() => { void startCapture(); }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-medium text-slate-200"><Mic className="h-4 w-4" />{error ? 'Try Again' : voiceState === 'success' || audioFile ? 'Retry' : 'Start'}</button> : null}
        {audioFile && !listening && !processing && !searching ? <button type="button" onClick={retryCapture} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-medium text-slate-200"><RotateCcw className="h-4 w-4" /> Retry</button> : null}
        {!listening && !processing ? <button type="button" disabled={!canSearch || searching} onClick={() => { void submitSearch(); }} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50">{searching ? 'Finding matching products...' : showTypedSearch ? 'Type Search' : 'Search'}</button> : null}
      </div>
    </div>
  </Modal>;
}