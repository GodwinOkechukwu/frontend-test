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
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Image from "next/image";

export default function PdfViewer() {
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

  const exportToPDF = async () => {
    const pdfContainer = document.querySelector(
      ".pdf-container"
    ) as HTMLElement | null;

    if (!pdfContainer) {
      console.error("PDF container not found.");
      return;
    }

    // Function to replace oklch colors
    const fixUnsupportedColors = (element: HTMLElement) => {
      const computedStyle = window.getComputedStyle(element);

      ["color", "backgroundColor", "borderColor"].forEach((styleProp) => {
        const styleValue = computedStyle.getPropertyValue(styleProp);
        if (styleValue.includes("oklch")) {
          element.style.setProperty(styleProp, "rgb(0, 0, 0)", "important"); // Convert to black
        }
      });

      if (parseFloat(computedStyle.opacity) < 0.1) {
        element.style.opacity = "1"; // Prevent transparency issues
      }
    };

    // Apply color fixes to all elements inside the PDF container
    pdfContainer
      .querySelectorAll("*")
      .forEach((el) => fixUnsupportedColors(el as HTMLElement));

    try {
      // Add a forced style override to prevent oklch usage
      const styleTag = document.createElement("style");
      styleTag.innerHTML = `
        * {
          color: rgb(0, 0, 0) !important;
          background-color: rgba(0, 0, 0, 0) !important;
          border-color: rgb(0, 0, 0) !important;
        }
      `;
      pdfContainer.appendChild(styleTag);

      // Render the PDF container to canvas
      const canvas = await html2canvas(pdfContainer, {
        useCORS: true,
        backgroundColor: "#000",
        scale: 2,
      });

      // Remove the injected style tag to restore original styles
      pdfContainer.removeChild(styleTag);

      // Convert canvas to an image
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("annotated-document.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <div className="pdf-container relative flex justify-center items-center min-h-[500px] bg-[#171717] p-4">
      <div className="bg-white shadow-xl rounded-lg p-6 w-full max-w-4xl relative">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          📄 PDF Viewer
        </h2>
        <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm relative">
          <Worker
            workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}>
            <Viewer fileUrl={pdfUrl} plugins={[defaultLayoutPluginInstance]} />
          </Worker>
          {annotations.map((anno) => (
            <div
              key={anno.id}
              className={`absolute bg-yellow-300 opacity-50 pointer-events-none ${
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
        <button
          onClick={exportToPDF}
          className="mt-4 p-2 cursor-pointer bg-blue-500 text-white rounded">
          Export PDF
        </button>
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
