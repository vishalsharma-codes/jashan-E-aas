import { useCallback, useEffect, useRef, useState } from "react";

export interface RecordedVoice {
  blob: Blob;
  seconds: number;
  extension: string;
}

export function useVoiceRecorder() {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const recRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunks = useRef<BlobPart[]>([]);
  const timer = useRef<number | undefined>(undefined);
  const secondsRef = useRef(0);

  const release = useCallback(() => {
    window.clearInterval(timer.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recRef.current = null;
    chunks.current = [];
    setRecording(false);
    setSeconds(0);
    secondsRef.current = 0;
  }, []);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error("Microphone not available (needs https)");
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : MediaRecorder.isTypeSupported("audio/mp4")
      ? "audio/mp4"
      : "";
    const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    chunks.current = [];
    rec.ondataavailable = (e) => {
      if (e.data.size) chunks.current.push(e.data);
    };
    rec.start();
    recRef.current = rec;
    secondsRef.current = 0;
    setSeconds(0);
    setRecording(true);
    timer.current = window.setInterval(() => {
      secondsRef.current += 1;
      setSeconds(secondsRef.current);
      if (secondsRef.current >= 300) rec.stop(); // hard cap: 5 minutes
    }, 1000);
  }, []);

  /** Stops and returns the recording (or null if nothing was recording). */
  const stop = useCallback(
    () =>
      new Promise<RecordedVoice | null>((resolve) => {
        const rec = recRef.current;
        if (!rec) return resolve(null);
        const finish = () => {
          const type = rec.mimeType || "audio/webm";
          const blob = new Blob(chunks.current, { type });
          const result = { blob, seconds: Math.max(1, secondsRef.current), extension: type.includes("mp4") ? "m4a" : "webm" };
          release();
          resolve(result);
        };
        if (rec.state === "inactive") finish();
        else {
          rec.onstop = finish;
          rec.stop();
        }
      }),
    [release]
  );

  const cancel = useCallback(() => {
    const rec = recRef.current;
    if (rec && rec.state !== "inactive") {
      rec.onstop = null;
      rec.stop();
    }
    release();
  }, [release]);

  useEffect(() => cancel, [cancel]);

  return { recording, seconds, start, stop, cancel };
}
