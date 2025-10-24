import {create} from "zustand"
import { createAuthSlice } from "./slices/auth-slice";
import { createChatSlice } from "./slices/chat-slice";


export const useAppStore = create((set, get) => ({
  ...createAuthSlice(set, get),
  ...createChatSlice(set, get),
}));

