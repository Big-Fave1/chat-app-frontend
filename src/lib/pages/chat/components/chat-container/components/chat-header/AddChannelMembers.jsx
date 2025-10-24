import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { useAppStore } from "@/store";
import MultipleSelector from "@/components/ui/multipleselect";
import { Button } from "@/components/ui/button";

const AddChannelMembers = ({ channelId, onMembersAdded, allContacts, existingMemberIds }) => {
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { setSelectedChatData, setChannels, channels } = useAppStore();

  const handleAddMembers = async () => {
    if (!selectedContacts.length) return;
    setLoading(true);
    try {
      const newMemberIds = selectedContacts.map((c) => c.value);
      const res = await apiClient.post(`/api/channel/${channelId}/add-members`, { newMembers: newMemberIds }, { withCredentials: true });
      if (res.data && res.data.channel) {
        setSelectedChatData(res.data.channel);
        // Update channel in sidebar
        if (channels && Array.isArray(channels)) {
          const updatedChannels = channels.map((ch) =>
            ch._id === res.data.channel._id ? res.data.channel : ch
          );
          setChannels(updatedChannels);
        }
        if (onMembersAdded) onMembersAdded(res.data.channel);
        setSelectedContacts([]);
      }
    } catch (err) {
      // Optionally show error
    } finally {
      setLoading(false);
    }
  };

  // Filter out already-added members
  const contactOptions = allContacts.filter(c => !existingMemberIds.includes(c.value));

  return (
    <div className="flex flex-col gap-2">
      <MultipleSelector
        className="rounded-lg bg-[#2c2e3b] border-none py-2 text-white"
        defaultOptions={contactOptions}
        placeholder="Add Members"
        value={selectedContacts}
        onChange={setSelectedContacts}
        emptyIndicator={<p className="text-center text-md leading-4 text-gray-600">No Results Found</p>}
      />
      <Button className="w-full bg-purple-700 hover:bg-purple-900" onClick={handleAddMembers} disabled={loading || !selectedContacts.length}>
        {loading ? "Adding..." : "Add Members"}
      </Button>
    </div>
  );
};

export default AddChannelMembers;
