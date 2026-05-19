import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, FileImage, Film, FileText, Info } from "lucide-react";
import { base44 } from "@/api/base44Client";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime"];
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export default function EvidenceLocker({ files, onFilesChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    setError("");

    for (const file of selectedFiles) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Please upload JPG, PNG, or MP4 files only.");
        return;
      }
      if (file.size > MAX_SIZE) {
        setError("Maximum file size is 50MB.");
        return;
      }
    }

    setUploading(true);
    const newUrls = [];
    for (const file of selectedFiles) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      newUrls.push(file_url);
    }
    onFilesChange([...files, ...newUrls]);
    setUploading(false);
  };

  const removeFile = (index) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  const getFileIcon = (url) => {
    if (url.match(/\.(mp4|mov)$/i)) return Film;
    if (url.match(/\.(jpg|jpeg|png|webp)$/i)) return FileImage;
    return FileText;
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Upload className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-heading text-lg font-semibold">Evidence Locker</h3>
          <p className="text-sm text-muted-foreground">Upload screenshots, photos, or videos</p>
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/40 border border-accent mb-4">
        <Info className="w-4 h-4 text-accent-foreground mt-0.5 shrink-0" />
        <p className="text-xs text-accent-foreground">
          For your protection, all faces and personal details in your uploads will be automatically 
          anonymized before analysis.
        </p>
      </div>

      {/* Upload area */}
      <label className="flex flex-col items-center justify-center p-10 rounded-xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-muted/30 cursor-pointer transition-all">
        <Upload className="w-8 h-8 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground text-center">
          {uploading ? "Uploading..." : "Drag and drop files here or click to select"}
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">JPG, PNG, MP4 — Max 50MB each</p>
        <input
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp,.mp4,.mov"
          className="hidden"
          onChange={handleFileSelect}
          disabled={uploading}
        />
      </label>

      {error && <p className="text-sm text-destructive mt-2">{error}</p>}

      {/* File thumbnails */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          {files.map((url, i) => {
            const Icon = getFileIcon(url);
            return (
              <div key={i} className="relative group rounded-lg border border-border overflow-hidden bg-muted/30">
                {url.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                  <img src={url} alt="" className="w-full h-24 object-cover" />
                ) : (
                  <div className="w-full h-24 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFile(i)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}