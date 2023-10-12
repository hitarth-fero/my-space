import React, { useState, useEffect, useRef } from "react";
import { connect } from "socket.io-client";
import tw from "twin.macro";

interface IMsg {
	user: string;
	msg: string;
	trip: string;
}

// create random user
const user = "User_" + String(new Date().getTime()).substr(-3);

const trip = "TRIP-0002";

// component
const Index: React.FC = () => {
	const inputRef = useRef(null);

	// connected flag
	const [connected, setConnected] = useState<boolean>(false);

	// init chat and message
	const [chat, setChat] = useState<IMsg[]>([]);
	const [msg, setMsg] = useState<string>("");

	useEffect((): any => {
		// connect to socket server
		const socket = connect(process.env.BASE_URL, {
			path: "/api/socketio",
		});

		async function fetchData() {
			const resp = await fetch("/api/loadPreviousChat", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			const temp = await resp.json();

			console.log(temp);

			setChat([...temp]);
		}

		fetchData();

		// log socket connection
		socket.on("connect", () => {
			console.log("SOCKET CONNECTED!", socket.id);
			setConnected(true);
		});

		// update chat on new message dispatched
		socket.on("message", (message: IMsg) => {
			fetchData();
			chat.push(message);
			setChat([...chat]);
		});

		// socket disconnet onUnmount if exists
		if (socket) return () => socket.disconnect();
	}, []);

	const sendMessage = async () => {
		if (msg) {
			// build message obj
			const message: IMsg = {
				user,
				msg,
				trip,
			};

			// dispatch message to other users
			const resp = await fetch("/api/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(message),
			});

			// reset field if OK
			if (resp.ok) setMsg("");
		}

		// focus after click
		inputRef?.current?.focus();
	};

	return (
		<div>
			<div>
				<div>
					{chat.length ? (
						chat.map((chat, i) => (
							<div key={"msg_" + i}>
								<span>
									{chat.user === user ? "Me" : chat.user}
								</span>
								: {chat.msg}
							</div>
						))
					) : (
						<div>No chat messages</div>
					)}
				</div>
				<div>
					<div>
						<div>
							<input
								ref={inputRef}
								type="text"
								value={msg}
								placeholder={
									connected
										? "Type a message..."
										: "Connecting..."
								}
								disabled={!connected}
								onChange={(e) => {
									setMsg(e.target.value);
								}}
								onKeyPress={(e) => {
									if (e.key === "Enter") {
										sendMessage();
									}
								}}
							/>
						</div>
						<div>
							<button onClick={sendMessage} disabled={!connected}>
								SEND
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Index;
