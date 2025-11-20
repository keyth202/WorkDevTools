import React, { useEffect, useMemo, useState } from "react";

// --- Types ---
type SsmlGender = "MALE" | "FEMALE" | "NEUTRAL" | "UNSPECIFIED";

type SsmlItem = {
  id: string; // UI key only
  filename: string;
  ssml: string;
};

export type TtsJob = {
  outputFolder: string; // e.g. C:\\audio\\out or ./public/audio
  audioType: string; // e.g. MP3 | LINEAR16 | OGG_OPUS
  languageCode: string; // e.g. en-US
  ssmlGender: SsmlGender;
  items: Array<Pick<SsmlItem, "filename" | "ssml">>;
};

// --- Props ---
interface Props {
  /** Optional: submit handler. If provided, it's called with the JSON payload. */
  onSubmit?: (job: TtsJob) => void | Promise<void>;
  /** Optional: if set, form will POST JSON to this endpoint when submitted (unless onSubmit is provided). */
  endpoint?: string;
  /** Optional: initial values to prefill the form. */
  initial?: Partial<TtsJob> & { items?: Array<Partial<SsmlItem>> };
  /** Optional: persist form in localStorage (default true). */
  persistKey?: string;
}

// --- Helpers ---
const uid = () => Math.random().toString(36).slice(2, 10);

const defaultInitial: TtsJob = {
  outputFolder: "./output",
  audioType: "MP3",
  languageCode: "en-US",
  ssmlGender: "NEUTRAL",
  items: [
    { filename: "greeting.mp3", ssml: "<speak>Hello <break time=\"200ms\"/> world!</speak>" },
  ],
};

