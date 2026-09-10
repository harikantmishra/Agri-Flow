import { useState } from "react";
import { Bot, Send, X } from "lucide-react";
import { API_BASE_URL } from "../config/api";

export default function AIFarmerAssistant({ isHindi }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMessage = message.trim();

    // Save current conversation BEFORE sending
    const updatedMessages = [
      ...messages,
      {
        role: "user",
        text: userMessage,
      },
    ];

    setMessages(updatedMessages);
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/ai/chat`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userMessage,

            // Send conversation history to backend
            history: updatedMessages,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "AI request failed"
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.reply,
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: isHindi
            ? "क्षमा करें, AI अभी उपलब्ध नहीं है।"
            : "Sorry, AI assistant is currently unavailable.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-8 bg-white border rounded-xl overflow-hidden">

      {/* Header */}
      <div className="bg-green-800 text-white p-5 flex items-center justify-between">

        <div className="flex items-center gap-3">
          <div className="bg-white/15 p-2 rounded-lg">
            <Bot size={25} />
          </div>

          <div>
            <h2 className="font-bold text-lg">
              {isHindi
                ? "AGRI-FLOW AI सहायक"
                : "AGRI-FLOW AI Assistant"}
            </h2>

            <p className="text-green-100 text-sm">
              {isHindi
                ? "अपनी खेती और खरीद से जुड़े सवाल पूछें"
                : "Ask questions about procurement and your account"}
            </p>
          </div>
        </div>

        {open && (
          <button
            onClick={() => setOpen(false)}
            className="hover:bg-white/10 p-2 rounded-lg"
          >
            <X size={20} />
          </button>
        )}

      </div>

      {/* Open Assistant */}
      {!open && (
        <div className="p-6">

          <p className="text-slate-600">
            {isHindi
              ? "स्लॉट बुकिंग, खरीद, गुणवत्ता, भुगतान और AGRI-FLOW के बारे में पूछें।"
              : "Ask about slot booking, procurement, quality, payments and AGRI-FLOW."}
          </p>

          <button
            onClick={() => setOpen(true)}
            className="mt-4 bg-green-700 hover:bg-green-800 text-white px-5 py-3 rounded-lg font-medium inline-flex items-center gap-2"
          >
            <Bot size={18} />

            {isHindi
              ? "AI से पूछें"
              : "Ask AI"}
          </button>

        </div>
      )}

      {/* Chat */}
      {open && (
        <div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-5 space-y-3">

            {messages.length === 0 && (
              <div className="bg-green-50 rounded-lg p-4 text-sm text-slate-600">

                <p className="font-medium text-green-800">
                  {isHindi
                    ? "आप पूछ सकते हैं:"
                    : "You can ask:"}
                </p>

                <div className="mt-2 space-y-1">
                  <p>
                    •{" "}
                    {isHindi
                      ? "मैं स्लॉट कैसे बुक करूं?"
                      : "How do I book a slot?"}
                  </p>

                  <p>
                    •{" "}
                    {isHindi
                      ? "गुणवत्ता जांच क्या है?"
                      : "What is quality checking?"}
                  </p>

                  <p>
                    •{" "}
                    {isHindi
                      ? "भुगतान कैसे मिलेगा?"
                      : "How does payment work?"}
                  </p>

                  <p>
                    •{" "}
                    {isHindi
                      ? "मेरी फसल की खरीद प्रक्रिया क्या है?"
                      : "What is the procurement process?"}
                  </p>
                </div>

              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={
                  msg.role === "user"
                    ? "ml-8 bg-green-100 rounded-lg p-3 text-sm"
                    : "mr-8 bg-slate-100 rounded-lg p-3 text-sm"
                }
              >
                {/* IMPORTANT:
                    whitespace-pre-line preserves
                    Gemini's line breaks
                */}
                <div className="whitespace-pre-line leading-6">
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="mr-8 bg-slate-100 rounded-lg p-3 text-sm text-slate-500">
                {isHindi
                  ? "AI सोच रहा है..."
                  : "AI is thinking..."}
              </div>
            )}

          </div>

          {/* Input */}
          <div className="border-t p-4 flex gap-2">

            <input
              type="text"
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
              placeholder={
                isHindi
                  ? "अपना सवाल लिखें..."
                  : "Ask AGRI-FLOW AI..."
              }
              className="flex-1 border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
            />

            <button
              onClick={sendMessage}
              disabled={
                loading || !message.trim()
              }
              className="bg-green-700 hover:bg-green-800 disabled:bg-slate-300 text-white px-4 rounded-lg"
            >
              <Send size={19} />
            </button>

          </div>

        </div>
      )}

    </section>
  );
}