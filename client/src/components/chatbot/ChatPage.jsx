import "./chatpage.css";
import Newprompt from "./Newprompt";

export default function ChatPage() {

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
            </div>
        </div>
    );
}