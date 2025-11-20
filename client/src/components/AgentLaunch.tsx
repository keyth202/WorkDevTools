import React, { useState, useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { formState, transcriptState } from "@/app/recoil/atoms";
import CAMessenger from "./Google/CAMessenger";
import Evaluation from "./Google/Evaluation";

type Mood =
  | ""
  | "neutral"
  | "friendly"
  | "concise"
  | "enthusiastic"
  | "formal"
  | "sassy";

interface FormState {
  agentId: string;
  projectId: string;
  location: string;
  languageCode: string;
  chatTitle: string;
  prompt: string;
  mood: Mood;
  timeOfReply: number;
  turns: number;
  testCase: string;
}

export default function AgentLaunch(): JSX.Element {
  const [form, setForm] = useState<FormState>({
    agentId: "",
    projectId: "",
    location: "us-central1",
    languageCode: "en",
    chatTitle: "Demo",
    prompt: "",
    mood: "",
    timeOfReply: 0,
    turns:30,
    testCase: "",
  });
  const [saved, setSaved] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [globalForm, setGlobalForm] = useRecoilState(formState);
  const [transcript, setTranscript] = useRecoilState(transcriptState);
  const [launch, setLaunch] = useState<boolean>(false);

  // Sync local form to global recoil state
  useEffect(() => {
    setGlobalForm((prev) => ({ ...prev, 
      agentId: form.agentId,
      projectId: form.projectId,
      location: form.location,
      languageCode: form.languageCode,
      chatTitle: form.chatTitle,
      prompt: form.prompt,
      mood: form.mood,
      timeOfReply: form.timeOfReply,
      readyToLaunch: saved,
      turns:form.turns,
      testCase: form.testCase,
    }));
  }, [form, setGlobalForm]);

  const canSave: boolean =
    form.agentId.trim().length > 0 &&
    form.projectId.trim().length > 0 &&
    form.location.trim().length > 0 &&
    form.languageCode.trim().length > 0 &&
    form.prompt.trim().length > 0 &&
    form.mood.trim().length > 0 &&
    form.timeOfReply >= 0 &&
    form.turns > 0;

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ): void => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  async function handleSave(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!canSave) return;
    setSaving(true);

    try {
       setGlobalForm((prev) => ({ ...prev, 
        agentId: form.agentId,
        projectId: form.projectId,
        location: form.location,
        languageCode: form.languageCode,
        chatTitle: form.chatTitle,
        prompt: form.prompt,
        mood: form.mood,
        timeOfReply: form.timeOfReply,
        readyToLaunch: saved,
        turns:form.turns,
        testCase: form.testCase,
      }));
      //setLaunch(true);

    } catch {
      console.log("Error saving form");
      // ignore localStorage errors
    }
    await new Promise((r) => setTimeout(r, 500));

    setSaved(true);
    setSaving(false);
  }

  function handleLaunch(): void {
    // Replace with your real launch action
    //alert(`Launching agent ${form.agentId} with mood "${form.mood}". Say Hello in the chat`);
    setLaunch(true);
  }
  const handleExit = (): void => {
    setLaunch(false);
    const dfMessenger = document.querySelector("df-messenger");
    if (!dfMessenger) return;
    setTranscript({msgHx:[], isFinished:false});
    dfMessenger.startNewSession();
    window.location.reload();
  }
  const handleClearSession = (): void => {
    const dfMessenger = document.querySelector("df-messenger");
    if (!dfMessenger) return;
    dfMessenger.startNewSession();
  }
  return (
    <div className="min-h-screen bg-black text-teal-100 ">
      <div className="mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white">Agent Reply Config</h1>
          <p className="text-teal-300/70">
            Configure the agent prompt, mood, and reply timing.
          </p>
        </header> 
        {/* Beginning of form and evaluation section */}
        <div className={`grid grid-cols-2 grid-rows-2 gap-4`}>
        <form
          onSubmit={saved ? (e) => (e.preventDefault(), handleLaunch()) : handleSave}
          className="max-w-3xl rounded-2xl border border-teal-700/40 bg-gradient-to-b from-black to-[#0e3434] p-6 shadow-lg"
        >
          {/* agentId */}
          <label className="mb-2 block text-sm font-medium text-teal-200">
            Agent ID {launch && <span className="text-white"> : {form.agentId}</span>}
          </label>
          <input
            name="agentId"
            value={form.agentId}
            onChange={onChange}
            placeholder="e.g. agt_12345"
            className="mb-5 w-full rounded-xl border border-teal-700/50 bg-black px-4 py-2 text-teal-100 placeholder-teal-300/40 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/40"
          />
          {/* projectId */}
          <label className="mb-2 block text-sm font-medium text-teal-200">
            Project ID {launch && <span className="text-white"> : {form.projectId}</span>}
          </label>
          <input
            name="projectId"
            value={form.projectId}
            onChange={onChange}
            placeholder="e.g. agt_12345"
            className="mb-5 w-full rounded-xl border border-teal-700/50 bg-black px-4 py-2 text-teal-100 placeholder-teal-300/40 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/40"
          />
          {/* location */}
          <label className="mb-2 block text-sm font-medium text-teal-200">
            Location {launch && <span className="text-white"> : {form.location}</span>}
          </label>
          <input
            name="location"
            value={form.location}
            onChange={onChange}
            placeholder="e.g. us-central1"
            className="mb-5 w-full rounded-xl border border-teal-700/50 bg-black px-4 py-2 text-teal-100 placeholder-teal-300/40 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/40"
          />

          {/* prompt */}
          <label className="mb-2 block text-sm font-medium text-teal-200">
            System Instructions
          </label>
          <textarea
            name="prompt"
            value={form.prompt}
            onChange={onChange}
            rows={5}
            placeholder="Write the instruction the agent should follow…"
            className="mb-5 w-full rounded-xl border border-teal-700/50 bg-black px-4 py-2 text-teal-100 placeholder-teal-300/40 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/40"
          />

          {/* mood */}
          <label className="mb-2 block text-sm font-medium text-teal-200">
            Mood {launch && <span className="text-white"> : {form.mood}</span>}
          </label>
          <select
            name="mood"
            value={form.mood}
            onChange={onChange}
            className="mb-5 w-full rounded-xl border border-teal-700/50 bg-black px-4 py-2 text-teal-100 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/40"
          >
            <option value="">Choose a mood…</option>
            <option value="neutral">Neutral</option>
            <option value="friendly">Friendly</option>
            <option value="concise">Concise</option>
            <option value="enthusiastic">Enthusiastic</option>
            <option value="formal">Formal</option>
            <option value="sassy">Sassy</option>
          </select>

          {/* timeOfReply */}
          <label className="mb-2 block text-sm font-medium text-teal-200">
            Time between messages (ms) {launch && <span className="text-white"> : {form.timeOfReply} ms</span>}
          </label>
          <input
            type="integer"
            name="timeOfReply"
            value={form.timeOfReply}
            onChange={onChange}
            className="mb-8 w-full rounded-xl border border-teal-700/50 bg-black px-4 py-2 text-teal-100 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/40"
          />
          {/* turns */}
          <label className="mb-2 block text-sm font-medium text-teal-200">
            Turns {launch && <span className="text-white"> : {form.turns} ms</span>}
          </label>
          <input
            type="integer"
            name="turns"
            value={form.turns}
            onChange={onChange}
            className="mb-8 w-full rounded-xl border border-teal-700/50 bg-black px-4 py-2 text-teal-100 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/40"
          />
          {/* Test Case */}
          <label className="mb-2 block text-sm font-medium text-teal-200">
            Test Case
          </label>
          <textarea
            name="testCase"
            value={form.testCase}
            onChange={onChange}
            rows={5}
            placeholder="Write the test case to compare agent responses…"
            className="mb-5 w-full rounded-xl border border-teal-700/50 bg-black px-4 py-2 text-teal-100 placeholder-teal-300/40 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/40"
          />
          {/* Action button */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-teal-300/60">
              {saved ? "Saved. Ready to launch." : "Fill all fields, then save."}
            </p>

            {!saved ? (
              <button
                type="submit"
                disabled={!canSave || saving}
                className={`rounded-xl px-5 py-2 font-semibold transition
                ${
                  canSave && !saving
                    ? "bg-teal-500 text-black hover:bg-teal-400"
                    : "cursor-not-allowed bg-teal-900 text-teal-300"
                }`}
              >
                {saving ? "Saving…" : "Save"}
              </button>
            ) : (!launch &&
              <button
                type="button"
                onClick={handleLaunch}
                className="rounded-xl bg-black px-5 py-2 font-semibold text-teal-200 ring-2 ring-teal-500 transition hover:bg-teal-950 hover:text-teal-100"
              >
                Launch
              </button>
            )}
            {launch && (<div className="space-x-4">
              <button
                type="button"
                onClick={handleClearSession}
                className="rounded-xl bg-black px-5 py-2 font-semibold text-teal-200 ring-2 ring-teal-500 transition hover:bg-teal-950 hover:text-teal-100"
              >
                Clear Session and disable Auto-speak
              </button>
              <button
                type="button"
                onClick={handleExit}
                className="rounded-xl bg-black px-5 py-2 font-semibold text-teal-200 ring-2 ring-teal-500 transition hover:bg-teal-950 hover:text-teal-100"
              >
                Exit Launch
              </button>
             
              </div>)}
          </div>
        </form>
      {transcript.isFinished && <Evaluation />}
      </div>  
      </div> 
      {launch && (

          <CAMessenger
            projectId={form.projectId}
            agentId={form.agentId}
            location={form.location}
            languageCode={form.languageCode}
            chatTitle={form.chatTitle}
            sysIns={form.prompt}
            mood={form.mood}
            replyTime={form.timeOfReply}
            turns={form.turns}
          />
    
      )} 
      
    </div>
  );
}
