import { Redis } from "@upstash/redis";

const redis = new Redis({
	url: process.env.UPSTASH_REDIS_REST_URL,
	token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
	const { id } = req.query;
	if (!id) return res.status(400).json({ error: "no id provided" });

	try {
		const data = await redis.get(id);

		if (!data) {
			return res.status(404).json({ error: "paste not found" });
		}

		// Check if data is already an object or needs parsing
		let pasteData;
		if (typeof data === "string") {
			try {
				pasteData = JSON.parse(data);
			} catch (e) {
				// If it's not JSON, treat it as plain text
				pasteData = { text: data };
			}
		} else if (typeof data === "object") {
			// Data is already an object
			pasteData = data;
		} else {
			return res.status(500).json({ error: "invalid data format" });
		}

		res.json(pasteData);
	} catch (error) {
		console.error("Redis error:", error);
		res.status(500).json({ error: "Failed to retrieve paste" });
	}
}
