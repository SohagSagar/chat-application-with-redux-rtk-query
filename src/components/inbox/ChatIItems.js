import { useSelector } from "react-redux";
import { useGetConversationsQuery } from "../../features/conversations/conversationsApi";
import Error from "../ui/Error";
import ChatItem from "./ChatItem";
import moment from 'moment'
import { getPartnerInfo } from "../../utils/getPartnerInfo";
import gravatarUrl from 'gravatar-url'
import { Link } from "react-router-dom";

export default function ChatItems() {
    const { user } = useSelector(state => state.auth);
    const loggedInUserEmail = user.email;

    const { data: conversations, isLoading, isError, error } = useGetConversationsQuery(loggedInUserEmail);

    // decide what to render
    let content = null;
    if (isLoading) content = <li>Loading...</li>
    if (!isLoading && isError) content = <Error message={error.data} />
    if (!isLoading && !isError && conversations.length === 0) content = <li>No conversation found</li>
    if (!isLoading && !isError && conversations.length > 0) content = conversations.map(conversation => {

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
    })

    return (
        <ul className="mt-2">
            {content}
        </ul>
    );
}
