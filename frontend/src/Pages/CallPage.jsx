import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import PageLoader from "../Components/PageLoader";

import {
    StreamVideo,
    StreamVideoClient,
    StreamCall,
    CallControls,
    SpeakerLayout,
    StreamTheme,
    CallingState,
    useCallStateHooks,
} from "@stream-io/video-react-sdk";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;


const CallPage = () => {

    const { id: callId } = useParams();
    const [client, setClient] = useState(null);
    const [call, setCall] = useState(null);
    const [isConnecting, setIsConnecting] = useState(true);

    const { authUser, isLoading } = useAuthUser();

    const { data: tokenData } = useQuery({
        queryKey: ["streamToken"],
        queryFn: getStreamToken,
        enabled: !!authUser,
    });

    console.log("🚀 CallPage component mounted");


    useEffect(() => {
        console.log("hi nuy")
        const initCall = async () => {
            console.log("authUser:", authUser);
            console.log("tokenData:", tokenData);
            console.log("callId:", callId);

            if (!tokenData?.token || !authUser || !callId) {
                console.warn("Missing required data to initialize call:", {
                    token: tokenData?.token,
                    authUser,
                    callId,
                });
                return;
            }

            try {
                console.log("Initializing Stream video client...");

                const user = {
                    id: authUser._id,
                    name: authUser.fullname, // Make sure this matches the user object
                    image: authUser.profilePic,
                };

                console.log("User object being passed to StreamVideoClient:", user);

                const videoClient = new StreamVideoClient({
                    apiKey: STREAM_API_KEY,
                    user,
                    token: tokenData.token,
                });

                const callInstance = videoClient.call("default", callId);
                console.log("Call instance created:", callInstance);

                await callInstance.join({ create: true });

                console.log("Joined call successfully");

                setClient(videoClient);
                setCall(callInstance);
            } catch (error) {
                console.error("Error joining call:", error);
                toast.error("Could not join the call. Please try again.");
            } finally {
                setIsConnecting(false);
            }
        };

        initCall();
    }, [tokenData, authUser, callId]);


    if (isLoading || isConnecting) return <PageLoader />;

    return (
        <div className="h-screen flex flex-col items-center justify-center">
            <div className="relative">
                {client && call ? (
                    <StreamVideo client={client}>
                        <StreamCall call={call}>
                            <CallContent />
                        </StreamCall>
                    </StreamVideo>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p>Could not initialize call. Please refresh or try again later.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const CallContent = () => {
    const { useCallCallingState } = useCallStateHooks();
    const callingState = useCallCallingState();

    const navigate = useNavigate();

    if (callingState === CallingState.LEFT) return navigate("/");

    return (
        <StreamTheme>
            <SpeakerLayout />
            <CallControls />
        </StreamTheme>
    );
};

export default CallPage;