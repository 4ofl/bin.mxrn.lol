import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";

const redis = new Redis({
	url: process.env.UPSTASH_REDIS_REST_URL,
	token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
	const { id } = req.query;
	const data = await redis.get(id);

	if (!data) {
		res.status(404).send("not found");
		return;
	}

	let paste;
	try {
		paste = typeof data === "string" ? JSON.parse(data) : data;
	} catch {
		paste = { text: data };
	}

	const title = paste.title || `paste ${id}`;
	const desc = (paste.text || "").slice(0, 150);

	// load your real build index.html
	const filePath = path.join(process.cwd(), "build", "index.html");
	let html = fs.readFileSync(filePath, "utf8");

	// og tags to inject
	const ogTags = `
    <title>${title}</title>
    <meta property="og:title" content="${title} | bin.mxrn.lol" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:url" content="https://bin.mxrn.lol/${id}" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="https://bin.mxrn.lol/icon.png" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="https://bin.mxrn.lol/icon.png" />

    <link rel="icon" href="/icon.png" />
  `;

	// inject before </head>
	html = html.replace("</head>", `${ogTags}</head>`);

	res.setHeader("Content-Type", "text/html");
	res.send(html);
}
