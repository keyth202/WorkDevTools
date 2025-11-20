import React, { useMemo, useRef, useState } from "react";

// FolderMatchUploader
// Compare file names in Folder A vs Folder B (ignoring extension),
// then upload ONLY the matching files from Folder A to a backend endpoint
// in a single batch request (like the earlier batch uploader).
//
// Tailwind + TypeScript, no external deps.

// ---- Types ----
type FileRow = {
  id: string;
  file: File;
  base: string; // base name without extension, lowercased
};

// ---- Helpers ----
function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function stripExtension(name: string) {
  // remove last ".ext" and lowercase for case-insensitive compare
  return name.replace(/\.[^./\\]+$/, "").toLowerCase();
}

function safeJsonParse(s: string): unknown | undefined {
  if (!s.trim()) return undefined;
  try {
    return JSON.parse(s);
  } catch {
    return s; // as plain string fallback
  }
}

function formatBytes(bytes: number) {
  const units = ["B", "KB", "MB", "GB", "TB"] as const;
  if (!bytes) return "0 B";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

async function postFormData({
  url,
  formData,
  onProgress,
  headers,
}: {
  url: string;
  formData: FormData;
  onProgress?: (loaded: number, total: number) => void;
  headers?: Record<string, string>;
}): Promise<{ status: number; data: unknown }>{
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    // Example of fixed header you can customize
    // 
    xhr.setRequestHeader("x-api-key", import.meta.env.VITE_LOCAL_KEY);

    if (headers) {
      for (const [k, v] of Object.entries(headers)) {
        try { xhr.setRequestHeader(k, v); } catch {}
      }
    }

    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable && onProgress) onProgress(ev.loaded, ev.total);
    };

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        const ct = xhr.getResponseHeader("Content-Type") || "";
        const ok = xhr.status >= 200 && xhr.status < 300;
        const body = ct.includes("application/json")
          ? (() => { try { return JSON.parse(xhr.responseText); } catch { return xhr.responseText; } })()
          : xhr.responseText;
        if (ok) resolve({ status: xhr.status, data: body });
        else reject(new Error(`HTTP ${xhr.status}: ${xhr.responseText || "Upload failed"}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(formData);
  });
}

export default function FolderMatchUploader() {
  // ---- Config state ----
  const [endpoint, setEndpoint] = useState("/api/upload");
  const [fieldName, setFieldName] = useState("files[]");
  const [token, setToken] = useState("");

  // ---- Files in each folder ----
  const [aRows, setARows] = useState<FileRow[]>([]);
  const [bRows, setBRows] = useState<FileRow[]>([]);

  // ---- Upload progress/response ----
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [response, setResponse] = useState<unknown | string | null>(null);

  const aPickerRef = useRef<HTMLInputElement | null>(null);
  const bPickerRef = useRef<HTMLInputElement | null>(null);

  // Build Set of Folder B base names for quick lookup
  const bBaseSet = useMemo(() => new Set(bRows.map(r => r.base)), [bRows]);

  // Compute matches: files in A whose base also exists in B (ignoring extension)
  const matchedA = useMemo(() => aRows.filter(r => !bBaseSet.has(r.base)), [aRows, bBaseSet]);

  const counts = useMemo(() => ({
    a: aRows.length,
    b: bRows.length,
    matches: matchedA.length,
    size: matchedA.reduce((acc, r) => acc + r.file.size, 0),
  }), [aRows, bRows, matchedA]);

  function onPickA(files: FileList | null) {
    if (!files) return;
    const rows: FileRow[] = Array.from(files).map((f) => ({
      id: uid(),
      file: f,
      base: stripExtension(f.name),
    }));
    setARows(rows);
  }

  function onPickB(files: FileList | null) {
    if (!files) return;
    const rows: FileRow[] = Array.from(files).map((f) => ({
      id: uid(),
      file: f,
      base: stripExtension(f.name),
    }));
    setBRows(rows);
  }

  function getHeaders(): Record<string, string> {
    const h: Record<string, string> = {};
    const t = token.trim();
    if (t) h["Authorization"] = `Bearer ${t}`;
    return h;
  }

  function makeFormDataForMatches(): FormData {
    const fd = new FormData();
    const field = (fieldName || "files[]").trim();

    matchedA.forEach(r => fd.append(field, r.file, r.file.name));

    /* include some helpful metadata if you want
    fd.append("meta", JSON.stringify({
      strategy: "intersection_by_basename",
      totalFiles: matchedA.length,
      totalBytes: counts.size,
      matchedBaseNames: matchedA.map(r => r.base),
    }));
    */
    return fd;
  }
 function makeFormData(chunk: FileRow[] | FileRow): FormData {
    const fd = new FormData();
    const field = (fieldName || "files[]").trim();
    const list = Array.isArray(chunk) ? chunk : [chunk];
    list.forEach(r => fd.append(field, r.file, r.file.name));

    const metaVal = safeJsonParse(metaInput);
    if (metaVal !== undefined) fd.append("meta", typeof metaVal === "string" ? metaVal : JSON.stringify(metaVal));
    return fd;
  }

  async function uploadBatch() {
    const url = endpoint.trim();
    if (!url) { alert("Please enter an endpoint URL"); return; }
    if (!matchedA.length) { alert("No non-matches to upload"); return; }

    setStatus("uploading");
    setProgress(0);
    setResponse(null);

    try {
      const res = await postFormData({
        url,
        formData: makeFormDataForMatches(),
        headers: getHeaders(),
        onProgress: (loaded, total) => {
          const pct = Math.round((loaded / (total || counts.size)) * 100);
          setProgress(pct);
        }
      });
      setStatus("done");
      setProgress(100);
      setResponse(res.data);
    } catch (err) {
      setStatus("error");
      setResponse(String(err));
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6">
      <div className="mx-auto max-w-6xl rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl">
        <h1 className="text-2xl font-bold tracking-tight">Folder Match Uploader</h1>
        <p className="text-slate-400 text-sm mt-1">Compare filenames in two folders (ignoring extensions). Upload matching files from Folder A.</p>

        {/* Config */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <div>
            <label className="text-xs text-slate-400" htmlFor="endpoint">Endpoint (POST)</label>
            <input id="endpoint" value={endpoint} onChange={(e)=>setEndpoint(e.target.value)}
              placeholder="https://api.example.com/upload"
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-cyan-400"/>
          </div>
          <div>
            <label className="text-xs text-slate-400" htmlFor="field">Form field name</label>
            <input id="field" value={fieldName} onChange={(e)=>setFieldName(e.target.value)}
              placeholder="files[]"
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-violet-400"/>
          </div>
          <div>
            <label className="text-xs text-slate-400" htmlFor="token">Optional bearer token</label>
            <input id="token" value={token} onChange={(e)=>setToken(e.target.value)}
              placeholder="Authorization: Bearer <token>"
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-cyan-400"/>
          </div>
        </div>

        {/* Pickers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="rounded-2xl border border-slate-800 p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Folder A (source to upload)</h2>
              <button onClick={() => aPickerRef.current?.click()} className="px-3 py-1 rounded-lg border border-slate-700 bg-slate-950">Choose…</button>
            </div>
            <input ref={aPickerRef} type="file" multiple // @ts-ignore webkitdirectory is non-standard but supported in Chromium
              webkitdirectory="true" directory="true" hidden onChange={(e)=>onPickA(e.currentTarget.files)} />
            <div className="mt-3 text-sm text-slate-300">{aRows.length} files selected</div>
            <div className="mt-2 max-h-40 overflow-auto text-xs text-slate-400">
              {aRows.slice(0, 50).map(r => (
                <div key={r.id} className="truncate">{r.file.name}</div>
              ))}
              {aRows.length > 50 && <div className="text-slate-500">…and {aRows.length - 50} more</div>}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Folder B (reference set)</h2>
              <button onClick={() => bPickerRef.current?.click()} className="px-3 py-1 rounded-lg border border-slate-700 bg-slate-950">Choose…</button>
            </div>
            <input ref={bPickerRef} type="file" multiple // @ts-ignore
              webkitdirectory="true" directory="true" hidden onChange={(e)=>onPickB(e.currentTarget.files)} />
            <div className="mt-3 text-sm text-slate-300">{bRows.length} files selected</div>
            <div className="mt-2 max-h-40 overflow-auto text-xs text-slate-400">
              {bRows.slice(0, 50).map(r => (
                <div key={r.id} className="truncate">{r.file.name}</div>
              ))}
              {bRows.length > 50 && <div className="text-slate-500">…and {bRows.length - 50} more</div>}
            </div>
          </div>
        </div>

        {/* Summary & matches */}
        <div className="mt-6 rounded-2xl border border-slate-800 p-4">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="px-2 py-1 rounded-full bg-slate-800/60">A: {counts.a}</span>
            <span className="px-2 py-1 rounded-full bg-slate-800/60">B: {counts.b}</span>
            <span className="px-2 py-1 rounded-full bg-slate-800/60">Non-Matches: {counts.matches}</span>
            <span className="px-2 py-1 rounded-full bg-slate-800/60">Total size: {formatBytes(counts.size)}</span>
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-56 overflow-auto">
            {matchedA.map((r) => (
              <div key={r.id} className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs">
                <div className="font-medium truncate" title={r.file.name}>{r.file.name}</div>
                <div className="text-slate-400">base: {r.base}</div>
                <div className="text-slate-400">size: {formatBytes(r.file.size)}</div>
              </div>
            ))}
            {!matchedA.length && (
              <div className="text-slate-400 text-sm">No matches yet. Select both folders to see intersection.</div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-4">
          <button
            disabled={!matchedA.length || status === "uploading"}
            onClick={uploadBatch}
            className="px-4 py-2 rounded-xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 text-slate-950 disabled:opacity-50"
          >
            Upload matched files from A
          </button>
          {status === "uploading" && (
            <div className="flex items-center gap-2 text-sm">
              <div className="h-2 w-40 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-2 bg-cyan-400" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-slate-300">{progress}%</span>
            </div>
          )}
        </div>

        {/* Response */}
        {response !== null && (
          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm max-h-64 overflow-auto whitespace-pre-wrap">
            {(() => { try { return typeof response === "string" ? response : JSON.stringify(response, null, 2); } catch { return String(response); } })()}
          </div>
        )}
      </div>
    </div>
  );
}
