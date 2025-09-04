import { useChatStore } from '@prodgenie/libs/store';
import { X, MessageCircle, Paperclip } from 'lucide-react';
import { useState } from 'react';

type Message = {
  id: string;
  ticketRef: string;
  sender: 'user' | 'support';
  text?: string;
  timestamp: string;
  fileUrl?: string;
};

export default function ChatWidget() {
  const { isOpen, toggle, close } = useChatStore();
  const [activeTab, setActiveTab] = useState<'current' | 'all'>('current');
  const [messages, setMessages] = useState<Message[]>([]);
  const [allMessages, setAllMessages] = useState<Message[][]>([]);
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleSend = () => {
    if (!input.trim() && !file) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      ticketRef:
        messages[0]?.ticketRef || 'TCK-' + Math.floor(Math.random() * 10000),
      sender: 'user',
      text: input || undefined,
      timestamp: new Date().toLocaleTimeString(),
      fileUrl: file ? URL.createObjectURL(file) : undefined,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setFile(null);

    // Fake support reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          ticketRef: newMessage.ticketRef,
          sender: 'support',
          text: "Thanks! We'll get back to you.",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    }, 1000);
  };

  const handleCloseChat = () => {
    if (messages.length > 0) {
      setAllMessages((prev) => [...prev, messages]); // store in history
      setMessages([]);
    }
    close();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Button */}
      {/* {!isOpen && (
        <button
          onClick={toggle}
          className="bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:opacity-90 transition"
        >
          <MessageCircle size={24} />
        </button>
      )} */}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-96 h-[600px] bg-background text-foreground rounded-2xl shadow-xl flex flex-col overflow-hidden border">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-3 flex justify-between items-center">
            <span className="font-medium">Contact Support</span>
            <button onClick={handleCloseChat}>
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-muted">
            {(activeTab === 'current' ? messages : allMessages.flat()).length ===
            0 ? (
              <div className="p-2 rounded-lg bg-accent text-accent-foreground text-sm max-w-[75%]">
                Hi there 👋 <br /> How can we help?
              </div>
            ) : (
              (activeTab === 'current' ? messages : allMessages.flat()).map(
                (m) => (
                  <div
                    key={m.id}
                    className={`p-3 rounded-lg max-w-[75%] text-sm shadow-sm ${
                      m.sender === 'user'
                        ? 'bg-primary text-primary-foreground self-end ml-auto'
                        : 'bg-accent text-accent-foreground self-start'
                    }`}
                  >
                    {/* Meta */}
                    <div className="text-xs font-semibold opacity-70 mb-1">
                      {m.sender === 'user' ? 'You' : 'Support'} • {m.ticketRef}
                    </div>

                    {/* Text */}
                    {m.text && <div>{m.text}</div>}

                    {/* File Attachment */}
                    {m.fileUrl && (
                      <a
                        href={m.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-2 text-xs underline"
                      >
                        📎 Attachment
                      </a>
                    )}

                    {/* Timestamp */}
                    <div className="text-[10px] opacity-50 mt-1 text-right">
                      {m.timestamp}
                    </div>
                  </div>
                )
              )
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t flex items-center gap-2 bg-background">
            {/* File input */}
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <label htmlFor="file-upload" className="cursor-pointer text-muted-foreground">
              <Paperclip size={20} />
            </label>

            <input
              type="text"
              className="flex-1 border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={handleSend}
              className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
            >
              Send
            </button>
          </div>

          {/* Tabs */}
          <div className="border-t flex">
            <button
              className={`flex-1 py-2 text-sm ${
                activeTab === 'current'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
              onClick={() => setActiveTab('current')}
            >
              Current Chat
            </button>
            <button
              className={`flex-1 py-2 text-sm ${
                activeTab === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
              onClick={() => setActiveTab('all')}
            >
              All Messages
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
