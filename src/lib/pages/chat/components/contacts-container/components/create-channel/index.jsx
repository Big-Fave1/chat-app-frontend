import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useEffect, useState } from "react"
import { FaPlus } from "react-icons/fa"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { apiClient } from "@/lib/api-client";
import { CREATE_CHANNEL_ROUTE, GET_ALL_CONTACTS_ROUTES } from "@/utils/constants.js";
import {Button} from "@/components/ui/button.jsx";
import MultipleSelector from "@/components/ui/multipleselect";
import { useAppStore } from "@/store"

const CreateChannel = () => {
  const {setSelectedChatType, setSelectedChatData,addChannel,}= useAppStore();
  const [newChannelModel,setNewChannelModel] = useState(false);
  const [allContacts, setAllContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [channelName, setChannelName] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);

  useEffect(() => {
  const getData = async () => {
    const response = await apiClient.get(GET_ALL_CONTACTS_ROUTES, { withCredentials: true });
    const contacts = response.data.contacts.map(c => ({
      label: c.name, // or c.username, adjust as needed
      value: c.id,   // or c._id, adjust as needed
      ...c
    }));
    setAllContacts(contacts);
    console.log("Fetched contacts:", contacts);
  };
  getData();
}, []);


const createChannel = async () => {
  try {
    if (channelName.length > 0 && selectedContacts.length > 0) {
      const response = await apiClient.post(CREATE_CHANNEL_ROUTE, {
        name: channelName,
        members: selectedContacts.map((contact) => contact.value),
      }, { withCredentials: true });
      if (response.status === 201) {
        // If a profile image is selected, upload it
        if (profileImageFile) {
          const formData = new FormData();
          formData.append("profileImage", profileImageFile);
          formData.append("channelId", response.data.channel._id);
          try {
            await apiClient.post("/api/channel/upload-profile-image", formData, {
              headers: { "Content-Type": "multipart/form-data" },
              withCredentials: true,
            });
          } catch (err) {
            // Optionally handle upload error
          }
        }
        setChannelName("");
        setSelectedContacts([]);
        setProfileImageFile(null);
        setNewChannelModel(false);
        addChannel(response.data.channel);
      }
    }
  } catch (error) {
    console.log({ error });
  }
};
    



  return (
    <div className="text-white">
    <Tooltip>
  <TooltipTrigger>
    <FaPlus className="text-neutral-400 font-light text-opacity-90 text-small hover:text-neutral-300 cursor-pointer transition-all duration-300" onClick={()=>setNewChannelModel(true)}/>
  </TooltipTrigger>
  <TooltipContent className="bg-[#1c1b1e] border-none mb-2 p-3">
    <p>Create New Channel</p>
  </TooltipContent>
</Tooltip>

<Dialog
  open={newChannelModel}
  onOpenChange={setNewChannelModel}
>
  
  <DialogContent className ="bg-[#181920] border-none text-white w-full max-w-[95vw] h-[90vh] max-h-[500px] flex flex-col overflow-auto p-2 sm:w-[400px] sm:h-[400px]">
    <DialogHeader>
      <DialogTitle className="text-md">
        Please Fill Up The Details For New Channel.
      </DialogTitle>
      <DialogDescription />
    </DialogHeader>

    <div className="flex flex-col flex-1 gap-2">
      <Input aria-label="Search contacts" placeholder="Channel Name" className="rounded-lg p-6 bg-[#2c2e3b] border-none" onChange={e=>setChannelName(e.target.value)} value={channelName} />
      <input
        type="file"
        accept="image/*"
        onChange={e => setProfileImageFile(e.target.files[0])}
        className="hidden"
      />
    </div>

<div>
<MultipleSelector
className="rounded-lg bg-[#2c2e3b] border-none py-2 text-white "
defaultOptions={allContacts}
placeholder="Search Contacts"
value={selectedContacts}
onChange={setSelectedContacts}
emptyIndicator={ <p className="text-center text-md leading-4 text-gray-600">No Results Found</p>}
/>
</div>

  <div>
    <Button className="w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300" onClick={createChannel}>
    Create Channel
    </Button>
  </div>
  </DialogContent>
</Dialog>
</div>
  );
};

export default CreateChannel;
