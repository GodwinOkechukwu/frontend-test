import PdfViewer from "./components/PdfViewer";
import FileUploader from "./components/FileUploader";

export default function Home() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-xl font-bold text-center mb-4 text-white">
        PDF Annotation Tool
      </h1>
      <FileUploader />
      <div className="mt-4">
        <PdfViewer />
      </div>
    </div>
  );
}
