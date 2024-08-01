"use client";
import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const msgEnd = useRef(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatContainerRef = useRef(null);

  const defaultCommands = [
    { heading: "Recommend a song.", subheading: "Get a song recommendation.", message: "Recommend a song." },
    { heading: "What's a good album?", subheading: "Get an album recommendation.", message: "What's a good album?" },
    { heading: "Who's your favorite artist?", subheading: "Get a favorite artist recommendation.", message: "Who's your favorite artist?" },
    { heading: "Suggest some music.", subheading: "Get music suggestions.", message: "Suggest some music." }
  ];

  const handleCommandClick = (message) => {
    setInput(message);
    handleSubmit(message);
  };

  const removeMarkdown = (text) => {
    return text.replace(/\*\*(.*?)\*\*/g, '$1');
  };

  const handleSubmit = async (message) => {
    if (!message.trim()) {
      return;
    }

    const userMessage = { sender: 'You', text: message };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const botMessage = await response.json();
      botMessage.text = removeMarkdown(botMessage.text);
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prevMessages) => [...prevMessages, { sender: 'Bot', text: "I'm not sure how to respond to that." }]);
    }
  };

  useEffect(() => {
    if (msgEnd.current) {
      msgEnd.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900">
      <div className="w-full max-w-lg bg-grey-400 rounded-lg shadow-lg flex flex-col h-full">
        <div className="mx-auto max-w-2xl px-4 py-8">
          <div className="flex flex-col gap-2 rounded-lg border x p-8">
            <h1 className="text-lg font-semibold text-white">
              Welcome to the Music Recommendation Bot!
            </h1>
            <p className="leading-normal text-gray-400">
              This bot recommends music based on your queries. Ask for songs, albums, or artists!
            </p>
          </div>
        </div>
        <div className="flex-1 p-4 overflow-y-auto" ref={chatContainerRef}>
          {messages.map((message, index) => (
            <div key={index} className={`mb-4 flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'}`}><div ref={msgEnd} />
              <div className={`max-w-xs rounded-lg px-4 py-2 ${message.sender === 'You' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-white'} break-words`}>
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-gray-800 border-t border-gray-700">
          <div className="mb-4 grid grid-cols-2 gap-2 px-4 sm:px-0">
            {defaultCommands.map((command, index) => (
              <div
                key={index}
                onClick={() => handleCommandClick(command.message)}
                className="cursor-pointer rounded-lg border bg-gray-700 p-4 hover:bg-gray-600"
              >
                <div className="text-sm font-semibold text-white">{command.heading}</div>
                <div className="text-sm text-gray-400">{command.subheading}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="fixed bottom-0 w-full max-w-lg p-4 bg-gray-800 border-t border-gray-700">
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(input); }} className="flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full px-4 py-2 border rounded-l-lg focus:outline-none bg-gray-900 text-white placeholder-gray-400"
              placeholder="Type your message..."
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600">
              Send
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
