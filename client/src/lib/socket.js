import { io } from "socket.io-client";

let socket = null;

export const getSocket = () => {
    if (!socket) {
        socket = io("/", {
            withCredentials: true,
            autoConnect: false,
        });
    }
    return socket;
};

export const connectSocket = () => {
    const s = getSocket();
    if (!s.connected) {
        s.connect();
    }
    return s;
};

export const disconnectSocket = () => {
    if (socket && socket.connected) {
        socket.disconnect();
    }
};

export const joinRoom = (communityId) => {
    const s = getSocket();
    if (s.connected) {
        s.emit("join-room", communityId);
    }
};

export const leaveRoom = (communityId) => {
    const s = getSocket();
    if (s.connected) {
        s.emit("leave-room", communityId);
    }
};

export const sendMessage = (communityId, text) => {
    const s = getSocket();
    if (s.connected) {
        s.emit("send-message", { communityId, text });
    }
};

export const emitTyping = (communityId) => {
    const s = getSocket();
    if (s.connected) {
        s.emit("typing", communityId);
    }
};

export const emitStopTyping = (communityId) => {
    const s = getSocket();
    if (s.connected) {
        s.emit("stop-typing", communityId);
    }
};
