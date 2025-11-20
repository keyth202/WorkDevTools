// SimpleGenesysMessenger.tsx
import React, { useEffect, useRef, useState } from "react";


type Direction = "inbound" | "outbound" | "system";

interface ChatMessage {
  id: string;
  text: string;
  direction: Direction;
  raw?: unknown;
}

interface SimpleGenesysMessengerProps {
  websocketUrl: string;  
  deploymentId: string;   
  token?: string;        
}

const GenesysMessenger: React.FC<SimpleGenesysMessengerProps> = ({
  websocketUrl,
  deploymentId,
  token,
}) => {
  const [socketReady, setSocketReady] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const tracingId = useRef<string>(crypto.randomUUID());

  const pushMessage = (msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  };

  useEffect(() => {
    const ws = new WebSocket(websocketUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setSocketReady(true);

      // configureSession frame
      const configurePayload: Record<string, unknown> = {
        //action: "getConfiguration",
        action:"configureSession",
        deploymentId,
        tracingId: tracingId.current,
        token: token,
        //startNew:true
      };
      if (token) {
        configurePayload.token = token;
      }

      ws.send(JSON.stringify(configurePayload));

      pushMessage({
        id: crypto.randomUUID(),
        text: "🔌 Connected to Genesys Web Messaging",
        direction: "system",
      });
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log(data)

        const textFromServer =  data?.body?.text || JSON.stringify(data);
        if(data.type=="response" || data.body?.direction=="Inbound") return;
        pushMessage({
          id: crypto.randomUUID(),
          text: String(textFromServer),
          direction: "inbound",
          raw: data,
        });
      } catch (e) {
        pushMessage({
          id: crypto.randomUUID(),
          text: `Received non-JSON frame: ${event.data}`,
          direction: "system",
        });
      }
    };

    ws.onerror = (evt) => {
      pushMessage({
        id: crypto.randomUUID(),
        text: `⚠️ WebSocket error: ${JSON.stringify(evt)}`,
        direction: "system",
      });
    };

    ws.onclose = () => {
      setSocketReady(false);
      pushMessage({
        id: crypto.randomUUID(),
        text: "🔒 WebSocket closed.",
        direction: "system",
      });
    };

    return () => {
      ws.close();
    };
  }, [websocketUrl, deploymentId, token]);

  const sendText = () => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN || !input.trim()) return;

    setSending(true);

    const frame: Record<string, unknown> = {
      action: "onMessage",
      message: {
        type: "Text",
        text: input.trim(),
      },
      tracingId: crypto.randomUUID(),
    };

    if (token) {
      frame.token = token;
    }

    ws.send(JSON.stringify(frame));

    pushMessage({
      id: crypto.randomUUID(),
      text: input.trim(),
      direction: "outbound",
    });

    setInput("");
    setSending(false);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendText();
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[600px] w-full max-w-md border rounded-xl shadow-sm bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div>
          <div className="font-semibold text-sm">Genesys Demo Messenger</div>
          <div className="text-[11px] text-gray-500">
            {socketReady ? "Connected" : "Connecting…"}
          </div>
        </div>
        <div className="w-2 h-2 rounded-full">
          {/* Status dot, maybe change to red when disconnected */}
          <span
            className={
              "inline-block w-2 h-2 rounded-full " +
              (socketReady ? "bg-green-500" : "bg-gray-400")
            }
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 text-sm bg-gray-50">
        {messages.map((m) => (
          <div
            key={m.id}
            className={
              "flex " +
              (m.direction === "outbound"
                ? "justify-end"
                : m.direction === "inbound"
                ? "justify-start"
                : "justify-center")
            }
          >
            <div
              className={
                "px-3 py-2 rounded-2xl max-w-[80%] " +
                (m.direction === "outbound"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : m.direction === "inbound"
                  ? "bg-white text-gray-900 border rounded-bl-sm"
                  : "bg-transparent text-[11px] text-gray-500 border-none")
              }
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t px-3 py-2 flex items-center gap-2">
        <input
          className="flex-1 border rounded-full px-3 py-2 text-sm outline-none focus:ring focus:ring-blue-200"
          placeholder={
            socketReady ? "Type a message…" : "Connecting to Genesys…"
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!socketReady || sending}
        />
        <button
          className="px-3 py-2 text-sm rounded-full bg-blue-600 text-white disabled:opacity-50"
          onClick={sendText}
          disabled={!socketReady || sending || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default GenesysMessenger;


