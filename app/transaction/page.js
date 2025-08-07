"use client";
import { useState } from "react";
import Tran from "@/components/transaction";
import { RefreshCw, UploadCloud } from "lucide-react";

export default function SignInPage() {
  const [showTran, setShowTran] = useState(false);

  const handleRefreshEmails = () => {
    // Open the backend OAuth URL
     window.open("http://localhost:3001/auth/google", "_self");
  };

  const handleUploadClick = () => {
    setShowTran((prev) => !prev);
  };

  return (
    <div className="relative min-h-screen p-4">
      {/* Top-right Upload Button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={handleUploadClick}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded shadow"
        >
          <UploadCloud className="w-5 h-5" />
          {showTran ? "Close" : "Upload"}
        </button>
      </div>

      {/* Refresh Emails Button triggers OAuth */}
      <button
        onClick={handleRefreshEmails}
        className="mb-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded"
      >
        <RefreshCw className="w-5 h-5" />
        Refresh Emails
      </button>

      {/* Show Tran if toggled */}
      {showTran && (
        <div className="mt-4">
          <Tran />
        </div>
      )}
    </div>
  );
}
