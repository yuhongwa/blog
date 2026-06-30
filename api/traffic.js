const ANALYTICS_ENDPOINT =
	"https://api.vercel.com/v1/query/web-analytics/visits/count";
const PROJECT_ID = "prj_o5HFDBI8sN4jQRrQnl79oh9PkqJp";
const TEAM_ID = "team_UaTl38wwd4zydar6M4Gio1dk";

export async function GET() {
	const token = process.env.VERCEL_ANALYTICS_TOKEN;

	if (!token) {
		return Response.json(
			{ error: "Traffic statistics are not configured." },
			{ status: 503 },
		);
	}

	const endpoint = new URL(ANALYTICS_ENDPOINT);
	endpoint.searchParams.set("projectId", PROJECT_ID);
	endpoint.searchParams.set("teamId", TEAM_ID);

	try {
		const response = await fetch(endpoint, {
			headers: {
				Accept: "application/json",
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			return Response.json(
				{ error: "Traffic statistics are temporarily unavailable." },
				{ status: 502 },
			);
		}

		const result = await response.json();
		return Response.json(
			{
				pageviews: result.data?.pageviews ?? 0,
				visitors: result.data?.visitors ?? 0,
			},
			{
				headers: {
					"Cache-Control":
						"public, s-maxage=3600, stale-while-revalidate=86400",
					"X-Content-Type-Options": "nosniff",
				},
			},
		);
	} catch {
		return Response.json(
			{ error: "Traffic statistics are temporarily unavailable." },
			{ status: 502 },
		);
	}
}
