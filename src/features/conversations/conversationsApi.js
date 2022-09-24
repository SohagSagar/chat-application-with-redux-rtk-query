import { io } from "socket.io-client";
import { apiSlice } from "../api/apiSlice";
import { messagesApi } from "../messages/messagesApi";


export const conversationsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getConversations: builder.query({
            query: (email) => `/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=1&_limit=10`,
            providesTags: ['conversations'],
            transformResponse(apiResponse, meta) {
                const totalCount = meta.response.headers.get("X-Total-Count");
                return {
                    data: apiResponse,
                    totalCount,
                }
            },
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
                    socket.on("conversation", (data) => {
                        updateCachedData(draft => {

                            const conversation = draft.data.find(c => c.id == data?.data?.id);
                            if (conversation?.id) {
                                conversation.message = data.data.message;
                                conversation.timestamp = data.data.timestamp;
                            }

                        })
                    })

                } catch (error) {
                    console.log(error);

                }
                await cacheEntryRemoved;
                socket.close();
            }
        }),
        getMoreConversations: builder.query({

            query: ({ email, page }) => `/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=${page}&_limit=5`,

            async onQueryStarted({ email }, { dispatch, queryFulfilled }) {
                //passimistic conversations cache update

                try {
                    const conversations = await queryFulfilled;
                    if (conversations.data.length > 0) {

                        dispatch(apiSlice.util.updateQueryData("getConversations", email, (draft) => {
                            return {
                                data: [...draft.data, ...conversations.data],
                                totalCount: draft.totalCount
                            };
                        }))
                    }

                } catch (error) {

                }

            }

        }),
        getConversation: builder.query({
            query: ({ userEmail, participantEmail }) => `/conversations?participants_like=${userEmail}-${participantEmail}&participants_like=${participantEmail}-${userEmail}`
        }),
        addConversation: builder.mutation({
            query: ({ sender, data }) => ({
                url: '/conversations',
                method: 'POST',
                body: data,

            }),
            
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {

                //passimistic cache update
                const conversation = await queryFulfilled;
                const senderEmail = await arg.sender.email;

                dispatch(apiSlice.util.updateQueryData('getConversations', senderEmail, (draft) => {
                    return {
                        data: [...draft.data, conversation.data].reverse()
                    }
                }))

               
                try {
                    if (conversation?.data?.id) {
                        const sender = arg.sender;
                        const receiverWholeObject = arg.data.users.find(user => user.email !== sender.email);
                        const receiver = {
                            email: receiverWholeObject.email,
                            id: receiverWholeObject.id,
                            name: receiverWholeObject.name
                        }
                        console.log(receiver);

                        dispatch(messagesApi.endpoints.addMessage.initiate({

                            conversationId: conversation?.data?.id,
                            sender,
                            receiver,
                            message: arg.data.message,
                            timestamp: arg.data.timestamp

                        }))


                    }
                } catch (error) {
                    console.log('in catch');

                }



            }
        }),

        editConversation: builder.mutation({
            query: ({ id, data, sender }) => ({
                url: `/conversations/${id}`,
                method: 'PATCH',
                body: data
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {

                //optimistic cache update
                const optimicUpdateForEditConversation =
                    dispatch(apiSlice.util.updateQueryData("getConversations", arg.sender.email, (draft) => {

                        const draftEditConversation = draft.data.find(c => c.id == arg.id);
                        draftEditConversation.message = arg.data.message;
                        draftEditConversation.timestamp = arg.data.timestamp;

                    }))

                try {
                    const conversation = await queryFulfilled;
                    if (conversation?.data?.id) {
                        const sender = arg.sender;
                        const receiverWholeObject = arg.data.users.find(user => user.email !== sender.email);
                        const receiver = {
                            email: receiverWholeObject.email,
                            id: receiverWholeObject.id,
                            name: receiverWholeObject.name
                        }

                        const res = await dispatch(messagesApi.endpoints.addMessage.initiate({
                            

                            conversationId: conversation?.data?.id,
                            sender,
                            receiver,
                            message: arg.data.message,
                            timestamp: arg.data.timestamp

                        })).unwrap();

                        //passimistic cache update
                        dispatch(apiSlice.util.updateQueryData("getMessages", res.conversationId.toString(), (draft) => {

                            return {
                                data:[res,...draft.data],
                                totalCount:draft.totalCount
                            }
                        }))

                    }

                } catch (error) {
                    // optimicUpdateForEditConversation.undo()
                }

            }
        }),
    })
})

export const { useGetConversationsQuery, useGetConversationQuery, useAddConversationMutation, useEditConversationMutation, useGetMoreConversationsQuery } = conversationsApi; 