import React, { useEffect, useMemo, useRef, useState } from "react";
import { generateTextWHxIns} from "@/scripts/Google/gscript";
import { useRecoilState } from "recoil";
import { transcriptState, formState } from "@/app/recoil/atoms";

/** ---- Types ---- */
type Mood = "friendly" | "frustrated" | "curious";

type MessagePart = { text: string };
type HistoryEntry =
  | { role: "user"; parts: MessagePart[] }
  | { role: "model"; parts: MessagePart[] };

type DFRequestSentEvent = CustomEvent<{ requestBody: unknown }>;
type DFResponseReceivedEvent = CustomEvent<{ messages: Array<{ text?: string }> }>;

interface HTMLDfMessengerElement extends HTMLElement {
  renderCustomText: (text: string, fromUser?: boolean) => void;
  sendQuery: (query: string) => void;
}
// Extend JSX to include df-messenger web component

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "df-messenger": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        location?: string;
        "project-id"?: string;
        "agent-id"?: string;
        "language-code"?: string;
        "max-query-length"?: string | number;
        "storage-option"?: "sessionStorage" | "localStorage";
      };
      "df-messenger-chat-bubble": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        "chat-title"?: string;
      };
    }
  }
}
  
const rng = Math.floor(Math.random() * 2)+1; // 1-2
/** ---- Props ---- */
interface CAMessengerProps {
  projectId: string;
  agentId: string;
  location?: string;
  languageCode?: string;
  chatTitle?: string;
  mood?: string;
  sysIns?: string;
  maxQueryLength?: number;
  storageOption?: "sessionStorage" | "localStorage";
  replyTime?: number;
  turns?: number;
  testCase?: string;
}

const CAMessenger: React.FC<CAMessengerProps> = ({
  projectId,
  agentId,
  location = "us-central1",
  languageCode = "en",
  chatTitle = "KC-Demo",
  mood,
  sysIns,
  maxQueryLength = -1,
  storageOption = "sessionStorage",
  replyTime = 500,
  turns = 30,
  testCase = "",
}) => {

  const [msgHx, setMsgHx] = useState<HistoryEntry[]>([]);
  const [msgCount, setMsgCount] = useState<number>(0);
  const [transcript, setTranscript] = useRecoilState(transcriptState);
  const msgCountRef = useRef<number>(0);
  useEffect(() => {
    msgCountRef.current = msgCount;
  }, [msgCount]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/df-messenger.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    //const dfMessenger = document.querySelector("df-messenger") as HTMLDfMessengerElement | null;
    const dfMessenger = document.querySelector("df-messenger");
    if (!dfMessenger) return;

    const handleRequestSent = (event: Event) => {
      const e = event as DFRequestSentEvent;
      console.log("Request Sent:", e.detail?.requestBody);
    };

    const handleResponseReceived = (event: Event) => {
      const e = event as DFResponseReceivedEvent;
      console.log("Response Received:", e.detail);
      const responseData = e.detail?.messages?.[0]?.text;
      if (responseData == null) return;

      // Light throttle
      if (msgCountRef.current >= turns){
        setTranscript((prev) => ({...prev, isFinished:true}));
        return;
      } 
      const toneIns =`Respond in a **${mood}** tone. ${sysIns ? sysIns : ""}`;
      setTimeout(() => {
        appendToHistory({ role: "model", parts: [{ text: responseData }] }, async (nextHistory) => {
          const reply = await generateTextWHxIns(responseData, nextHistory, toneIns);
          // Or, if you want to bypass history/mood: const reply = await generateTextWOhx(responseData);
          sendProgrammaticMessage(reply, nextHistory);
        });
      }, replyTime);
    };

    dfMessenger.addEventListener("df-request-sent", handleRequestSent as EventListener);
    dfMessenger.addEventListener("df-response-received", handleResponseReceived as EventListener);

    return () => {
      dfMessenger.removeEventListener("df-request-sent", handleRequestSent as EventListener);
      dfMessenger.removeEventListener("df-response-received", handleResponseReceived as EventListener);
    };
  }, [ ]);

  function appendToHistory(entry: HistoryEntry, afterAppend?: (nextHistory: HistoryEntry[]) => void) {
    setMsgHx((prev) => {
      const next = [...prev, entry];
      setMsgCount((c) => c + 1);
      if (afterAppend) afterAppend(next);
      return next;
    });
  }

  function sendProgrammaticMessage(queryText: string, baseHistory?: HistoryEntry[]) {
    const dfMessenger = document.querySelector("df-messenger") as HTMLDfMessengerElement | null;
    if (!dfMessenger) return;

    const entry: HistoryEntry = { role: "user", parts: [{ text: queryText }] };

    if (baseHistory) {
      const next = [...baseHistory, entry];
      setTranscript((prev) => ({ ...prev, msgHx: next, isFinished: false }));
      setMsgHx(next);
      setMsgCount((c) => c + 1);
    } else {
      appendToHistory(entry);
    }

    try {
      dfMessenger.renderCustomText(queryText, false);
      dfMessenger.sendQuery(queryText);
      console.log("Sending programmatic message to Dialogflow:", queryText);
    } catch (e) {
      console.error("Error sending programmatic message:", e);
    }
  }

  return (
    <div>
      <df-messenger
        location={location}
        project-id={projectId}
        agent-id={agentId}
        language-code={languageCode}
        max-query-length={maxQueryLength}
        storage-option={storageOption}
      >
        <df-messenger-chat-bubble chat-title={chatTitle}></df-messenger-chat-bubble>
      </df-messenger>

      <style>
        {`
          df-messenger {
            z-index: 999;
            position: fixed;
            --df-messenger-font-color: #000;
            --df-messenger-font-family: Google Sans, Roboto, sans-serif;
            --df-messenger-chat-background: #f3f6fc;
            --df-messenger-message-user-background: #d3e3fd;
            --df-messenger-message-bot-background: #fff;
            bottom: 16px;
            right: 16px;
          }
        `}
      </style>
    </div>
  );
};

export default CAMessenger;


