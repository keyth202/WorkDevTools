const webSocketUrl =`wss://webmessaging.mypurecloud.com/v1`

export const generateUUID = () => {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
    // Fallback for environments without window.crypto (e.g., server-side rendering without a polyfill)
    console.warn("crypto.randomUUID not available, falling back to a less robust method.");
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
};
export const chatConfig ={
  "action": "getConfiguration",
  "tracingId": generateUUID(),
  "deploymentId": "dc1a521a-98a2-482e-9bdf-8d8a88dfbd31",
}