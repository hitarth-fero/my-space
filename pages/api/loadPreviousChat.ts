import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "../../utils/types/next";
import Redis from "ioredis";

let redis = new Redis({
	host: process.env.REDIS_HOST,
	password: process.env.REDIS_PASSWORD,
	port: parseInt(process.env.REDIS_PORT),
});
export default async (req: NextApiRequest, res: NextApiResponseServerIO) => {
	if (req.method === "GET") {
		let cachedChat: string = await redis.get("chat");
		let cachedChatJSON: Array<any> = JSON.parse(cachedChat) || [];
		res.status(201).json(cachedChatJSON);
	}
};
