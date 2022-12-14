import { io } from "socket.io-client";
import { apiSlice } from "../api/apiSlice";


export const messagesApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMessages: builder.query({
            query: (id) => `/messages?conversationId=${id}&_sort=timestamp&_order=desc&_page=1&_limit=10`,

            transformResponse(apiResponse, meta) {

                return {
                    data: apiResponse,
                    totalCount: meta.response.headers.get("X-Total-Count")
                }
            },
            async onCacheEntryAdded(arg, {
                updateCachedData, cacheDataLoaded, cacheEntryRemoved
            }) {
                //create socket
                const socket = io(process.env.REACT_APP_API_URL, {
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
                        console.log(data);
                        updateCachedData(draft => {
                            // console.log(JSON.stringify(draft));
                            // return draft
                            // if(!data.data.length){
                            //     return {
                            //         data:[...draft.data,data.data],
                            //         totalCount:draft.totalCount
                                    
                            //    }
                            // }
                            

                        })
                    })

                } catch (error) {

                }
                await cacheEntryRemoved;
                socket.close();
            }
        }),
        getMoreMessages: builder.query({

            query: ({ id, page }) => `/messages?conversationId=${id}&_sort=timestamp&_order=desc&_page=${page}&_limit=10`,



            async onQueryStarted({ id }, { dispatch, queryFulfilled }) {

                try {
                    const messages = await queryFulfilled;

                    if (messages?.data?.length > 0) {
                        dispatch(apiSlice.util.updateQueryData("getMessages", id.toString(), (draft) => {

                            return {
                                data: [...draft.data, ...messages.data,],
                                totalCount: draft.totalCount
                            };
                        }))
                    }

                } catch (error) {

                }
            }
        }),
        addMessage: builder.mutation({
            query: (data) => ({
                url: '/messages',
                method: 'POST',
                body: data
            }),
        }),
    })
})

export const { useGetMessagesQuery, useAddMessageMutation } = messagesApi; 