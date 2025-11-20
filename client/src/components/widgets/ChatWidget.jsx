import React, {useState, useRef, useEffect} from 'react'
import { generateText, generateTextWHx } from '@/scripts/Google/gscript';

const ChatWidget = ({
    title = "Chat",
    placeholder = "Type a message…",
    onSend,
    initialOpen = false,
}) => {
    const [msgLog, setMsgLog] = useState([]);
    const [msgHx, setMsgHx] = useState([]);
    const [messages, setMessages] = useState([]);
    const [open, setOpen] = useState(initialOpen);
    const [input, setInput] = useState("");
    const panelRef = useRef(null);
    const listRef = useRef(null);

    useEffect(() => {
        function onKey(e) {
            if (e.key === "Escape") setOpen(false);
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);
    
    useEffect(() => {
        function handleClick(e) {
            if (!open) return;
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setOpen(false);
                setMsgLog([]);
       
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);
    
    useEffect(() => {
        const el = listRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [msgLog, open]);

    function linkifyBoldToGoogleMarkdown(text, extraTerms = "") {
        return text.replace(/\*\*([^*]+?)\*\*/g, (_, raw) => {
            const titleForQuery = raw.trim().replace(/[\s:—-]+$/u, ""); 
            const q = extraTerms ? `${titleForQuery} ${extraTerms}` : titleForQuery;
            const url = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
            return `*${raw}**(${url})`;
        });
    }
    
    async function handleSend(e) {
        e?.preventDefault();
        const text = input.trim();
        if (!text) return;
        console.log("Sending message:", text);
        const id = Date.now().toString();
        setMsgLog((prev) => [...prev, { id, author: "user", text }]);
        setMsgHx((prev) => [...prev, {  role: "user", parts: [{text }] }]);
        setInput("");
         try {
                //const reply = await onSend(text);
                //const reply = await generateText(text);
                const reply = await generateTextWHx(text, msgHx);
                console.log("Received reply:", reply);
                if (typeof reply === "string" && reply.length > 0) {
                    const rid = `${id}-r`;
                    setMsgLog((prev) => [
                        ...prev,
                        { id: rid, author: "bot", text: reply },
                    ]);
                    setMsgHx((prev) => [...prev, {  role: "model", parts: [{text: reply }] }]);
                }
            } catch (err) {
            console.error(err);
            }
       
    }
    function onClose() {
        setOpen(false);
        setMsgLog([]);
        setInput("");
    }
    async function handleSendwHx(e) {
        e?.preventDefault();
        const text = input.trim();
        if (!text) return;
        const id = Date.now().toString();
        setMsgLog((prev) => [...prev, { id, author: "user", text }]);
        setInput("");
        if (onSend) {
            try {
                const reply = await generateTextWHx(text, msgLog);
                if (typeof reply === "string" && reply.length > 0) {
                    const rid = `${id}-r`;
                    setMsgLog((prev) => [
                        ...prev,
                        { id: rid, author: "bot", text: reply },
                    ]);
                }
            } catch (err) {
                console.error(err);
            }
        }
    }

    return (
     <>
        {/* Floating button */}
        <button
            aria-label={open ? "Close chat" : "Open chat"}
            onClick={() => setOpen((o) => !o)}
            className="fixed left-6 bottom-6 z-50 rounded-full p-3 shadow-lg bg-gray-900 text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
        >
        {/* Chat icon */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6"
            >
                <path d="M1.5 6.75A3.75 3.75 0 0 1 5.25 3h13.5A3.75 3.75 0 0 1 22.5 6.75v6A3.75 3.75 0 0 1 18.75 16.5H8.81l-3.93 3.27A1 1 0 0 1 3 18.95V16.5h-.75A3.75 3.75 0 0 1 1.5 12.75v-6Z" />
            </svg>
        </button>


        {/* Chat panel */}
        {open && (
            <div
                ref={panelRef}
                className="fixed left-6 bottom-28 sm:bottom-16 z-50 w-[92vw] max-w-sm rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden animate-[fadeIn_120ms_ease-out]"
                role="dialog"
                aria-modal="true"
            >
                <header className="flex items-center justify-between gap-2 px-3 py-2 bg-gray-900 text-white">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
                        <h2 className="font-semibold text-sm">{title}</h2>
                    </div>
                    <button
                        onClick={() => setOpen(false)}
                        className="rounded-md p-1 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white"
                        aria-label="Close"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                            <path fillRule="evenodd" d="M10 8.586 4.293 2.879 2.879 4.293 8.586 10l-5.707 5.707 1.414 1.414L10 11.414l5.707 5.707 1.414-1.414L11.414 10l5.707-5.707-1.414-1.414L10 8.586Z" clipRule="evenodd" />
                        </svg>
                    </button>
                </header>


            <div
                ref={listRef}
                className="h-72 overflow-y-auto bg-gray-50 px-3 py-3 space-y-2"
            >
                {msgLog.map((m) => (
                    <div key={m.id} className={m.author === "user" ? "flex justify-end" : "flex justify-start"}>
                    <div
                    className={
                    "max-w-[80%] rounded-2xl px-3 py-2 text-sm " +
                    (m.author === "user"
                    ? "bg-gray-900 text-white"
                    : "bg-white border border-gray-200 text-gray-900")
                    }
                    >
                        <div
                            dangerouslySetInnerHTML={{__html: m.text}}
                        />
                    {/*m.text*/}
                    </div>
                    </div>
                ))}
        </div>


        <form onSubmit={handleSend} className="flex gap-2 border-t border-gray-200 bg-white p-2">
            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={placeholder}
                className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900"
            />
            <button
                type="submit"
                className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            >
            Send
            </button>
        </form>
        </div>
        )}


        <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
        </>
        );
}

export default ChatWidget