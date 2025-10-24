import { useState, useEffect } from 'react';
import AddChannelMembers from './AddChannelMembers';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getColor } from '@/lib/utils';
import { useAppStore } from '@/store';
import {RiCloseFill} from 'react-icons/ri';
import { FaSignOutAlt } from 'react-icons/fa';
import { Avatar,AvatarFallback,AvatarImage } from '@radix-ui/react-avatar';
import { HOST } from '@/utils/constants';
import { useRef } from 'react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';


const ChatHeader = () => {
  const [addMembersOpen, setAddMembersOpen] = useState(false);
  const [allContacts, setAllContacts] = useState([]);
  const {closeChat,selectedChatData,selectedChatType,setSelectedChatData,channels,setChannels,userInfo} = useAppStore();
  useEffect(() => {
    // Only fetch contacts if admin and channel selected
    if (selectedChatType === 'channel' && userInfo && selectedChatData.admin === userInfo.id && addMembersOpen) {
      (async () => {
        try {
          const res = await apiClient.get('/api/contacts', { withCredentials: true });
          if (res.data && Array.isArray(res.data.contacts)) {
            setAllContacts(res.data.contacts.map(c => ({ label: c.name, value: c.id, ...c })));
          }
        } catch {}
      })();
    }
  }, [selectedChatType, userInfo, selectedChatData, addMembersOpen]);

  // Leave channel handler
  const handleLeaveChannel = async () => {
    if (!selectedChatData?._id) return;
    try {
      await apiClient.post(`/api/channel/leave/${selectedChatData._id}`, {}, { withCredentials: true });
      toast.success('You left the channel');
      // Remove channel from sidebar list
      if (channels && Array.isArray(channels)) {
        setChannels(channels.filter((ch) => ch._id !== selectedChatData._id));
      }
      closeChat();
    } catch (err) {
      toast.error('Failed to leave channel');
    }
  };
  const fileInputRef = useRef();

  const handleChannelImageClick = () => {
    if (selectedChatType === 'channel') {
      fileInputRef.current && fileInputRef.current.click();
    }
  };

  const handleChannelImageChange = async (e) => {
     const file = e.target.files[0];
     if (!file || !selectedChatData?._id) return;
     const formData = new FormData();
     formData.append('profileImage', file);
     formData.append('channelId', selectedChatData._id);
     try {
       const uploadRes = await apiClient.post('/api/channel/upload-profile-image', formData, {
         headers: { 'Content-Type': 'multipart/form-data' },
         withCredentials: true,
       });
       toast.success('Channel profile image updated!');
       // Update selectedChatData with new image
       if (uploadRes.data && uploadRes.data.channel) {
         setSelectedChatData(uploadRes.data.channel);
         // Update the channel in the sidebar list
         if (channels && Array.isArray(channels)) {
           const updatedChannels = channels.map((ch) =>
             ch._id === uploadRes.data.channel._id ? { ...ch, profileImage: uploadRes.data.channel.profileImage } : ch
           );
           setChannels(updatedChannels);
         }
       }
     } catch (err) {
       toast.error('Failed to upload channel image');
     }
   };
  return (
    <div className="h-[10vh] border-b-2 border-[#2f303d] flex items-center justify-between px-4 sm:px-8 md:px-20 w-full min-w-0">
      <div className="flex gap-3 sm:gap-5 items-center w-full justify-between min-w-0">
  <div className="flex gap-2 sm:gap-3 items-center justify-center min-w-0">
          <div className='h-10 w-10 sm:h-12 sm:w-12 relative'>
            {/* Clickable channel image or # for upload */}
            {selectedChatType === "contact" ? (
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden">
                {selectedChatData.image ? (
                  <AvatarImage src={selectedChatData.image} alt="Avatar" className="object-cover w-full h-full bg-black" />
                ) : (
                  <AvatarFallback className={`uppercase text-sm border-[1px] flex items-center justify-center text-white rounded-full ${getColor(selectedChatData.color)}`}>
                    {selectedChatData.firstName
                      ? selectedChatData.firstName[0]
                      : selectedChatData.email
                        ? selectedChatData.email[0]
                        : selectedChatData.name
                          ? selectedChatData.name[0]
                          : "#"}
                  </AvatarFallback>
                )}
              </Avatar>
            ) : selectedChatType === "channel" ? (
              userInfo && selectedChatData.admin === userInfo.id ? (
                selectedChatData.profileImage ? (
                  <img
                    src={selectedChatData.profileImage.startsWith('http') ? selectedChatData.profileImage : `${HOST}/${selectedChatData.profileImage}`}
                    alt="Channel"
                    className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover bg-black cursor-pointer"
                    onClick={handleChannelImageClick}
                    title="Click to change channel image"
                  />
                ) : (
                  <div
                    className="bg-[#ffffff22] h-6 w-6 flex items-center justify-center rounded-full text-[10px] cursor-pointer"
                    onClick={handleChannelImageClick}
                    title="Click to add channel image"
                  >#</div>
                )
              ) : (
                selectedChatData.profileImage ? (
                  <img
                    src={selectedChatData.profileImage.startsWith('http') ? selectedChatData.profileImage : `${HOST}/${selectedChatData.profileImage}`}
                    alt="Channel"
                    className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover bg-black"
                  />
                ) : (
                  <div
                    className="bg-[#ffffff22] h-6 w-6 flex items-center justify-center rounded-full text-[10px]"
                  >#</div>
                )
              )
            ) : null}
            {/* Hidden file input for channel image upload (admin only) */}
            {selectedChatType === "channel" && userInfo && selectedChatData.admin === userInfo.id && (
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleChannelImageChange}
              />
            )}
          </div>
          <div className="text-white flex items-center gap-2">
            {selectedChatType === "channel" && selectedChatData.name}
            {/* Add Members button for channel admin */}
            {selectedChatType === "channel" && userInfo && selectedChatData.admin === userInfo.id && (
              <>
                <button
                  className="ml-2 text-green-400 hover:text-green-600 text-lg p-1 rounded transition-all duration-200 flex items-center justify-center"
                  title="Add Members"
                  onClick={() => setAddMembersOpen(true)}
                >
                  +
                </button>
                <Dialog open={addMembersOpen} onOpenChange={setAddMembersOpen}>
                  <DialogContent className="bg-[#181920] border-none text-white w-full max-w-[95vw] max-h-[500px] flex flex-col overflow-auto p-2 sm:w-[400px]">
                    <DialogHeader>
                      <DialogTitle>Add Members to Channel</DialogTitle>
                    </DialogHeader>
                    <AddChannelMembers
                      channelId={selectedChatData._id}
                      allContacts={allContacts}
                      existingMemberIds={selectedChatData.members?.map(m => m._id || m.id) || []}
                      onMembersAdded={() => setAddMembersOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </>
            )}
            {/* Show exit button for non-admin channel members */}
            {selectedChatType === "channel" && userInfo && selectedChatData.admin !== userInfo.id && (
              <button
                className="ml-2 text-red-400 hover:text-red-600 text-lg p-1 rounded transition-all duration-200 flex items-center justify-center"
                title="Leave Channel"
                onClick={handleLeaveChannel}
              >
                <FaSignOutAlt />
              </button>
            )}
            {selectedChatType === "contact" && selectedChatData.firstName
              ? `${selectedChatData.firstName} ${selectedChatData.lastName}`
              : selectedChatType === "chat" && selectedChatData.name
                ? selectedChatData.name
                : selectedChatData.email || ""}
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 sm:gap-5 flex-shrink-0">
          <button
            className="text-neutral-500 hover:text-white focus:border-none focus:outline-none focus:text-white duration-300 transition-all p-1 sm:p-2"
            onClick={closeChat}
            style={{ minWidth: 0 }}
          >
            <RiCloseFill className="text-2xl sm:text-3xl" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatHeader
