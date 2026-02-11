import "./chatpage.css";
import { useEffect } from "react";
import { useRef } from "react";
import Newprompt from "./Newprompt";

export default function ChatPage() {

    const endRef = useRef(null);
    useEffect(() => {
        endRef.current.scrollIntoView({ behavior: "smooth" });
    }, []);
    return (
        <div className="chatPage">
            <div className="wrapper">
                <div className="chat">
                    <div className="message">Text msg from ai</div>
                    <div className="message-user">Text msg from user</div>
                    <div className="message">Text msg from ai</div>
                    <div className="message-user">Text msg from user</div>
                    <div className="message">Text msg from ai</div>
                    <div className="message-user">Text msg from user</div>
                    <div className="message">Text msg from ai</div>
                    <div className="message-user">Text msg from user</div>
                    <div className="message">Text msg from ai</div>
                    <div className="message-user">Text msg from user</div>
                    <div className="message">Text msg from ai</div>
                    <div className="message-user">Text msg from user</div>
                    <div className="message">Text msg from ai</div>
                    <div className="message-user">Text msg from user</div>
                    <div className="message">Text msg from ai</div>
                    <div className="message-user">Text msg from user</div>
                    <div className="message">Text msg from ai</div>
                </div>
                <Newprompt />
                <div ref={endRef}></div>
            </div>
        </div>
    );
}