import { useSelector } from "react-redux";
import Message from "./Message";

export default function Messages({ messages = [] }) {
    const {user} =useSelector(state=>state.auth)
    return (
        <div className="relative w-full h-[calc(100vh_-_197px)] p-6 overflow-y-auto flex flex-col-reverse">
            <ul className="space-y-2">
                {
                    [...messages]
                    .reverse()
                    .map(message => {
                        const {id,message:chatMessage,sender} = message;
                        const justify= user.email ===sender.email ? 'end' : 'start'
                        return (
                            <Message key={id} justify={justify} message={chatMessage} />
                        )
                    })
                }

            </ul>
        </div>
    );
}
