import React, { useEffect, useMemo, useRef, useState } from "react";

type UploadMode = "batch" | "sequential";

type FileRow = {
  id: string;
  file: File;
  progress: number; // 0 - 100
  status: "Queued" | "Uploading…" | "Uploaded" | "Error";
};

// ---- Helpers ----

function formatBytes(bytes: number) {
  const units = ["B", "KB", "MB", "GB", "TB"] as const;
  if (!bytes) return "0 B";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Minimal, resilient JSON parse for metadata input
function safeJsonParse(s: string): unknown | undefined {
  if (!s.trim()) return undefined;
  try {
    return JSON.parse(s);
  } catch {
    return s; // as plain string fallback
  }
}

// Perform an XHR POST with progress support
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
}): Promise<{ status: number; data: unknown }>
{
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    // Example of fixed header you can customize:
    xhr.setRequestHeader("x-api-key", "3F9A7C12B4E0D6A8");

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

export default function MultiFileUploader() {
  // ---- Form state ----
  const [endpoint, setEndpoint] = useState<string>(() => localStorage.getItem("mf_endpoint") || "/api/upload");
  const [fieldName, setFieldName] = useState("files[]");
  const [token, setToken] = useState("");
  const [metaInput, setMetaInput] = useState("");
  const [mode, setMode] = useState<UploadMode>("batch");
  const [clearOnSuccess, setClearOnSuccess] = useState(true);
  const [allowDuplicates, setAllowDuplicates] = useState(false);

  // ---- Files ----
  const [rows, setRows] = useState<FileRow[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [response, setResponse] = useState<unknown | string | null>(null);

  useEffect(() => {
    localStorage.setItem("mf_endpoint", endpoint.trim());
  }, [endpoint]);

  const filesSelectedText = useMemo(() => {
    const n = rows.length;
    return `${n} file${n !== 1 ? "s" : ""} selected`;
  }, [rows.length]);

  function addFiles(fileList: FileList) {
    const next: FileRow[] = [...rows];
    Array.from(fileList).forEach((f) => {
      if (!allowDuplicates && next.some(x => x.file.name === f.name && x.file.size === f.size)) return;
      next.push({ id: uid(), file: f, progress: 0, status: "Queued" });
    });
    setRows(next);
    setResponse(null);
  }

  function reset() {
    setRows([]);
    setResponse(null);
  }

  function getHeaders(): Record<string, string> {
    const h: Record<string, string> = {};
    const t = token.trim();
    if (t) h["Authorization"] = `Bearer ${t}`;
    return h;
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

    setRows(prev => prev.map(r => ({ ...r, status: "Uploading…", progress: 0 })));

    const totalSize = rows.reduce((a, b) => a + b.file.size, 0);
    let lastPct = 0;

    try {
      const res = await postFormData({
        url,
        formData: makeFormData(rows),
        headers: getHeaders(),
        onProgress: (loaded, total) => {
          const pct = Math.round((loaded / (total || totalSize)) * 100);
          if (pct !== lastPct) {
            lastPct = pct;
            setRows(prev => prev.map(r => ({ ...r, progress: pct })));
          }
        }
      });

      setRows(prev => prev.map(r => ({ ...r, status: "Uploaded", progress: 100 })));
      setResponse(res.data);
      if (clearOnSuccess) reset();
    } catch (err) {
      setRows(prev => prev.map(r => ({ ...r, status: "Error" })));
      setResponse(String(err));
    }
  }

  async function uploadSequential() {
    const url = endpoint.trim();
    if (!url) { alert("Please enter an endpoint URL"); return; }

    const results: Array<{ file: string; status: string; response?: unknown; error?: string }> = [];

    for (const r of rows) {
      setRows(prev => prev.map(row => row.id === r.id ? { ...row, status: "Uploading…", progress: 0 } : row));
      try {
        const res = await postFormData({
          url,
          formData: makeFormData(r),
          headers: getHeaders(),
          onProgress: (loaded, total) => {
            const pct = Math.round((loaded / (total || r.file.size)) * 100);
            setRows(prev => prev.map(row => row.id === r.id ? { ...row, progress: pct } : row));
          }
        });
        setRows(prev => prev.map(row => row.id === r.id ? { ...row, status: "Uploaded", progress: 100 } : row));
        results.push({ file: r.file.name, status: "ok", response: res.data });
      } catch (err) {
        setRows(prev => prev.map(row => row.id === r.id ? { ...row, status: "Error" } : row));
        results.push({ file: r.file.name, status: "error", error: String(err) });
      }
    }

    setResponse(results);
    if (results.length && results.every(r => r.status === "ok") && clearOnSuccess) reset();
  }

  const dropzoneRef = useRef<HTMLDivElement | null>(null);

  // ---- Render ----
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6">
      <div className="mx-auto max-w-5xl rounded-2xl border border-slate-700/40 bg-slate-900/70 backdrop-blur-md shadow-2xl p-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Multi‑File Uploader</h1>
          <span className="text-xs px-3 py-1 rounded-full bg-slate-700/40 text-slate-300">{filesSelectedText}</span>
        </div>

        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <div>
            <label className="text-xs text-slate-400" htmlFor="endpoint">Backend API endpoint (POST)</label>
            <input
              id="endpoint"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="https://your.api.example.com/upload"
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none ring-0 focus:border-cyan-400"
              type="url"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400" htmlFor="field">Form field name for files</label>
            <input
              id="field"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              placeholder="files[]"
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none ring-0 focus:border-violet-400"
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          <div>
            <label className="text-xs text-slate-400" htmlFor="token">Optional bearer/API token header</label>
            <input
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="sk_live_... (Authorization: Bearer <token>)"
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none ring-0 focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400" htmlFor="meta">Optional JSON metadata (sent as \"meta\")</label>
            <input
              id="meta"
              value={metaInput}
              onChange={(e) => setMetaInput(e.target.value)}
              placeholder='{"projectId":"abc123"}'
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none ring-0 focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400" htmlFor="mode">Upload mode</label>
            <select
              id="mode"
              value={mode}
              onChange={(e) => setMode(e.target.value as UploadMode)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
            >
              <option value="batch">Batch (all files in one request)</option>
              <option value="sequential">Sequential (one request per file)</option>
            </select>
          </div>
        </div>

        {/* Dropzone */}
        <div
          ref={dropzoneRef}
          role="button"
          tabIndex={0}
          aria-label="File uploader dropzone"
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInputRef.current?.click(); }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            dropzoneRef.current?.classList.add("ring-2", "ring-violet-400", "scale-[1.01]");
          }}
          onDragLeave={() => {
            dropzoneRef.current?.classList.remove("ring-2", "ring-violet-400", "scale-[1.01]");
          }}
          onDrop={(e) => {
            e.preventDefault();
            dropzoneRef.current?.classList.remove("ring-2", "ring-violet-400", "scale-[1.01]");
            if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
          }}
          className="mt-4 rounded-2xl border-2 border-dashed border-cyan-400/50 bg-slate-950/50 px-6 py-8 text-center transition-all focus:outline-none"
        >
          <p className="text-sm text-slate-300">
            Drag & drop files here, or <span className="underline cursor-pointer">browse</span>
          </p>
          <input ref={fileInputRef} type="file" multiple hidden onChange={(e) => {
            if (e.currentTarget.files?.length) addFiles(e.currentTarget.files);
            if (fileInputRef.current) fileInputRef.current.value = ""; // allow re-selecting same files
          }}/>
        </div>

        {/* Switches */}
        <div className="flex flex-wrap items-center gap-4 mt-4 text-slate-300">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" className="scale-110" checked={clearOnSuccess} onChange={(e) => setClearOnSuccess(e.target.checked)} />
            Clear list after successful upload
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" className="scale-110" checked={allowDuplicates} onChange={(e) => setAllowDuplicates(e.target.checked)} />
            Allow duplicate filenames
          </label>
        </div>

        {/* Files Table */}
        <div className={`${rows.length ? "mt-4" : "hidden"}`}>
          <div className="overflow-hidden rounded-xl border border-slate-700/50">
            <table className="w-full border-collapse">
              <thead className="bg-slate-800/60 text-slate-400 text-sm">
                <tr>
                  <th className="text-left p-3 w-[42%] font-medium">Name</th>
                  <th className="text-left p-3 w-[14%] font-medium">Size</th>
                  <th className="text-left p-3 w-[24%] font-medium">Progress</th>
                  <th className="text-left p-3 w-[20%] font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-slate-700/40">
                    <td className="p-3 text-sm break-all">{r.file.name}</td>
                    <td className="p-3 text-sm">{formatBytes(r.file.size)}</td>
                    <td className="p-3">
                      <div className="h-2 w-full rounded-full bg-slate-700/50 overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-400 transition-[width] duration-100"
                          style={{ width: `${r.progress}%` }}
                        />
                      </div>
                    </td>
                    <td className="p-3 text-sm font-semibold">
                      {r.status === "Uploaded" && <span className="text-emerald-400">Uploaded</span>}
                      {r.status === "Uploading…" && <span className="text-amber-400">Uploading…</span>}
                      {r.status === "Queued" && <span className="text-slate-300">Queued</span>}
                      {r.status === "Error" && <span className="text-red-400">Error</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <button
            className="px-4 py-2 rounded-xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 text-slate-950 disabled:opacity-50"
            disabled={!rows.length}
            onClick={() => (mode === "sequential" ? uploadSequential() : uploadBatch())}
          >
            Upload
          </button>
          <button
            className="px-4 py-2 rounded-xl font-bold border border-slate-600 bg-slate-950 text-slate-200 disabled:opacity-50"
            disabled={!rows.length}
            onClick={reset}
          >
            Reset
          </button>
        </div>

        {/* Response box */}
        {response !== null && (
          <div className="mt-4 rounded-xl border border-slate-700/50 bg-slate-950 p-3 text-sm max-h-64 overflow-auto whitespace-pre-wrap">
            {(() => {
              try { return typeof response === "string" ? response : JSON.stringify(response, null, 2); }
              catch { return String(response); }
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