export default function SsmlBatchForm({ onSubmit, endpoint, initial, persistKey = "tts_job_form" }: Props) {
  // --- State ---
  const [outputFolder, setOutputFolder] = useState<string>(initial?.outputFolder ?? defaultInitial.outputFolder);
  const [audioType, setAudioType] = useState<string>(initial?.audioType ?? defaultInitial.audioType);
  const [languageCode, setLanguageCode] = useState<string>(initial?.languageCode ?? defaultInitial.languageCode);
  const [ssmlGender, setSsmlGender] = useState<SsmlGender>(initial?.ssmlGender ?? defaultInitial.ssmlGender);
  const [items, setItems] = useState<SsmlItem[]>(
    (initial?.items?.length
      ? initial.items.map((it, i) => ({ id: uid() + i, filename: it.filename || "", ssml: it.ssml || "" }))
      : defaultInitial.items.map((it, i) => ({ id: uid() + i, ...it })))
  );
  const [submitting, setSubmitting] = useState(false);
  const [resp, setResp] = useState<string>("");

  // --- Persistence ---
  useEffect(() => {
    // Load existing persisted state (if any) on first mount
    const raw = localStorage.getItem(persistKey);
    if (raw) {
      try {
        const saved: TtsJob = JSON.parse(raw);
        setOutputFolder(saved.outputFolder ?? outputFolder);
        setAudioType(saved.audioType ?? audioType);
        setLanguageCode(saved.languageCode ?? languageCode);
        setSsmlGender((saved.ssmlGender as SsmlGender) ?? ssmlGender);
        if (Array.isArray(saved.items) && saved.items.length) {
          setItems(saved.items.map((it, i) => ({ id: uid() + i, filename: it.filename || "", ssml: it.ssml || "" })));
        }
      } catch { /* ignore */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const payload = toPayload();
    try { localStorage.setItem(persistKey, JSON.stringify(payload)); } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outputFolder, audioType, languageCode, ssmlGender, items]);

  // --- Derived ---
  const toPayload = (): TtsJob => ({
    outputFolder,
    audioType,
    languageCode,
    ssmlGender,
    items: items.map(({ filename, ssml }) => ({ filename, ssml })),
  });

  const jsonPreview = useMemo(() => JSON.stringify(toPayload(), null, 2), [outputFolder, audioType, languageCode, ssmlGender, items]);

  const errors = useMemo(() => {
    const errs: string[] = [];
    if (!outputFolder.trim()) errs.push("Output folder is required");
    if (!audioType.trim()) errs.push("Audio type is required");
    if (!languageCode.trim()) errs.push("Language code is required");
    if (!items.length) errs.push("Add at least one SSML item");
    items.forEach((it, idx) => {
      if (!it.filename.trim()) errs.push(`Row ${idx + 1}: filename is required`);
      if (!it.ssml.trim()) errs.push(`Row ${idx + 1}: SSML is required`);
    });
    return errs;
  }, [outputFolder, audioType, languageCode, items]);

  // --- Handlers ---
  const addRow = () => setItems((prev) => [...prev, { id: uid(), filename: "", ssml: "" }]);
  const removeRow = (id: string) => setItems((prev) => prev.filter((x) => x.id !== id));
  const cloneRow = (id: string) => setItems((prev) => {
    const idx = prev.findIndex((x) => x.id === id);
    if (idx === -1) return prev;
    const copy = { ...prev[idx], id: uid() };
    const arr = [...prev];
    arr.splice(idx + 1, 0, copy);
    return arr;
  });

  const moveRow = (id: string, dir: -1 | 1) => setItems((prev) => {
    const idx = prev.findIndex((x) => x.id === id);
    if (idx === -1) return prev;
    const nxt = idx + dir;
    if (nxt < 0 || nxt >= prev.length) return prev;
    const arr = [...prev];
    const [row] = arr.splice(idx, 1);
    arr.splice(nxt, 0, row);
    return arr;
  });

  const updateRow = (id: string, patch: Partial<SsmlItem>) => setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResp("");
    if (errors.length) {
      setResp("Please fix validation errors before submitting.");
      return;
    }
    setSubmitting(true);
    const payload = toPayload();

    try {
      if (onSubmit) {
        await onSubmit(payload);
        setResp("Submitted via onSubmit handler.");
      } else if (endpoint) {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const text = await res.text();
        setResp(`HTTP ${res.status}: ${text}`);
      } else {
        console.log("TTS Job JSON", payload);
        setResp("Logged payload to console (no endpoint provided).");
      }
    } catch (err: any) {
      setResp(String(err?.message || err));
    } finally {
      setSubmitting(false);
    }
  };

  const copyJson = async () => {
    try { await navigator.clipboard.writeText(jsonPreview); setResp("Copied JSON to clipboard."); } catch { setResp("Failed to copy JSON."); }
  };

  // --- UI ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-6xl mx-auto bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-6 shadow-xl">
        <h1 className="text-2xl font-bold">SSML Batch Builder</h1>
        <p className="text-slate-400 mt-1">Fill out the form, add multiple SSML entries with filenames, and submit to your backend as JSON.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Top controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-slate-400">Output folder</label>
              <input
                value={outputFolder}
                onChange={(e) => setOutputFolder(e.target.value)}
                placeholder="./public/audio"
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400">Audio type</label>
              <select
                value={audioType}
                onChange={(e) => setAudioType(e.target.value)}
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                {['MP3', 'OGG_OPUS', 'LINEAR16', 'WAV', 'AAC'].map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400">Language code</label>
              <input
                value={languageCode}
                onChange={(e) => setLanguageCode(e.target.value)}
                placeholder="en-US"
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400">SSML gender</label>
              <select
                value={ssmlGender}
                onChange={(e) => setSsmlGender(e.target.value as SsmlGender)}
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
              >
                {['NEUTRAL','FEMALE','MALE','UNSPECIFIED'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Validation */}
          {errors.length > 0 && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
              <ul className="list-disc ml-5 space-y-1">
                {errors.map((e, i) => (<li key={i}>{e}</li>))}
              </ul>
            </div>
          )}

          {/* Items table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Entries ({items.length})</h2>
              <div className="flex gap-2">
                <button type="button" onClick={addRow} className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">+ Add row</button>
                <button
                  type="button"
                  className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800"
                  onClick={() => setItems([{ id: uid(), filename: "", ssml: "" }])}
                >Clear to 1 row</button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {items.map((it, idx) => (
                <div key={it.id} className="rounded-xl border border-slate-700 p-3 bg-slate-950">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-slate-400 text-sm">Row {idx + 1}</div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => moveRow(it.id, -1)} className="px-2 py-1 rounded-md border border-slate-700 hover:bg-slate-800">↑</button>
                      <button type="button" onClick={() => moveRow(it.id, 1)} className="px-2 py-1 rounded-md border border-slate-700 hover:bg-slate-800">↓</button>
                      <button type="button" onClick={() => cloneRow(it.id)} className="px-2 py-1 rounded-md border border-slate-700 hover:bg-slate-800">Clone</button>
                      <button type="button" onClick={() => removeRow(it.id)} className="px-2 py-1 rounded-md border border-rose-700 text-rose-300 hover:bg-rose-900/30">Remove</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-1">
                      <label className="text-sm text-slate-400">Filename</label>
                      <input
                        value={it.filename}
                        onChange={(e) => updateRow(it.id, { filename: e.target.value })}
                        placeholder="greeting.mp3"
                        className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm text-slate-400">SSML</label>
                      <textarea
                        value={it.ssml}
                        onChange={(e) => updateRow(it.id, { ssml: e.target.value })}
                        placeholder="<speak>Hello world</speak>"
                        className="mt-1 w-full min-h-[100px] rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit & JSON preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-900 bg-gradient-to-r from-cyan-400 to-violet-400 disabled:opacity-60"
                >{submitting ? "Submitting…" : "Submit JSON"}</button>
                <button type="button" onClick={copyJson} className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800">Copy JSON</button>
              </div>
              {resp && (
                <div className="text-sm rounded-xl border border-slate-700 p-3 bg-slate-950 whitespace-pre-wrap">
                  {resp}
                </div>
              )}
            </div>
            <div>
              <label className="text-sm text-slate-400">JSON preview</label>
              <pre className="mt-1 p-3 bg-slate-950 rounded-xl border border-slate-700 overflow-auto max-h-96 text-xs">
{jsonPreview}
              </pre>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/*
Usage example:

import SsmlBatchForm, { TtsJob } from "./SsmlBatchForm";

export default function Page() {
  const handleSubmit = async (job: TtsJob) => {
    // send to your backend
    const res = await fetch("/api/tts/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(job),
    });
    if (!res.ok) throw new Error("Failed to submit TTS batch");
  };

  return <SsmlBatchForm onSubmit={handleSubmit} endpoint={undefined} />;
}
*/
