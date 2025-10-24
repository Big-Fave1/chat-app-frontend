
export const createChatSlice = (set, get) => ({
  selectedChatType: undefined,
  selectedChatData: undefined,
  selectedChatMessages: [],
  directMessagesContacts: [],
  isUploading:false,
  isDownloading:false,
  fileUploadProgress:0,
  fileDownloadProgress:0,
  channels:[],
  setChannels:(channels)=> set({channels}),
  setIsUploading:(isUploading) => set({isUploading}),
  setIsDownloading:(isDownloading) => set({isDownloading}),
  setFileUploadProgress:(fileUploadProgress) => set({fileUploadProgress}),
  setFileDownloadProgress:(fileDownloadProgress) => set({fileDownloadProgress}),
  setSelectedChatType: (selectedChatType) => set({ selectedChatType }),
  setSelectedChatData: (selectedChatData) => set({ selectedChatData }),
  setSelectedChatMessages: (selectedChatMessages) => set({ selectedChatMessages }),
  setDirectMessagesContacts: (directMessagesContacts) => set({ directMessagesContacts }),
  addChannel:(channel)=> {
    const channels = get().channels;
    set({channels:[channel,...channels]});
  },
  closeChat: () =>
    set({
      selectedChatData: undefined,
      selectedChatType: undefined,
      selectedChatMessages: [],
    }),


addMessage: (message) => {
  const selectedChatMessages = Array.isArray(get().selectedChatMessages) ? get().selectedChatMessages : [];
  const selectedChatType = get().selectedChatType;
  const selectedChatData = get().selectedChatData;

  // For channels, only add if the message is for the current channel
  if (selectedChatType === 'channel' && message.channelId && selectedChatData && message.channelId !== selectedChatData._id) {
    return;
  }

  set({
    selectedChatMessages: [
      ...selectedChatMessages,
      {
        ...message,
        recipient: selectedChatType === "channel" ? message.recipient : message.recipient,
        sender: selectedChatType === "channel" ? message.sender : message.sender,
      }
    ]
  });
},
  addChannelInChannelList:(message) =>{
    const channels = get().channels;
    const data =channels.find((channel) =>channel._id === message.channelId);
    const index = channels.findIndex((channel) =>channel._id === message.channelId);

    if(index !== -1 && index!== undefined) {
      channels.splice(index,1);
      channels.unshift(data);
    }
  },

addContactsInDmContacts: (message) => {
  const userId = get().userInfo.id;
  const fromId = message.sender._id === userId 
    ? message.recipient._id
    : message.sender._id;
  const fromData = message.sender._id === userId ? message.recipient : message.sender;
  let onContacts = get().directMessagesContacts.slice();
  const index = onContacts.findIndex((contact) => contact._id === fromId);

  if (index !== -1 && index !== undefined) {
    onContacts.splice(index, 1);
  }
  onContacts.unshift(fromData);
  set({ directMessagesContacts: onContacts });
},

});
