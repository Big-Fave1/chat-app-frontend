
import { getColor } from "@/lib/utils";
import { useAppStore } from "@/store";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { HOST } from "@/utils/constants";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { FaTrash } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";
import { useState, useContext } from "react";
import { SocketContext } from "@/context/SocketContext";

const ContactList = ({ contacts = [], isChannel = false }) => {
  const {
    selectedChatData,
    setSelectedChatData,
    setSelectedChatType,
    setSelectedChatMessages,
    channels,
    setChannels,
    userInfo
  } = useAppStore();
  const { onlineUserIds = [] } = useContext(SocketContext) || {};

  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState("");

  const handleRenameChannel = async (e, channelId) => {
    e.stopPropagation();
    if (!newName.trim()) return;
    try {
      const res = await apiClient.patch(`/api/channel/rename/${channelId}`, { name: newName }, { withCredentials: true });
      toast.success("Channel renamed");
      if (setChannels && channels) {
        setChannels(channels.map((ch) => ch._id === channelId ? { ...ch, name: newName } : ch));
      }
      setEditingId(null);
      setNewName("");
    } catch (err) {
      toast.error("Failed to rename channel");
    }
  };

  const handleEditClick = (e, contact) => {
    e.stopPropagation();
    setEditingId(contact._id);
    setNewName(contact.name);
  };

  const handleRenameInput = (e) => setNewName(e.target.value);

  const handleRenameKeyDown = (e, contact) => {
    if (e.key === "Enter") {
      handleRenameChannel(e, contact._id);
    } else if (e.key === "Escape") {
      setEditingId(null);
      setNewName("");
    }
  };
  const handleDeleteChannel = async (e, channelId) => {
    e.stopPropagation();
    try {
      await apiClient.delete(`/api/channel/delete/${channelId}`, { withCredentials: true });
      toast.success("Channel deleted");
      if (setChannels && channels) {
        setChannels(channels.filter((ch) => ch._id !== channelId));
      }
    } catch (err) {
      toast.error("Failed to delete channel");
    }
  };

  const handleClick = (contact) => {
    const type = (isChannel || contact.isChannel) ? "channel" : "contact";
    setSelectedChatType(type);
    setSelectedChatData(contact);
    // [DEBUG] removed: handleClick
  };

  if (!contacts) return null;

  return (
    <div className="mt-3 text-white text-[0.95rem]">
      {contacts.map((contact) => {
        return (
          <div
            key={contact._id}
            className={`pl-4 py-1 transition-all duration-300 cursor-pointer ${
              selectedChatData && selectedChatData._id === contact._id
                ? "bg-[#8417ff] hover:bg-[#8417ff]"
                : "hover:bg-[#f1f1f111]"
            }`}
            onClick={() => handleClick(contact)}
          >
            <div className="flex gap-3 items-center justify-start text-neutral-300 ">
              {
                !(isChannel || contact.isChannel) && (
                  <Avatar className="h-8 w-8 rounded-full overflow-hidden">
                    {contact.image ? (
                      <AvatarImage src={contact.image} alt="Avatar" className="object-cover w-full h-full bg-black" />
                    ) : (
                      <AvatarFallback className={`
                      ${selectedChatData && selectedChatData._id === contact._id ? "bg-[#ffffff22] border border-white/50":`${getColor(contact.color)}`}
                      uppercase h-8 w-8 text-xs border flex items-center justify-center text-white rounded-full ${getColor(contact.color)}`}>
                        {contact.firstName ? contact.firstName[0] : contact.email?.[0] || "#"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                )
              }
              {/* Channel profile image or # for channels */}
              {
                (isChannel || contact.isChannel) && (
                  contact.profileImage ? (
                    <img
                      src={contact.profileImage.startsWith('http') ? contact.profileImage : `${HOST}/${contact.profileImage}`}
                      alt="Channel"
                      className="h-8 w-8 rounded-full object-cover bg-black"
                    />
                  ) : (
                    <div className="bg-[#ffffff22] h-6 w-6 flex items-center justify-center rounded-full text-[10px]">#</div>
                  )
                )
              }
              <span className="truncate max-w-[120px] flex items-center gap-2">
                {/* Online dot for contacts (not channels) */}
                {!(isChannel || contact.isChannel) && onlineUserIds.includes(contact._id) && (
                  <span style={{
                    display: "inline-block",
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#22c55e",
                    marginRight: 6,
                  }} title="Online"></span>
                )}
                {(isChannel || contact.isChannel) && editingId === contact._id ? (
                  <>
                    <input
                      className="bg-transparent border-b border-white text-white px-1 w-20 outline-none"
                      value={newName}
                      autoFocus
                      onChange={handleRenameInput}
                      onKeyDown={e => handleRenameKeyDown(e, contact)}
                      onClick={e => e.stopPropagation()}
                    />
                    <button
                      className="ml-1 text-green-400 hover:text-green-600 text-base p-1 rounded"
                      title="Save"
                      onClick={e => handleRenameChannel(e, contact._id)}
                    >
                      ✓
                    </button>
                    <button
                      className="ml-1 text-gray-400 hover:text-gray-600 text-base p-1 rounded"
                      title="Cancel"
                      onClick={e => { e.stopPropagation(); setEditingId(null); setNewName(""); }}
                    >
                      ✕
                    </button>
                  </>
                ) : (isChannel || contact.isChannel) ? (
                  <>
                    {contact.name}
                    {/* Edit button for channel admin */}
                    {isChannel && contact.admin === userInfo?.id && (
                      <button
                        className="ml-2 text-blue-400 hover:text-blue-600 text-lg p-1 rounded transition-all duration-200 flex items-center justify-center"
                        title="Rename Channel"
                        onClick={e => handleEditClick(e, contact)}
                      >
                        <FaEdit />
                      </button>
                    )}
                    {/* Delete button for channel admin */}
                    {isChannel && contact.admin === userInfo?.id && (
                      <button
                        className="ml-2 text-red-400 hover:text-red-600 text-lg p-1 rounded transition-all duration-200 flex items-center justify-center"
                        title="Delete Channel"
                        onClick={e => handleDeleteChannel(e, contact._id)}
                      >
                        <FaTrash />
                      </button>
                    )}
                  </>
                ) : contact.firstName
                  ? `${contact.firstName} ${contact.lastName || ""}`
                  : contact.email}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ContactList;