import { Redis } from "@upstash/redis";
import { nanoid } from "nanoid";

const redis = new Redis({
	url: process.env.UPSTASH_REDIS_REST_URL,
	token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
	if (req.method !== "POST") return res.status(405).end();

	const { text, title, syntax, expiration } = req.body;
	if (!text) return res.status(400).json({ error: "no text provided" });

	const id = nanoid(8);
	const data = {
		text,
		title: title || null,
		syntax: syntax || "text",
		createdAt: new Date().toISOString(),
	};

	let options = {};
	if (expiration && expiration !== "never") {
		options.ex = parseInt(expiration);
	} else {
		// Default to 24 hours if no expiration is set
		options.ex = 60 * 60 * 24;
	}

	try {
		await redis.set(id, JSON.stringify(data), options);
		res.json({ id });
	} catch (error) {
		console.error("Redis error:", error);
		res.status(500).json({ error: "Failed to save paste" });
	}
}
