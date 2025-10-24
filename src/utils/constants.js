// Backend host for API and sockets. Set via VITE_SERVER_URL in the client .env
export const HOST = import.meta.env.VITE_SERVER_URL;

export const AUTH_ROUTES = "api/auth";
export const SIGNUP_ROUTES = `${AUTH_ROUTES}/signup`;
export const LOGIN_ROUTES = `${AUTH_ROUTES}/login`;
export const GET_USER_INFO = `${AUTH_ROUTES}/userInfo`;
export const UPDATE_PROFILE_ROUTES =  `${AUTH_ROUTES}/update-profile`;
export const ADD_PROFILE_IMAGE = `${AUTH_ROUTES}/add-profile-image`;
export const REMOVE_PROFILE_IMAGE_ROUTES = `${AUTH_ROUTES}/remove-profile-image`;
export const LOGOUT_ROUTES = `${AUTH_ROUTES}/logout`;

export const CONTACT_ROUTES = "api/contacts";
export const SEARCH_CONTACTS_ROUTES = `${CONTACT_ROUTES}/search`;
export const GET_DM_CONTACTS_ROUTES =`${CONTACT_ROUTES}/get-contacts-for-dm`
export const GET_ALL_CONTACTS_ROUTES =`${CONTACT_ROUTES}/get-all-contacts`


export const MESSAGE_ROUTES = "api/messages";
export const GET_ALL_MESSAGES_ROUTES = `${MESSAGE_ROUTES}/getMessages`;
export const UPLOAD_FILE_ROUTES = `${MESSAGE_ROUTES}/upload-file`;


export const CHANNEL_ROUTES = "api/channel";
export const CREATE_CHANNEL_ROUTE = `${CHANNEL_ROUTES}/create-channel`;
export const GET_USER_CHANNELS_ROUTE = `${CHANNEL_ROUTES}/get-user-channels`;
export const GET_CHANNEL_MESSAGES_ROUTE = `${CHANNEL_ROUTES}/get-channel-messages`;