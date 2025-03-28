"use client";

import React from "react";

export default function FloatingToolbar({
  onHighlight,
  onUnderline,
  onAddComment,
  onDrawSignature,
}: {
  onHighlight: () => void;
  onUnderline: () => void;
  onAddComment: () => void;
  onDrawSignature: () => void;
}) {
  return (
    <div className="fixed bottom-6 right-6 flex gap-4 bg-white shadow-lg p-3 rounded-lg border border-gray-300">
      <button
        className="p-2 bg-yellow-400 rounded-full text-white cursor-pointer shadow-md hover:bg-yellow-500 transition-all"
        onClick={onHighlight}>
        ✏️ Highlight
      </button>
      <button
        className="p-2 bg-blue-500 rounded-full text-white shadow-md cursor-pointer hover:bg-blue-600 transition-all"
        onClick={onUnderline}>
        🔽 Underline
      </button>
      <button
        className="p-2 bg-green-500 rounded-full text-white shadow-md hover:bg-green-600 cursor-pointer transition-all"
        onClick={onAddComment}>
        💬 Comment
      </button>
      <button
        className="p-2 bg-green-500 rounded-full text-white shadow-md cursor-pointer hover:bg-green-600 transition-all"
        onClick={onDrawSignature}>
        ✍ Signature
      </button>
    </div>
  );
}
