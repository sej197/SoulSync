import "./uploads.css";
import { IKContext, IKUpload } from "imagekitio-react";
import { Paperclip } from "lucide-react";
import { useRef } from "react";

const urlEndpoint = import.meta.env.VITE_IMAGEKIT_ENDPOINT;
const publicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY;

const authenticator = async () => {
    try {
        const response = await fetch("http://localhost:5000/api/upload");
        const data = await response.json();
        const { signature, expire, token } = data;

        return {
            signature,
            expire,
            token,
        };
    } catch (error) {
        throw new Error("Failed to get authentication parameters");
    }
};

const Uploads = ({ setImg }) => {

    const ikUploadRef = useRef(null);
    const onError = (err) => {
        console.log("Error", err);
        setImg(prev => ({ ...prev, error: "Upload failed", isLoading: false }));
    };

    const onSuccess = (res) => {
        console.log("Success", res);
        setImg(prev => ({
            ...prev,
            dbData: res,
            isLoading: false
        }));
    };

    const onUploadProgress = (progress) => {
        console.log("Progress", progress);
    };

    const onUploadStart = () => {
        console.log("Upload started");
        setImg(prev => ({ ...prev, isLoading: true }));
    };

    return (
        <IKContext
            publicKey={publicKey}
            urlEndpoint={urlEndpoint}
            authenticator={authenticator}
        >
            <IKUpload
                fileName="test.jpg"
                onError={onError}
                onSuccess={onSuccess}
                onUploadProgress={onUploadProgress}
                onUploadStart={onUploadStart}
                useUniqueFileName={true}
                style={{ display: "none" }}
                ref={ikUploadRef}
            />
            {<label onClick={() => ikUploadRef.current.click()} className="file-label">
                <Paperclip size={25} className="icon" />
            </label>}
        </IKContext>
    );
};

export default Uploads;
