"use client";

import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/app/redux/store";
import { setUploadedFile } from "../redux/pdfSlice";

export default function UploadComponent() {
  const dispatch = useDispatch<AppDispatch>();
  const uploadedFile = useSelector(
    (state: RootState) => state.pdf.uploadedFile
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ Handle File Selection (Browse)
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      dispatch(setUploadedFile(event.target.files[0]));
    }
  };

  // ✅ Handle Drag & Drop
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files.length > 0) {
      dispatch(setUploadedFile(event.dataTransfer.files[0]));
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer hover:border-orange-500 transition-all duration-300"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()} // ✅ Clicking opens file picker
    >
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="application/pdf"
        onChange={handleFileUpload}
      />

      {/* Upload Icon */}
      <svg
        className="w-12 h-12 text-gray-500 mb-2"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3 15a4 4 0 004 4h10a4 4 0 004-4M7 10l5-5m0 0l5 5m-5-5v12"
        />
      </svg>

      {/* Drag & Drop Text */}
      <p className="text-gray-600">
        Drag & Drop a PDF file here or{" "}
        <span className="text-orange-500 font-semibold cursor-pointer">
          Browse
        </span>
      </p>

      {/* Display Uploaded File Name */}
      {uploadedFile && (
        <p className="mt-2 text-gray-700 font-semibold">
          📄 {uploadedFile.name}
        </p>
      )}
    </div>
  );
}
