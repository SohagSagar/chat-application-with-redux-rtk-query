import { useDispatch, useSelector } from "react-redux";
import { conversationsApi, useGetConversationsQuery } from "../../features/conversations/conversationsApi";
import Error from "../ui/Error";
import ChatItem from "./ChatItem";
import moment from 'moment'
import { getPartnerInfo } from "../../utils/getPartnerInfo";
import gravatarUrl from 'gravatar-url'
import { Link } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import { useState } from "react";
import { useEffect } from "react";

export default function ChatItems() {
    const { user } = useSelector(state => state.auth);
    const loggedInUserEmail = user.email;
    const dispatch = useDispatch()
    const { data, isLoading, isError, error } = useGetConversationsQuery(loggedInUserEmail);
    const { data: conversations, totalCount } = data || {}
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true);

    const fetchMore = () => {
        setPage(prePage => prePage + 1);
    };

    useEffect(() => {
        if (page > 1) {
            dispatch(conversationsApi.endpoints.getMoreConversations.initiate({ email: loggedInUserEmail, page }))
        }
    }, [page, dispatch, loggedInUserEmail])

    useEffect(() => {
        if (totalCount > 0) {
            const more = Math.ceil(totalCount / 10) 
            if(more>page){
                setHasMore(true)
            }else{
                setHasMore(false)
            }
            
            // console.log('more',more);
            // console.log('page',page);
        }
    }, [totalCount,page])


    // decide what to render
    let content = null;
    if (isLoading) content = <li>Loading...</li>
    if (!isLoading && isError) content = <Error message={error?.data} />
    if (!isLoading && !isError && conversations?.length === 0) content = <li>No conversation found</li>
    if (!isLoading && !isError && conversations?.length > 0) content =
        <InfiniteScroll
            
            dataLength={conversations?.length} //This is important field to render the next data
            next={fetchMore}
            hasMore={hasMore}
            loader={<h4>Loading...</h4>}
            height={window.innerHeight - 129}
        >

            {conversations.map(conversation => {
                const { id, timestamp, message } = conversation;
                const partner = getPartnerInfo(conversation?.users, loggedInUserEmail)
                return <li key={id}>
                    <Link to={`/inbox/${id}`}>
                        <ChatItem
                            avatar={gravatarUrl(partner?.email, { size: 80 })}
                            name={partner?.name}
                            lastMessage={message}
                            lastTime={moment(timestamp).fromNow()}
                        />
                    </Link>

                </li>
            })}

        </InfiniteScroll>

    return (
        <ul className="mt-2">
            {content}
        </ul>
    );
}
