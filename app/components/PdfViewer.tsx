"use client";

import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { useSelector } from "react-redux";
import { RootState } from "@/app/redux/store";
import { useEffect, useState, useRef } from "react";
import FloatingToolbar from "./FloatingToolbar";
import SignaturePad from "react-signature-canvas";
import Image from "next/image";
import "react-toastify/dist/ReactToastify.css";
import { pdfjs } from "react-pdf";

export default function PdfViewer() {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

  const uploadedFile = useSelector(
    (state: RootState) => state.pdf.uploadedFile
  );
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<any[]>([]);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const signaturePadRef = useRef<SignaturePad | null>(null);
  const [isSigning, setIsSigning] = useState(false);

  useEffect(() => {
    if (uploadedFile) {
      const fileUrl = URL.createObjectURL(uploadedFile);
      setPdfUrl(fileUrl);
      return () => URL.revokeObjectURL(fileUrl);
    }
  }, [uploadedFile]);

  if (!pdfUrl) {
    return (
      <p className="text-center text-gray-500 mt-4">No PDF uploaded yet.</p>
    );
  }

  const handleTextSelection = (type: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const pdfViewer = document.querySelector(".rpv-core__viewer");
    if (!pdfViewer) return;

    const viewerRect = pdfViewer.getBoundingClientRect();
    const top = rect.top - viewerRect.top + pdfViewer.scrollTop;
    const left = rect.left - viewerRect.left;
    const width = rect.width;
    const height = rect.height;

    setAnnotations((prev) => [
      ...prev,
      {
        id: Date.now(),
        type,
        top,
        left,
        width,
        height,
        text: selection.toString(),
      },
    ]);
  };

  const handleAddComment = () => {
    const commentText = prompt("Enter your comment:");
    if (commentText) {
      handleTextSelection("comment");
      setAnnotations((prev) => {
        const newAnnotations = [...prev];
        newAnnotations[newAnnotations.length - 1].comment = commentText;
        return newAnnotations;
      });
    }
  };

  const handleDrawSignature = () => {
    setIsSigning(true);
  };

  const saveSignature = () => {
    if (signaturePadRef.current) {
      const signatureData = signaturePadRef.current.toDataURL("image/png");
      setAnnotations((prev) => [
        ...prev,
        { id: Date.now(), type: "signature", image: signatureData },
      ]);
      setIsSigning(false);
    }
  };

  return (
    <div className="pdf-container relative flex justify-center items-center min-h-[500px] bg-[#171717] p-4">
      <div className="bg-white shadow-xl rounded-lg p-6 w-full max-w-4xl relative">
        <h2 className="text-xl font-semibold text-gray-800 mb-5">
          📄 PDF Viewer
        </h2>
        <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm relative">
          <Worker
            workerUrl={`https://unpkg.com/pdfjs-dist@3.10.111/build/pdf.worker.min.js`}>
            <Viewer fileUrl={pdfUrl} plugins={[defaultLayoutPluginInstance]} />
          </Worker>
          {annotations.map((anno) => (
            <div
              key={anno.id}
              className={`absolute bg-yellow-300 opacity-50 pointer-events-none  ${
                anno.type === "underline" ? "h-1" : "h-full"
              }`}
              style={{
                top: anno.top,
                left: anno.left,
                width: anno.width,
                height: anno.height,
              }}>
              {anno.type === "comment" && (
                <span
                  className="absolute bg-white p-1 border text-xs shadow-md"
                  style={{ top: -20, left: 0 }}>
                  {anno.comment}
                </span>
              )}
              {anno.type === "signature" && (
                <Image
                  src={anno.image}
                  alt="Signature"
                  className="absolute max-w-full h-auto"
                  style={{ top: 0, left: 0 }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      <FloatingToolbar
        onHighlight={() => handleTextSelection("highlight")}
        onUnderline={() => handleTextSelection("underline")}
        onAddComment={handleAddComment}
        onDrawSignature={handleDrawSignature}
      />
      {isSigning && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <SignaturePad
              ref={signaturePadRef}
              penColor="black"
              canvasProps={{ className: "w-full h-40 border" }}
            />
            <button
              onClick={saveSignature}
              className="mt-2 p-2 bg-green-500 text-white rounded">
              Save Signature
            </button>
            <button
              onClick={() => setIsSigning(false)}
              className="mt-2 p-2 bg-red-500 text-white rounded">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
