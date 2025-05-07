"use client";

import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

export default function ChatPage() {
  const [activeSection, setActiveSection] = useState("private");
  const [showOptions, setShowOptions] = useState(false);
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const socketRef = useRef(null);
  const roomId = "global-room"; // 可改为根据用户动态分配

  // 连接 socket
  useEffect(() => {
    socketRef.current = io("http://localhost:5000"); // 记得修改为你的后端地址
    socketRef.current.emit("joinRoom", roomId);

    // 监听接收消息
    socketRef.current.on("chatMessage", (msg) => {
      setChatLog((prev) => [...prev, msg]);
    });

    // 清理连接
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const handleSend = () => {
    if (message.trim() === "") return;
    const msg = { message, sender: "me", roomId };
    socketRef.current.emit("chatMessage", msg);
    setMessage("");
  };

  const toggleSection = (section) => {
    setActiveSection((prev) => (prev === section ? "" : section));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="pt-[72px] flex h-screen overflow-hidden">
        {/* 左侧聊天栏 */}
        <aside className="w-48 h-screen rounded shadow flex flex-col overflow-y-auto bg-black text-white">
          <div
            className="bg-blue-500 px-4 py-4 cursor-pointer h-14 hover:text-gray-200"
            onClick={() => toggleSection("private")}
          >
            Private chat
          </div>
          <div className={activeSection === "private" ? "bg-gray-800" : "bg-gray-200"}>
            {activeSection === "private" &&
              [...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center px-4 py-2 border-b border-gray-700">
                  <div className="w-8 h-8 rounded-full bg-gray-400 mr-3" />
                  <span className="text-sm text-white">Name</span>
                </div>
              ))}
          </div>
          <div
            className="bg-blue-500 px-4 py-4 cursor-pointer h-14 hover:text-gray-200"
            onClick={() => toggleSection("group")}
          >
            Group chat
          </div>
          <div className={activeSection === "group" ? "bg-gray-800" : "bg-gray-200"}>
            {activeSection === "group" &&
              [...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center px-4 py-2 border-b border-gray-700">
                  <div className="w-8 h-8 rounded-full bg-gray-400 mr-3" />
                  <span className="text-sm text-white">Name</span>
                </div>
              ))}
          </div>
          <div className="mt-auto h-0 bg-gray-200 w-full shrink-0" />
        </aside>

        {/* 主聊天区域 */}
        <main className="flex-1 flex flex-col relative">
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {chatLog.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start ${msg.sender === "me" ? "justify-end" : ""}`}
              >
                {msg.sender !== "me" && (
                  <div className="w-10 h-10 rounded-full bg-gray-300 mr-3" />
                )}
                <div
                  className={`${
                    msg.sender === "me"
                      ? "bg-gray-900 rounded-br-none ml-2"
                      : "bg-black rounded-bl-none mr-2"
                  } text-white px-4 py-2 rounded-lg max-w-xs`}
                >
                  {msg.message}
                </div>
                {msg.sender === "me" && (
                  <div className="w-10 h-10 rounded-full bg-gray-300 ml-3" />
                )}
              </div>
            ))}
          </div>

          {/* 输入栏 */}
          <div className="bg-black-200 px-4 py-3 flex items-end gap-4">
            <textarea
              rows={1}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 rounded border border-gray-400 text-black resize-none overflow-y-auto max-h-[33vh] leading-snug"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, window.innerHeight / 3)}px`;
              }}
            />
            <button className="px-6 py-2 bg-black text-white rounded" onClick={handleSend}>
              Send
            </button>
          </div>

          {/* 展开按钮组 */}
          {showOptions && (
            <div className="absolute bottom-36 right-6 flex flex-col space-y-3 items-end">
              <button className="bg-blue-500 text-white px-4 py-2 rounded shadow">Send File</button>
              <button className="bg-blue-500 text-white px-4 py-2 rounded shadow">Send Image</button>
              <button className="bg-blue-500 text-white px-4 py-2 rounded shadow">Send Video</button>
            </div>
          )}

          {/* 加号按钮 */}
          <button
            className="absolute bottom-20 right-6 w-12 h-12 bg-blue-500 text-white rounded-full text-2xl"
            onClick={() => setShowOptions(!showOptions)}
          >
            +
          </button>
        </main>
      </div>
    </div>
  );
}
