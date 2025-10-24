import React, { useEffect, useRef, useState } from 'react'
import {GrAttachment} from "react-icons/gr";
import { RiEmojiStickerLine } from 'react-icons/ri';
import { IoSend } from 'react-icons/io5';
import EmojiPicker from 'emoji-picker-react';
import { useAppStore } from '@/store';
import { useSocket } from '@/context/SocketContext';
import { HOST, UPLOAD_FILE_ROUTES } from '@/utils/constants';
import { apiClient } from '@/lib/api-client';


const MessageBar = () => {
  const emojiRef = useRef(null);
  const fileInputRef = useRef(null);
  const {selectedChatType,selectedChatData,userInfo,setIsUploading,setFileUploadProgress} = useAppStore();
  const { socket } = useSocket();
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  // Handle file input click


  const handleAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null; // Reset so same file can be selected again
      fileInputRef.current.click();
    }
  };

  // Handle file selection
  const handleFileChange = async (e) => { try {
    const file = e.target.files && e.target.files[0];
    if (file) {
  const formData = new FormData();
      formData.append("file",file);
      setIsUploading(true);
      const response = await apiClient.post(UPLOAD_FILE_ROUTES,formData,{withCredentials:true,
        onUploadProgress:data=>{
         setFileUploadProgress(Math.round((100 * data.loaded) / data.total));
      }
      });

      if(response.status === 200 && response.data){
        setIsUploading(false);

        if(selectedChatType === "contact" && socket.current){
        socket.current.emit("sendMessage", {
        sender: userInfo.id,
        content: undefined,
        recipient: selectedChatData._id,
        messageType: "file",
        fileUrl: response.data.filePath,
      });
      }else if(selectedChatType === "channel" && socket.current){
        socket.current.emit("send-channel-message",{
         sender: userInfo.id,
        content: undefined,
        messageType: "file",
        fileUrl: response.data.filePath,
        channelId:selectedChatData._id,
      });
      }
    }
    }
    console.log({file});
    }catch(error) {
      setIsUploading(false);
      console.log({error});
    }
  };

  // Send file message (stub: replace with upload logic as needed)
  const handleSendFileMessage = async (file) => {
  if (!socket.current || !userInfo || !userInfo.id || !selectedChatData) return;
    // TODO: Replace with actual upload logic (e.g., upload to server, get URL)
    // For now, just log and send a dummy file message
    console.log("Selected file:", file);
    // Example: send file name as content, set messageType to 'file'
    socket.current.emit("sendMessage", {
      sender: userInfo.id,
      content: file.name,
      recipient: selectedChatData._id,
      messageType: "file",
      fileUrl: undefined, // Replace with uploaded file URL
    });
    setSelectedFile(null);
  };

  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setEmojiPickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  },[emojiRef])

const handleAddEmoji = (emoji) => {
        setMessage(message => message + emoji.emoji)
      }

  const handleSendMessage = async () => {
        console.log("handleSendMessage called", { message, selectedChatType, socket, selectedChatData });
        console.log("DEBUG: userInfo", userInfo);
          console.log("DEBUG: userInfo.id", userInfo && userInfo.id);
        if (!socket.current) {
          console.warn("Socket instance is undefined");
          return;
        }
          if (!userInfo || !userInfo.id) {
            console.warn("Cannot send message: userInfo or userInfo.id is missing.");
          return;
        }
        console.log("Socket server URL:", HOST, "Socket connected:", socket.current?.connected);
    if((selectedChatType === "contact" || selectedChatType === "chat") && socket.current?.connected && message.trim()){
      socket.current.emit("sendMessage", {
        sender: userInfo.id,
        content: message,
        recipient: selectedChatData._id,
        messageType: "text",
        fileUrl: undefined,
      });
      setMessage("");
    } else if (selectedChatType === "channel" && socket.current?.connected && message.trim()) {
      socket.current.emit("send-channel-message",{
         sender: userInfo.id,
        content: message,
        messageType: "text",
        fileUrl: undefined,
        channelId:selectedChatData._id,
      });
      setMessage("");
    }
  };

  return (
    <div className="text-white bg-[#1c1d25] flex flex-wrap items-center justify-between px-2 sm:px-8 mb-5 gap-2 sm:gap-6 w-full">
      <div className="flex-1 flex bg-[#2a2b33] rounded-md items-center gap-2 sm:gap-5 pr-2 sm:pr-5 min-w-0 flex-nowrap">
        <input
          type="text"
          className="flex-1 min-w-0 bg-transparent focus:outline-none text-white p-5 rounded-md focus:border-none"
          placeholder="Enter Message"
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
        {/* Hidden file input for attachments */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <button
          className="text-neutral-500 hover:text-white focus:border-none focus:outline-none focus:text-white duration-300 transition-all min-w-[40px]"
          style={{ flexShrink: 0 }}
          type="button"
          onClick={handleAttachmentClick}
        >
          <GrAttachment className="text-2xl" />
        </button>
        <div className="relative min-w-[40px]" style={{ flexShrink: 0 }}>
          <button
            className="text-neutral-500 hover:text-white focus:border-none focus:outline-none focus:text-white duration-300 transition-all min-w-[40px]"
            onClick={() => setEmojiPickerOpen(true)}
            type="button"
          >
            <RiEmojiStickerLine className="text-2xl" />
          </button>
          <div className="absolute bottom-16 right-0" ref={emojiRef}>
            <EmojiPicker
              theme="dark"
              open={emojiPickerOpen}
              onEmojiClick={handleAddEmoji}
              autoFocusSearch={false}
            />
          </div>
        </div>
        <button
          className="bg-[#8417ff] rounded-md flex items-center justify-center p-2 sm:p-3 hover:text-white focus:border-none hover:bg-[#741bda] focus:bg-[#741bda] focus:outline-none focus:text-white duration-300 transition-all min-w-[36px] min-h-[36px]"
          style={{ flexShrink: 0 }}
          onClick={handleSendMessage}
          type="button"
        >
          <IoSend className="text-xl" />
        </button>
      </div>
    </div>
  );
}

export default MessageBar
