import { ArrowUp } from "lucide-react";
import "./newprompt.css";
import { useEffect, useRef, useState } from "react";
import Uploads from "./Uploads";
import { IKImage } from "imagekitio-react";

export default function Newprompt() {

    const [img, setImg] = useState({
        isLoading: false,
        error: "",
        dbData: {},
    });

    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    const add = async () => {
        const prompt = "write a story about a cat";
        const result = await result.response;
        const text = result.text;
        console.log(text);
    }

    return (
        <>
            {img.dbData?.filePath && (
                <IKImage
                    urlEndpoint={import.meta.env.VITE_IMAGEKIT_ENDPOINT}
                    path={img.dbData.filePath}
                    width="280"
                    height="280"
                />
            )}

            <div className="endChat" ref={endRef}></div>

            <div className="newprompt">
                <div className="new-form">
                    <label className="file-label">
                        <Uploads setImg={setImg} />
                    </label>

                    <input type="text" placeholder="Ask me anything!" />

                    <button className="sendButton">
                        <ArrowUp size={25} />
                    </button>
                </div>
            </div>
        </>
    );
}
