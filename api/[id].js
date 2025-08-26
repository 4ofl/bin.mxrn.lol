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

	res.setHeader("Content-Type", "text/html");
	res.send(`
    <!doctype html>
    <html>
      <head>
        <title>${title}</title>
        <meta property="og:title" content="${title}" />
        <meta property="og:description" content="${desc}" />
        <meta property="og:url" content="https://bin.mxrn.lol/${id}" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
      </head>
      <body>
        <div id="root"></div>
        <script src="/static/js/bundle.js"></script>
      </body>
    </html>
  `);
}
