import { NextRequest, NextResponse } from "next/server";
import { getRecommendations } from "@/lib/gemini";

export async function POST(req: NextRequest) {
    try {
        const jsonInput = await req.json();

        // Single call for both analysis and searching
        const { analysis, recommendations } = await getRecommendations(jsonInput);

        // Simulated ranking enhancement (can still be kept)
        const rankedRecommendations = recommendations
            .map((event: any) => {
                let matchScore = 0.6; // Base score
                const skillMatch = event.skill_focus?.some((s: string) =>
                    analysis.detected_skills.some((ds: string) => ds.toLowerCase().includes(s.toLowerCase()))
                );
                if (skillMatch) matchScore += 0.2;
                if (analysis.intent === "competition readiness" && event.event_type === "contest") matchScore += 0.2;
                return { ...event, match_score: Math.min(matchScore, 1.0) };
            })
            .sort((a: any, b: any) => b.match_score - a.match_score);

        return NextResponse.json({
            input_summary: analysis,
            recommendations: rankedRecommendations,
            generated_at: new Date().toISOString(),
        });

    } catch (error: any) {
        console.error("Pipeline Error:", error);
        return NextResponse.json({
            error: "Failed to process recommendations",
            details: error.message
        }, { status: 500 });
    }
}
