import { useEffect } from "react";
import { useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useDispatch, useSelector } from "react-redux";
import { messagesApi } from "../../../features/messages/messagesApi";
import Message from "./Message";

export default function Messages({ messages = [], totalCount }) {
    const { user } = useSelector(state => state.auth);
    const dispatch = useDispatch()
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true);

    const fetchMore = () => {
        setPage(prePage => prePage + 1);
    };

    useEffect(() => {
        if (page > 1) {
            dispatch(messagesApi.endpoints.getMoreMessages.initiate({ id: messages[0]?.conversationId, page }))
        }
    }, [page, dispatch, messages])

    useEffect(() => {
        if (totalCount > 0) {
            const more = Math.ceil(totalCount / 10)
            if (more > page) {
                setHasMore(true)
            } else {
                setHasMore(false)
            }

        }
    }, [totalCount, page])



    return (
        <div className="relative w-full h-[calc(100vh_-_197px)] p-6 overflow-y-auto flex flex-col-reverse">
            <ul className="space-y-2">
                <InfiniteScroll
                    dataLength={messages?.length} 
                    next={fetchMore}
                    hasMore={hasMore}
                    loader={<h4>Loading...</h4>}
                    style={{ display: 'flex', flexDirection: 'column-reverse' }} 
                    inverse={true}
                    height={window.innerHeight - 250}    

                >
                    {
                        [...messages]
                            
                            .map(message => {
                                const { id, message: chatMessage, sender } = message;
                                const justify = user.email === sender.email ? 'end' : 'start'
                                return (
                                    <Message key={id} justify={justify} message={chatMessage} />
                                )
                            })
                    }
                </InfiniteScroll>

            </ul>
        </div>
    );
}
