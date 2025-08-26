// API route (e.g., /api/save)
import { Redis } from "@upstash/redis";
import { nanoid } from "nanoid";

const redis = new Redis({
	url: process.env.UPSTASH_REDIS_REST_URL,
	token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Load valid API keys from environment variable (comma-separated)
const validApiKeys = process.env.API_KEYS
	? process.env.API_KEYS.split(",")
	: [];

export default async function handler(req, res) {
	if (req.method !== "POST") return res.status(405).end();

	// Check API key
	const apiKey = req.headers["x-api-key"];
	if (!apiKey || !validApiKeys.includes(apiKey)) {
		return res.status(401).json({ error: "invalid api key" });
	}

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
	}

	try {
		await redis.set(id, JSON.stringify(data), options);
		res.json({ id });
	} catch (error) {
		console.error("Redis error:", error);
		res.status(500).json({ error: "Failed to save paste" });
	}
}
