import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useState } from "react"
import { FaPlus } from "react-icons/fa"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { animationDefaultOptions } from "@/lib/utils.js";
import Lottie from "react-lottie";

import { Input } from "@/components/ui/input"
import { apiClient } from "@/lib/api-client";
import { SEARCH_CONTACTS_ROUTES } from "@/utils/constants.js";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { getColor } from "@/lib/utils.js";
import { useAppStore } from "@/store/index.js";


const NewDm = () => {
    const {setSelectedChatType,
  setSelectedChatData} = useAppStore();
    const [openNewContactModel,setOpenNewContactModel] = useState(false);

  const [searchedContacts, setSearchedContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  // Example: Your existing contacts list (replace with your actual data source)
  const existingContacts = []; // e.g. from props, context, or store
        
    


   const searchContacts = async (searchTerm) => {
  setSearchTerm(searchTerm);
      try {
        if (searchTerm.length > 0) {
          const response = await apiClient.post(SEARCH_CONTACTS_ROUTES, { searchTerm }, { withCredentials: true });
          if (response.status === 200 && response.data.contacts) {
            // Mark contacts as new if not in existingContacts
            const contacts = response.data.contacts.map(contact => {
              const isExisting = existingContacts.some(c => c.id === contact.id || c._id === contact._id);
              return { ...contact, isNew: !isExisting };
            });
            setSearchedContacts(contacts);
          }
        } else {
          setSearchedContacts([]);
        }
      } catch (error) {
        console.log({ error });
      }
      }

    // Select an existing contact
    const selectExistingContact = (contact) => {
  setOpenNewContactModel(false);
  setSelectedChatType("chat");
  // Ensure _id is present for selectedChatData
  setSelectedChatData({ ...contact, _id: contact._id || contact.id });
  setSearchedContacts([]);
    }

    // Select a new contact (leads to EmptyChatContainer)
    // Select a new contact (now leads to ChatContainer)
    const selectNewContact = (contact) => {
  setOpenNewContactModel(false);
  setSelectedChatType("chat");
  // Ensure _id is present for selectedChatData
  setSelectedChatData({ ...contact, _id: contact._id || contact.id });
  setSearchedContacts([]);
    }


  return (
    <div className="text-white">
    <Tooltip>
  <TooltipTrigger>
    <FaPlus className="text-neutral-400 font-light text-opacity-90 text-small hover:text-neutral-300 cursor-pointer transition-all duration-300" onClick={()=>setOpenNewContactModel(true)}/>
  </TooltipTrigger>
  <TooltipContent className="bg-[#1c1b1e] border-none mb-2 p-3">
    <p>Add New Contact</p>
  </TooltipContent>
</Tooltip>

<Dialog
  open={openNewContactModel}
  onOpenChange={(open) => {
    setOpenNewContactModel(open);
    if (!open) {
      setSearchTerm("");
      setSearchedContacts([]);
    }
  }}
>
  
  <DialogContent className ="bg-[#181920] border-none text-white w-full max-w-[95vw] h-[90vh] max-h-[500px] flex flex-col overflow-auto p-2 sm:w-[400px] sm:h-[400px]">
    <DialogHeader>
      <DialogTitle>
        Please select a contact.
      </DialogTitle>
      <DialogDescription />
    </DialogHeader>
    <div className="flex flex-col flex-1">
      <Input aria-label="Search contacts" placeholder="Search contacts" className="rounded-lg p-6 bg-[#2c2e3b] border-none" onChange={e=>searchContacts(e.target.value)}/>
      {/* Lottie animation when not searching */}
      {searchTerm.length === 0 && (
        <div className="flex-1 flex flex-col justify-center items-center duration-1000 transition-all mt-5 md:flex md:mt-0">
          <Lottie isClickToPauseDisabled={true}
            height={100}
            width={100}
            options={animationDefaultOptions}
          />
          <div className="text-opacity-80 text-white flex flex-col gap-5 items-center mt-5 lg:text-2xl text-xl transition-all duration-300 text-center">
            <h3 className="poppins-medium">
              Hi<span className="text-purple-500">!</span> Search new <span className="text-purple-500">Contact</span>.
            </h3>
          </div>
        </div>
      )}
      {/* Search results */}
      <div className="flex-1 overflow-auto">
        {searchedContacts.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            {searchedContacts.map((contact) => (
              <div key={contact.id || contact._id}
                // If contact is new, call selectNewContact; else, call selectExistingContact
                onClick={() => contact.isNew ? selectNewContact(contact) : selectExistingContact(contact)}
                className="bg-[#23243a] rounded-lg p-3 flex items-center gap-3 hover:bg-[#2c2e3b] transition-all duration-200 cursor-pointer text-left">
                <Avatar className="h-8 w-8 rounded-full overflow-hidden">
                  {contact.image ? (
                    <AvatarImage src={contact.image} alt="Avatar" className="object-cover w-full h-full bg-black rounded-full"  />
                  ) : (
                    <AvatarFallback className="uppercase text-sm border-[1px] flex items-center justify-center bg-neutral-700 text-white">
                      {contact.firstName ? contact.firstName[0] : contact.email[0]}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="font-medium text-white text-left">{contact.firstName && contact.lastName ? `${contact.firstName} ${contact.lastName}` : ""}</span>
                <span className="text-neutral-400 text-sm">{contact.email}</span>
                {/* Optionally show a badge for new contacts */}
                {contact.isNew && <span className="ml-2 px-2 py-1 bg-purple-600 text-xs rounded">New</span>}
              </div>
            ))}
          </div>
        )}
        {/* No contacts found message */}
        {searchTerm.length > 0 && searchedContacts.length === 0 && (
          <div className="mt-4 text-center text-neutral-400">No contacts found</div>
        )}
      </div>
    </div>
  </DialogContent>
</Dialog>
</div>
  )
}

export default NewDm 
