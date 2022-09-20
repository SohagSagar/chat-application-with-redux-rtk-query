import { useSelector } from "react-redux";
import gravatar from 'gravatar-url'

export default function ChatHead({ message }) {
    const {auth} = useSelector(state=>state.auth)
    const {sender,receiver}=message || {};
    const receiverName= sender?.email === auth?.email ? receiver.name : sender.name;
    const receiverEmail= sender?.email === auth?.email ? receiver.email : sender.email;
    return (
        <div className="relative flex items-center p-3 border-b border-gray-300">
            <img
                className="object-cover w-10 h-10 rounded-full"
                src={gravatar(receiverEmail)}
                alt={receiverName}
            />
            <span className="block ml-2 font-bold text-gray-600">{receiverName}</span>
        </div>
    );
}
