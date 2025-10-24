import { useAppStore } from '@/store';
import { HOST } from '@/utils/constants';
import {createContext,useContext,useEffect,useRef, useState} from 'react';
import {io} from "socket.io-client";

export const SocketContext = createContext(null);




export const useSocket = () => {
    return useContext(SocketContext);

}

export const SocketProvider = ({children}) => {
    const socket = useRef();
    const {userInfo} = useAppStore();
    const addMessage = useAppStore(state => state.addMessage);
    const [onlineUserIds, setOnlineUserIds] = useState([]);

    useEffect(()=>{
        if(userInfo){
            socket.current = io(HOST,{
                withCredentials:true,
                query:{userId:userInfo.id},
            });

            socket.current.on("connect",()=>{
                console.log("Connected to socket server");
            });

            const handleReceiveMessage = (message)=>{
                const {selectedChatData,selectedChatType,addMessage,addContactsInDmContacts} = useAppStore.getState();
                if(selectedChatType !== undefined && (selectedChatData._id === message.sender._id || selectedChatData._id === message.recipient._id)) {
                   addMessage(message);
                }
                addContactsInDmContacts(message)
            };

            const handleReceiveChannelMessage = (message) => {
                const { selectedChatData, selectedChatType, addMessage, addChannelInChannelList } = useAppStore.getState();
                if (selectedChatType === 'channel' && selectedChatData && selectedChatData._id === message.channelId) {
                    addMessage(message);
                }
                addChannelInChannelList(message);
            };

            socket.current.on("receivedMessage",handleReceiveMessage)
            socket.current.on("recieve-channel-message",handleReceiveChannelMessage)

            // Listen for online users
            socket.current.on("update-online-users", (ids) => {
                setOnlineUserIds(ids);
            });

            // Emit user-online event
            socket.current.emit("user-online", userInfo.id);

            return ()=>{
                socket.current.disconnect();
            }
        }
    },[userInfo, addMessage])

    return (
        <SocketContext.Provider value={{socket, onlineUserIds}}>
        {children}
        </SocketContext.Provider>
    )
};