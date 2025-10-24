
import { useAppStore } from "@/store";
import { useRef, useEffect, useState } from "react";
import moment from "moment";
import { apiClient } from "@/lib/api-client";
import { GET_ALL_MESSAGES_ROUTES, GET_CHANNEL_MESSAGES_ROUTE, HOST } from "@/utils/constants";
import { MdFolderZip } from "react-icons/md";
import { IoMdArrowRoundDown } from "react-icons/io";
import { IoCloseSharp } from "react-icons/io5";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { getColor } from "@/lib/utils";



const MessageContainer = () => {
  const scrollRef = useRef();
  const { selectedChatType, selectedChatData, userInfo, selectedChatMessages, setSelectedChatMessages, setIsDownloading, setFileDownloadProgress, isDownloading, fileDownloadProgress } = useAppStore();

  // Scroll to the last message when messages or chat change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [selectedChatMessages, selectedChatType, selectedChatData && selectedChatData._id]);


  // Utility functions for file type checks
  const checkIfImage = (filePath) => {
    return /\.(jpg|jpeg|png|gif|tif|ico|svg|webp|heic)$/i.test(filePath);
  };
  const checkIfPDF = (filePath) => {
    return /\.pdf$/i.test(filePath);
  };

  // Download file utility for file messages
  const downloadFile = async (url) => {
    setIsDownloading(true);
    setFileDownloadProgress(0);
    try {
      const response = await apiClient.get(`${HOST}/${url}`, {
        responseType: "blob",
        onDownloadProgress: (ProgressEvent) => {
          const { loaded, total } = ProgressEvent;
          const percentCompleted = Math.round((loaded * 100) / total);
          setFileDownloadProgress(percentCompleted);
        },
      });
      const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = urlBlob;
      link.setAttribute("download", url.split("/").pop());
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(urlBlob);
      setTimeout(() => {
        setIsDownloading(false);
        setFileDownloadProgress(0);
      }, 1000);
    } catch (error) {
      setIsDownloading(false);
      setFileDownloadProgress(0);
    }
  };

  const [showImage, setShowImage] = useState(false);
  const [imageURL, setimageURL] = useState(null);



  // Fetch previous messages when a contact or channel is selected
  useEffect(() => {
  // [DEBUG] removed: useEffect triggered for messages
    const fetchMessages = async () => {
      if (!selectedChatData || !selectedChatData._id) return;
      try {
        if (selectedChatType === "channel") {
          const response = await apiClient.get(`${GET_CHANNEL_MESSAGES_ROUTE}/${selectedChatData._id}`, { withCredentials: true });
          if (response.status === 200 && response.data.messages) {
            // Always set messages from backend response only
            setSelectedChatMessages(response.data.messages);
          } else {
            setSelectedChatMessages([]);
          }
        } else if (selectedChatType === "contact" || selectedChatType === "chat") {
          const response = await apiClient.post(GET_ALL_MESSAGES_ROUTES, { id: selectedChatData._id }, { withCredentials: true });
          console.log('[DEBUG] API response for contact messages:', response.data);
          if (response.status === 200 && response.data.messages) {
            setSelectedChatMessages(response.data.messages);
          } else {
            setSelectedChatMessages([]);
          }
        }
      } catch (error) {
        setSelectedChatMessages([]);
      }
    };
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChatType, selectedChatData && selectedChatData._id]);




  const renderDMMessages = (message) => {
    let senderId = message.sender;
    if (message.sender && typeof message.sender === 'object') {
      senderId = message.sender._id || message.sender.id;
    }
    return (
      <div className={`${senderId === userInfo.id ? "text-right" : "text-left text-white"}`}> 
        {message.messageType === "text" ? (
          <div
            className={
              (senderId === userInfo.id
                ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
                : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20") +
              " border inline-block p-4 rounded my-1 max-w-[50%] break-words"
            }
          >
            {/* Fallback for missing content */}
            {typeof message.content === 'string' && message.content.trim() !== ''
              ? message.content
              : <span className="text-red-400">[No content]</span>}
          </div>
        ) : message.messageType === "file" && message.fileUrl ? (
          checkIfImage(message.fileUrl) ? (
            <div
              className={
                (senderId === userInfo.id
                  ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
                  : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20") +
                " border inline-block p-4 rounded my-1 max-w-[50%] break-words"
              }
            >
              <div className="cursor-pointer"onClick={()=>{
                setShowImage(true);
                setimageURL(message.fileUrl);
              }}>
                <img
                  src={message.fileUrl.startsWith('http') ? message.fileUrl : `${HOST}/${message.fileUrl}`}
                  alt={message.content || 'file'}
                  className="max-w-full max-h-60 rounded"
                />
              </div>
            </div>
          ) : checkIfPDF(message.fileUrl) ? (
            <div
              className={
                (senderId === userInfo.id
                  ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
                  : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20") +
                " border inline-flex items-center gap-2 p-4 rounded my-1 max-w-[50%] break-words"
              }
            >
              <a
                href={message.fileUrl.startsWith('http') ? message.fileUrl : `${HOST}/${message.fileUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-400 break-all flex items-center gap-1"
                title="Open PDF in new tab"
              >
                <span className="truncate max-w-[120px]">{message.fileUrl.split('/').pop()}</span>
              </a>
            </div>
          ) : (
            <div className={
                (senderId === userInfo.id
                  ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
                  : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20") +
                " border inline-flex items-center gap-2 p-4 rounded my-1 max-w-[50%] break-words"
              }>
              <span className="text-2xl bg-black/20 rounded-full p-2 flex items-center justify-center">
                <MdFolderZip />
              </span>
              <span className="truncate max-w-[120px]">{message.fileUrl.split('/').pop()}</span>
              <button
                className="bg-black/20 p-2 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300 flex items-center justify-center"
                title="Download file"
                onClick={() => downloadFile(message.fileUrl)}
              >
                <IoMdArrowRoundDown />
              </button>
            </div>
          )
        ) : null}
        <div className="text-xs text-gray-600">
          {moment(message.timestamp).format("LT")}
        </div>
      </div>
    );
  };


  // Helper to get senderId regardless of object or string
  const getSenderId = (sender) => typeof sender === "object" ? sender._id || sender.id : sender;

  const renderChannelMessages = (message) => {
    const senderId = getSenderId(message.sender);
    return (
      <div className={`mt-5 ${senderId !== userInfo.id ? "text-left" : "text-right"}`}>
        {message.messageType === "text" && (
          <div
            className={`${
              senderId === userInfo.id
                ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
                : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
            } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
          >
            {message.content}
          </div>
        )}

        {message.messageType === "file" && (
          <div
            className={`${
              senderId === userInfo.id
                ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
                : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
            } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
          >
            {checkIfImage(message.fileUrl) ? (
              <div
                className="cursor-pointer"
                onClick={() => {
                  setShowImage(true);
                  setimageURL(message.fileUrl);
                }}
              >
                <img
                  src={message.fileUrl.startsWith('http') ? message.fileUrl : `${HOST}/${message.fileUrl}`}
                  height={300}
                  width={300}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <span className="text-white/8 text-3xl bg-black/20 rounded-full p-1">
                  <MdFolderZip />
                </span>
                <span>{message.fileUrl.split("/").pop()}</span>
                <span className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300">
                  <IoMdArrowRoundDown />
                </span>
              </div>
            )}
          </div>
        )}

        {senderId !== userInfo.id ? (
          <div className="flex items-center justify-start gap-3">
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 rounded-full overflow-hidden">
              {message.sender && typeof message.sender === 'object' && message.sender.image && (
                <AvatarImage src={message.sender.image} alt="Avatar" className="object-cover w-full h-full bg-black" />
              )}
              <AvatarFallback className={`uppercase h-8 w-8 text-sm flex items-center justify-center text-white rounded-full ${getColor(message.color)}`}>
                {message.sender && typeof message.sender === 'object' && message.sender.firstName
                  ? message.sender.firstName.split("").shift()
                  : message.sender && typeof message.sender === 'object' && message.sender.email
                    ? message.sender.email.split("").shift()
                    : "?"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-white/60">{message.sender && typeof message.sender === 'object' ? `${message.sender.firstName} ${message.sender.lastName}` : "Unknown"}</span>
            <span className="text-xs text-white/60">{
              moment(message.timestamp).format("LT")
            } </span>
          </div>
        ) : (
          <div className="text-xs text-white/60 mt-1">{
            moment(message.timestamp).format("LT")
          }</div>
        )}
      </div>
    );
  };

  const renderMessages = () => {
    let lastDate = null;
  // [DEBUG] removed: selectedChatMessages in renderMessages
    // Extra debug: print after every render
    // [DEBUG] removed: MessageContainer useEffect: selectedChatMessages changed
    if (!Array.isArray(selectedChatMessages) || selectedChatMessages.length === 0) {
      return (
        <div className="text-center text-gray-400 my-8">
          No messages yet. Start the conversation!
        </div>
      );
    }
    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.timestamp).format('MMMM Do, YYYY');
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;
      const isLast = index === selectedChatMessages.length - 1;
      return (
        <div key={message._id || index} ref={isLast ? scrollRef : undefined}>
          {showDate && (
            <div className="text-center text-gray-500 my-2">
              {moment(message.timestamp).format("LL")}
            </div>
          )}
          {/* Render for contact, chat, or channel types only */}
          {selectedChatType === "contact" || selectedChatType === "chat"
            ? renderDMMessages(message)
            : selectedChatType === "channel"
              ? renderChannelMessages(message)
              : <span className="text-red-400">[Unknown chat type]</span>}
        </div>
      );
    });
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hidden p-2 sm:p-4 sm:px-8 w-full max-w-[100vw] min-h-0 min-w-0 text-white" style={{boxSizing: 'border-box'}}>
      {/* Download Progress Bar */}
      {isDownloading && (
        <div className="w-full flex items-center justify-center mb-2">
          <div className="bg-gray-700 rounded h-3 w-1/2 sm:w-1/4 max-w-[120px] flex items-center relative overflow-hidden">
            <div
              className="bg-[#8417ff] h-3 transition-all duration-200"
              style={{ width: `${fileDownloadProgress}%` }}
            />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-semibold" style={{ color: '#fff', display: 'block' }}>
              {fileDownloadProgress}%
            </span>
          </div>
        </div>
      )}
      {renderMessages()}
  {/* scrollRef is now attached to the last message */}

      {
        showImage && <div className="fixed z-[1000] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center backdrop-blur-lg flex-col ">
          <div>
            <img src={`${HOST}/${imageURL}`}
            className="h-[80vh] w-full bg-cover"
            />
          </div>
          <div className="flex gap-5 fixed top-0 mt-5">
            <button
            className="bg-black/20 p-2 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300 flex items-center justify-center"
                title="Download file"
                onClick={() => downloadFile(imageURL)} 
            > 
              <IoMdArrowRoundDown/>
            </button>

            <button
            className="bg-black/20 p-2 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300 flex items-center justify-center"
                title="Download file"
                onClick={()=>{
                  setShowImage(false);
                  setimageURL(null)
                }} 
            > 
              <IoCloseSharp/>
            </button>
          </div>
        </div>
      }
    </div>
  );
};

export default MessageContainer;
