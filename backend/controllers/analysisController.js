import supabase from "../config/supabase.js";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const getStudentId = async (authUserId) => {
  const { data } = await supabase.from("student_profiles").select("id").eq("auth_user_id", authUserId).single();
  return data?.id || null;
};

export const analyzeStudent = async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.id);
    if (!studentId) return res.status(404).json({ error: "Student profile not found" });

    const [
      { data: profile },
      { data: academic },
      { data: skills },
      { data: certifications },
      { data: internships },
      { data: resumeRow },
    ] = await Promise.all([
      supabase.from("student_profiles").select("full_name, branch, current_year, pass_out_year, linkedin_url").eq("auth_user_id", req.user.id).single(),
      supabase.from("academic_details").select("*").eq("student_id", studentId).single(),
      supabase.from("skills").select("skill_name, proficiency").eq("student_id", studentId),
      supabase.from("certifications").select("certification_name, issuer, category, status").eq("student_id", studentId),
      supabase.from("internships").select("company_name, role, duration").eq("student_id", studentId),
      supabase.from("resumes").select("resume_text").eq("student_id", studentId).single(),
    ]);

    const resumeText = resumeRow?.resume_text || "Not provided";

    const certsByCategory = {};
    (certifications || []).forEach(c => {
      if (!certsByCategory[c.category]) certsByCategory[c.category] = [];
      certsByCategory[c.category].push(`${c.certification_name} by ${c.issuer || "N/A"} [${c.status}]`);
    });
    const certsFormatted = Object.entries(certsByCategory)
      .map(([cat, items]) => `${cat}:\n${items.map(i => `  - ${i}`).join("\n")}`)
      .join("\n") || "None";

    const studentData = `
PERSONAL PROFILE:
- Name: ${profile?.full_name || "N/A"}
- Department: ${profile?.branch || "N/A"}
- Current Year: ${profile?.current_year || "N/A"}
- Pass Out Year: ${profile?.pass_out_year || "N/A"}
- LinkedIn: ${profile?.linkedin_url || "Not provided"}

ACADEMIC DETAILS:
${academic ? `- 10th: ${academic.tenth_school || "N/A"} — ${academic.tenth_percentage || "N/A"}%
- 12th: ${academic.twelfth_school || "N/A"} — ${academic.twelfth_percentage || "N/A"}%
- Diploma: ${academic.diploma_percentage ? academic.diploma_percentage + "%" : "N/A"}
- UG College: ${academic.ug_college || "N/A"} — CGPA: ${academic.ug_cgpa ?? "N/A"}
- PG College: ${academic.pg_college || "N/A"} — CGPA: ${academic.pg_cgpa ?? "N/A"}
- SGPA Trend: ${Array.isArray(academic.sgpa_values) ? academic.sgpa_values.filter(Boolean).join(", ") : "N/A"}
- Placement Status: ${academic.placement_status || "Not Placed"}` : "Not provided"}

SKILLS:
${skills?.length ? skills.map(s => `- ${s.skill_name} (${s.proficiency || "N/A"})`).join("\n") : "None listed"}

CERTIFICATIONS & ACHIEVEMENTS (by category):
${certsFormatted}

INTERNSHIPS:
${internships?.length ? internships.map(i => `- ${i.role} at ${i.company_name} for ${i.duration || "N/A"}`).join("\n") : "None"}

RESUME CONTENT:
${resumeText}

PROFILE COMPLETION:
- Skills: ${skills?.length ? `${skills.length} skills listed` : "None"}
- Certifications: ${certifications?.length ? `${certifications.length} certifications` : "None"}
- Internships: ${internships?.length ? `${internships.length} internships` : "None"}
- Resume: ${resumeText !== "Not provided" ? "Uploaded" : "Not uploaded"}
`.trim();

    const prompt = `You are an expert AI Placement Analyst working for a college Student Placement Tracker System.

Your responsibility is to analyze the complete student profile and generate a professional Placement Analysis & Consolidated Report.

Analyze every section carefully. Do not simply summarize the information. Instead, evaluate the student's placement readiness based on the quality, completeness, relevance, consistency, and strength of the profile.

You must generate your own Placement Readiness Score out of 100 based on your analysis. The score should consider: Academic Performance, Technical Skills, Soft Skills, Resume Quality, Relevant Projects, Internship Experience, Certifications, Profile Completeness, Overall Industry Readiness. Do not assign random scores. Justify the score based on the student's profile.

Rules:
- Be objective.
- Do not invent information.
- If information is unavailable, explicitly mention it.
- Use professional placement-oriented language.
- Keep the report between 700 and 1200 words.
- Make the report personalized for the student.
- Do not use emojis.
- Format the response cleanly using Markdown headings.

The report must contain these sections in order:
# Placement Analysis & Consolidated Report
## Student Overview
## Overall Placement Readiness
## Academic Evaluation
## Technical Skills Analysis
## Soft Skills Evaluation
## Resume Analysis
## Projects Analysis
## Internship Analysis
## Certifications Analysis
## Profile Completeness
## Strengths
## Areas for Improvement
## Personalized Recommendations
## Final Verdict

After the full markdown report, append a JSON block at the very end in this exact format (no extra text after it):
\`\`\`json
{
  "readiness_score": <integer 0-100>,
  "readiness_status": "<Ready | Almost Ready | Needs Improvement>",
  "strengths": "<2-3 sentences on top strengths>",
  "weaknesses": "<2-3 sentences on areas needing improvement>",
  "recommendations": "<3-5 specific actionable recommendations>"
}
\`\`\`

Here is the student's complete profile:

${studentData}`;

    const completion = await Promise.race([
      groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("AI analysis timeout")), 120000)), // 2 minute timeout
    ]);

    const raw = completion.choices[0].message.content.trim();

    // Extract the JSON block at the end
    const jsonMatch = raw.match(/```json\s*([\s\S]*?)\s*```\s*$/);
    let result;
    try {
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[1]);
      } else {
        const fallback = raw.match(/\{[\s\S]*\}/);
        if (!fallback) return res.status(500).json({ error: "AI response parsing failed — no JSON block found" });
        result = JSON.parse(fallback[0]);
      }
    } catch (parseErr) {
      return res.status(500).json({ error: "AI response JSON parse error: " + parseErr.message });
    }

    // Validate required fields
    if (typeof result.readiness_score !== 'number' || result.readiness_score < 0 || result.readiness_score > 100)
      return res.status(500).json({ error: "AI returned invalid readiness_score" });
    if (!result.readiness_status || !result.strengths || !result.weaknesses || !result.recommendations)
      return res.status(500).json({ error: "AI response missing required fields" });

    // The consolidated report is everything before the json block
    const consolidated_report = raw.replace(/```json[\s\S]*?```\s*$/, "").trim();

    const { error: saveError } = await supabase
      .from("placement_analysis")
      .upsert({
        student_id: studentId,
        readiness_score: result.readiness_score,
        readiness_status: result.readiness_status,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        recommendations: result.recommendations,
        consolidated_report,
        analyzed_at: new Date().toISOString(),
      }, { onConflict: "student_id" });

    if (saveError) return res.status(400).json({ error: saveError.message });

    return res.status(200).json({ analysis: { ...result, consolidated_report } });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getAnalysis = async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.id);
    if (!studentId) return res.status(404).json({ error: "Student profile not found" });

    const { data, error } = await supabase
      .from("placement_analysis")
      .select("*")
      .eq("student_id", studentId)
      .single();

    if (error || !data) return res.status(404).json({ error: "No analysis found. Run analysis first." });

    return res.status(200).json({ analysis: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
