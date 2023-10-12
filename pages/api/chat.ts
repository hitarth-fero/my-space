import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "../../utils/types/next";
import Redis from "ioredis";

let redis = new Redis({
	host: process.env.REDIS_HOST,
	password: process.env.REDIS_PASSWORD,
	port: parseInt(process.env.REDIS_PORT),
});

export default async (req: NextApiRequest, res: NextApiResponseServerIO) => {
	if (req.method === "POST") {
		// get message
		const message = req.body;

		let cachedChat: string = await redis.get("chat");

		let cachedChatJSON: Array<any> = JSON.parse(cachedChat) || [];

		if (message) {
			console.log("Send Message");
			cachedChatJSON.push(message);

			await redis.set("chat", JSON.stringify(cachedChatJSON), "EX", 60);
			// dispatch to channel "message"
			res?.socket?.server?.io?.emit("message", message);

			res.status(201).json(cachedChatJSON);
		} else {
			res.status(500);
		}
	}
};
