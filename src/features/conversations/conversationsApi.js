import { apiSlice } from "../api/apiSlice";
import { messagesApi } from "../messages/messagesApi";


export const conversationsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getConversations: builder.query({
            query: (email) => `/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=1&_limit=5`
        }),
        getConversation: builder.query({
            query: ({ userEmail, participantEmail }) => `/conversations?participants_like=${userEmail}-${participantEmail}&participants_like=${participantEmail}-${userEmail}`
        }),
        addConversation: builder.mutation({
            query: ({ sender, data }) => ({
                url: '/conversations',
                method: 'POST',
                body: data
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                const conversation = await queryFulfilled;

                if (conversation?.data?.id) {
                    const sender = arg.sender;
                    const receiverWholeObject = arg.data.users.find(user => user.email !== sender.email);
                    const receiver = {
                        email: receiverWholeObject.email,
                        id: receiverWholeObject.id,
                        name: receiverWholeObject.name
                    }

                    dispatch(messagesApi.endpoints.addMessage.initiate({

                        conversationId: conversation?.data?.id,
                        sender,
                        receiver,
                        message: arg.data.message,
                        timestamp: arg.data.timestamp

                    }))
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
                const conversation = await queryFulfilled;

                if (conversation?.data?.id) {
                    const sender = arg.sender;
                    const receiverWholeObject = arg.data.users.find(user => user.email !== sender.email);
                    const receiver = {
                        email: receiverWholeObject.email,
                        id: receiverWholeObject.id,
                        name: receiverWholeObject.name
                    }

                    dispatch(messagesApi.endpoints.addMessage.initiate({

                        conversationId: conversation?.data?.id,
                        sender,
                        receiver,
                        message: arg.data.message,
                        timestamp: arg.data.timestamp

                    }))
                }

            }
        }),
    })
})

export const { useGetConversationsQuery, useGetConversationQuery, useAddConversationMutation, useEditConversationMutation } = conversationsApi; 