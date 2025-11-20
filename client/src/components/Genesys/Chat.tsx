import React, {useState}from 'react'
import GenesysMessenger from './GenesysMessenger'
interface FloatingMessengerProps {
  websocketUrl: string;
  deploymentId: string;
  token?: string;
}

const Chat: React.FC<FloatingMessengerProps> = ({
  websocketUrl,
  deploymentId,
  token,
}) => {
    const [open, setOpen] = useState(false);
  return (
     <>
      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-20 right-4 z-50">
          <div className="w-[340px] h-[480px] rounded-2xl shadow-xl border bg-white overflow-hidden">
            <GenesysMessenger
              websocketUrl={websocketUrl}
              deploymentId={deploymentId}
              token={token}
              //onClose={() => setOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Floating round launcher button */}
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 z-40 w-14 h-14 rounded-full shadow-lg bg-blue-600 text-white flex items-center justify-center text-2xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          💬
        </button>
      ): <button
          type="button"
          onClick={() => setOpen(false)}
          className="fixed bottom-4 right-4 z-40 w-14 h-14 rounded-full shadow-lg bg-blue-600 text-white flex items-center justify-center text-2xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          X
        </button>}
    </>
  );
}

export default Chat
