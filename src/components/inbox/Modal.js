import { useEffect } from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { conversationsApi, useAddConversationMutation, useEditConversationMutation } from "../../features/conversations/conversationsApi";
import { useGetUserQuery } from "../../features/users/userApi";
import isValidEmail from "../../utils/isValidEmail";
import Error from '../ui/Error';

export default function Modal({ open, control }) {
    const [to, setTo] = useState('');
    const [message, setMessage] = useState('');
    const [request, setRequest] = useState(true);
    const { user: loggedInUser } = useSelector(state => state.auth)
    const { email: myEmail } = loggedInUser;
    const dispatch = useDispatch();
    const [conversation, setConversation] = useState(undefined);
    const [addConversation, { isSuccess: isSuccessAddConversation }] = useAddConversationMutation()
    const [editConversation, { isSuccess:isSuccessEditConversation }] = useEditConversationMutation();


    const { data: participant } = useGetUserQuery(to, {
        skip: request
    });

    const debounch = (fn, delay) => {
        let timer;
        return (...args) => {
            clearTimeout(timer)
            timer = setTimeout(() => {
                fn(...args);
            }, delay);
        }
    }
    const doSearch = (value) => {
        if (isValidEmail(value)) {
            setTo(value);
            setRequest(false);


        }
    }
    const handleEmail = debounch(doSearch, 500);

    // listen to participant data
    useEffect(() => {
        if (participant?.length > 0 && myEmail !== participant[0]?.email) {
            dispatch(conversationsApi.endpoints.getConversation.initiate({ userEmail: myEmail, participantEmail: participant[0]?.email }))
                .unwrap()
                .then((data) => {
                    setConversation(data);
                })
                .catch()

        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [participant, dispatch]);

    const handleSubmit = e => {
        e.preventDefault();
        if (conversation?.length > 0) {
            editConversation({
                sender:loggedInUser,
                id: conversation[0].id,
                data: {
                    participants: `${myEmail}-${participant[0]?.email}`,
                    users: [loggedInUser, participant[0]],
                    message,
                    timestamp: new Date().getTime()
                }
            })
        } else if (conversation?.length === 0) {
            addConversation({
                sender: loggedInUser,
                data: {
                    participants: `${myEmail}-${participant[0]?.email}`,
                    users: [loggedInUser, participant[0]],
                    message,
                    timestamp: new Date().getTime()
                }
            })
        }


    }

    // listen to add/edit conversation success response 
    useEffect(() => {
        if (isSuccessAddConversation || isSuccessEditConversation) {
            control();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSuccessAddConversation, isSuccessEditConversation])




    return (
        open && (
            <>
                <div
                    onClick={control}
                    className="fixed w-full h-full inset-0 z-10 bg-black/50 cursor-pointer"
                ></div>
                <div className="rounded w-[400px] lg:w-[600px] space-y-8 bg-white p-10 absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Send message
                    </h2>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <input type="hidden" name="remember" value="true" />
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div>
                                <label htmlFor="to" className="sr-only">
                                    To
                                </label>
                                <input
                                    id="to"
                                    name="to"
                                    type="email"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                                    placeholder="Send to"
                                    onChange={e => handleEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="message" className="sr-only">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    type="text"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                                    placeholder="Message"
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                disabled={conversation === undefined && participant?.length > 0 && myEmail === participant[0]?.email}
                                type="submit"
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                            >
                                Send Message
                            </button>
                        </div>

                        {
                            participant?.length === 0 && <Error message="This user does not exit!" />
                        }
                        {
                            participant?.length > 0 && myEmail === participant[0]?.email && <Error message="You can not make conversation with your self!" />
                        }
                    </form>
                </div>
            </>
        )
    );
}
