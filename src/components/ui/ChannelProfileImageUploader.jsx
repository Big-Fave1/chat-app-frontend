import React, { useRef } from "react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

function ChannelProfileImageUploader({ channelId, onUpload }) {
  const fileInputRef = useRef();

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = fileInputRef.current.files[0];
    if (!file) return toast.error("No file selected");
    const formData = new FormData();
    formData.append("profileImage", file);
    formData.append("channelId", channelId);

    try {
      const res = await apiClient.post(
        "/api/channel/upload-profile-image",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      if (onUpload) onUpload(res.data);
      toast.success("Channel profile image uploaded!");
    } catch (err) {
      toast.error("Upload failed");
    }
  };

  return (
    <form onSubmit={handleUpload} style={{ marginTop: 16 }}>
      <input type="file" ref={fileInputRef} accept="image/*" />
      <button type="submit">Upload Channel Image</button>
    </form>
  );
}

export default ChannelProfileImageUploader;
