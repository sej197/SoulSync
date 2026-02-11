import { ArrowUp, Paperclip } from "lucide-react";
import "./newprompt.css";

export default function Newprompt() {
    return (
        <>
            <div className="endChat"></div>
            <div className="newprompt">
                <div className="new-form">
                    <label htmlFor="file" className="file-label">
                        <Paperclip size={5} className="icon" />
                    </label>
                    <input type="file" id="file" multiple={false} hidden />
                    <input type="text" placeholder="Ask me anything!" />
                    <button className="sendButton">
                        <ArrowUp size={25} />
                    </button>
                </div>
            </div>
        </>
    );
}
