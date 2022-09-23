import { io } from "socket.io-client";
import { apiSlice } from "../api/apiSlice";


export const messagesApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMessages: builder.query({
            query: (id) => `/messages?conversationId=${id}&_sort=timestamp&_order=desc&_page=1&_limit=5`,

            async onCacheEntryAdded(arg, {
                updateCachedData, cacheDataLoaded, cacheEntryRemoved
            }) {
                //create socket
                const socket = io('http://localhost:9000', {
                    reconnectionDelay: 1000,
                    reconnection: true,
                    reconnectionAttempts: 10,
                    transports: ["websocket"],
                    agent: false,
                    upgrade: false,
                    rejectUnauthorized: false
                });
                try {

                    await cacheDataLoaded;
                    socket.on("messages", (data) => {

                        updateCachedData(draft => {
                            
                            // console.log('draft1', JSON.stringify(...draft));
                            console.log(data.data);
                            draft.unshift(JSON.parse(data.data))   
                            

                        })
                    })

                } catch (error) {

                }
            }
        }),
        addMessage: builder.mutation({
            query: (data) => ({
                url: '/messages',
                method: 'POST',
                body: data
            })
        }),
    })
})

export const { useGetMessagesQuery, useAddMessageMutation } = messagesApi; 