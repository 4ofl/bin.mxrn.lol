import { useState, useEffect } from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	useNavigate,
	useParams,
} from "react-router-dom";
import axios from "axios";

function Home() {
	const [text, setText] = useState("");
	const [title, setTitle] = useState("");
	const [syntax, setSyntax] = useState("text");
	const [expiration, setExpiration] = useState("86400");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const savePaste = async () => {
		if (!text) return;
		setLoading(true);
		try {
			const { data } = await axios.post("/api/save", {
				text,
				title: title || undefined,
				syntax: syntax !== "text" ? syntax : undefined,
				expiration: expiration !== "never" ? expiration : undefined,
			});
			navigate(`/${data.id}`);
		} catch (err) {
			console.error(err);
			alert("Error saving paste. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
			<main className="flex-grow flex flex-col max-w-4xl mx-auto w-full p-4">
				<div className="flex flex-col bg-gray-800 rounded-lg shadow-lg p-4 flex-grow">
					<input
						type="text"
						className="w-full p-2 mb-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="paste title (optional)"
					/>

					<textarea
						className="flex-grow w-full p-3 bg-gray-700 border border-gray-600 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm mb-3"
						value={text}
						onChange={(e) => setText(e.target.value)}
						placeholder="paste your content here..."
					/>

					<div className="grid grid-cols-2 gap-3 mb-3">
						<select
							className="p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
							value={syntax}
							onChange={(e) => setSyntax(e.target.value)}
						>
							<option value="text">Plain Text</option>
							<option value="javascript">JavaScript</option>
							<option value="python">Python</option>
							<option value="java">Java</option>
							<option value="html">HTML</option>
							<option value="css">CSS</option>
							<option value="php">PHP</option>
							<option value="sql">SQL</option>
						</select>

						<select
							className="p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
							value={expiration}
							onChange={(e) => setExpiration(e.target.value)}
						>
							<option value="3600">1 Hour</option>
							<option value="86400">1 Day</option>
							<option value="604800">1 Week</option>
							<option value="2592000">1 Month</option>
							<option value="never">Never</option>
						</select>
					</div>

					<div className="flex justify-between items-center">
						<div className="text-xs text-gray-400">
							{text.length} chars •{" "}
							{text.split(/\s+/).filter(Boolean).length} words
						</div>
						<button
							className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition disabled:opacity-50"
							onClick={savePaste}
							disabled={loading || !text}
						>
							{loading ? "publishing..." : "publish"}
						</button>
					</div>
				</div>
			</main>

			<footer className="bg-gray-800 py-3 text-center text-gray-400 text-xs">
				scab &copy; {new Date().getFullYear()} - bin.mxrn.lol
			</footer>
		</div>
	);
}

function Paste() {
	const { id } = useParams();
	const [pasteData, setPasteData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [copied, setCopied] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		axios
			.get(`/api/get?id=${id}`)
			.then((res) => {
				if (res.data.error) {
					setPasteData(null);
				} else {
					setPasteData(res.data);
				}
			})
			.catch(() => setPasteData(null))
			.finally(() => setLoading(false));
	}, [id]);

	const copyToClipboard = () => {
		navigator.clipboard.writeText(pasteData.text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const copyLinkToClipboard = () => {
		navigator.clipboard.writeText(window.location.href);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	if (loading)
		return (
			<div className="flex items-center justify-center min-h-screen bg-gray-900 text-gray-100">
				<div className="text-center">
					<svg
						className="animate-spin h-10 w-10 text-purple-500 mx-auto"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle
							className="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="4"
						></circle>
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					<p className="mt-4">loading paste...</p>
				</div>
			</div>
		);

	if (!pasteData)
		return (
			<div className="flex items-center justify-center min-h-screen bg-gray-900 text-gray-100">
				<div className="text-center">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-16 w-16 text-red-500 mx-auto"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<h2 className="text-2xl font-bold mt-4">Paste Not Found</h2>
					<p className="mt-2 text-gray-400">
						The paste you're looking for doesn't exist or may have
						expired.
					</p>
					<button
						onClick={() => navigate("/")}
						className="mt-6 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
					>
						Home
					</button>
				</div>
			</div>
		);

	return (
		<div className="min-h-screen bg-gray-900 text-gray-100">
			<header className="bg-gray-800 py-4 px-6 shadow-lg">
				<div className="max-w-4xl mx-auto flex justify-between items-center">
					<h1 className="text-xl font-bold text-purple-400">
						{pasteData.title || "Untitled Paste"}
					</h1>
					<div className="flex space-x-2">
						<button
							onClick={copyToClipboard}
							className="px-3 py-1 bg-gray-700 rounded-md hover:bg-gray-600 transition flex items-center"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-4 w-4 mr-1"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
								/>
							</svg>
							Copy Text
						</button>
						<button
							onClick={copyLinkToClipboard}
							className="px-3 py-1 bg-purple-600 rounded-md hover:bg-purple-700 transition flex items-center"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-4 w-4 mr-1"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
								/>
							</svg>
							Copy Link
						</button>
					</div>
				</div>
			</header>

			<main className="max-w-4xl mx-auto p-4">
				<div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
					<div className="px-4 py-2 bg-gray-700 text-sm flex justify-between items-center">
						<div className="font-mono">Paste ID: {id}</div>
						{pasteData.syntax && (
							<div className="text-gray-400">
								Language: {pasteData.syntax}
							</div>
						)}
					</div>
					<pre className="whitespace-pre-wrap break-words w-full h-full bg-gray-800 p-4 rounded overflow-auto">
						{pasteData.text}
					</pre>
				</div>

				{copied && (
					<div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg">
						Copied to clipboard!
					</div>
				)}
			</main>
		</div>
	);
}

function NotFound() {
	const navigate = useNavigate();

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100 p-4 text-center">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				className="h-24 w-24 text-red-500 mb-6"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
			<h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
			<p className="text-xl text-gray-400 mb-8 max-w-md">
				The page you're looking for doesn't exist. It might have been
				moved or deleted.
			</p>
			<button
				onClick={() => navigate("/")}
				className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
			>
				Return to Home
			</button>
		</div>
	);
}

export default function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/:id" element={<Paste />} />
				<Route path="*" element={<NotFound />} />
			</Routes>
		</Router>
	);
}
