import { useState, useEffect, useRef } from 'react';

const useWebSocket = () => {
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [messages, setMessages] = useState<object>({});
    const [isConnected, setIsConnected] = useState(false);
    const reconnectRef = useRef<NodeJS.Timeout | null>(null);
    const [orgId, setOrgId] = useState<string>("");
    const [userId, setUserId] = useState<string>("");
    const [url, setUrl] = useState<string>("");
    useEffect(() => {
        //if(url && orgId && userId && !isConnected){
            let socket: WebSocket;

            const connectWebSocket = () => {
            console.log("Connecting to WebSocket...");

            socket = new WebSocket(url);
            setWs(socket);

            socket.onopen = () => {
                console.log("✅ Connected to WebSocket");
                socket.send(JSON.stringify({type:"init",orgId:orgId, userId:userId}));
                setIsConnected(true);
            };

            socket.onmessage = (event) => {
                console.log("📩 Message received:", event.data);
                //setMessages((prev) => [...prev, event.data]);
                setMessages(event.data);
            };

            socket.onerror = (error) => {
                console.error("❌ WebSocket error:", error);
            };

            socket.onclose = () => {
                console.warn("⚠️ WebSocket closed. Reconnecting...");
                setIsConnected(false);
                reconnectWebSocket();
            };
            };

            const reconnectWebSocket = () => {
            if (reconnectRef.current) clearTimeout(reconnectRef.current);
            reconnectRef.current = setTimeout(() => {
                connectWebSocket();
            }, 3000); // Reconnect after 3 seconds
            };

            connectWebSocket();

            return () => {
            if (socket) {
                socket.close();
            }
            if (reconnectRef.current) {
                clearTimeout(reconnectRef.current);
            }
            };
        //}
    }, [url]);

  const sendMessage = (message: string) => {
    if (ws && isConnected) {
      ws.send(message);
      console.log("📤 Sent:", message);
    } else {
      console.warn("⚠️ WebSocket not connected. Cannot send message.");
    }
  };
  const startSocket = (wssUrl:string, orgId:string, userId:string) => {
    console.log("Starting socket", wssUrl, orgId, userId);
    setUserId(userId);
    setOrgId(orgId);
    setUrl(wssUrl);
    setIsConnected(false);
  };

  return { messages, sendMessage, isConnected, startSocket };
};

export default useWebSocket;
