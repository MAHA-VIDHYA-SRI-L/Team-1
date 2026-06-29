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
      { data: academic },
      { data: skills },
      { data: certifications },
      { data: internships },
      { data: resumeRow },
    ] = await Promise.all([
      supabase.from("academic_details").select("*").eq("student_id", studentId).single(),
      supabase.from("skills").select("skill_name, proficiency").eq("student_id", studentId),
      supabase.from("certifications").select("certification_name, issuer").eq("student_id", studentId),
      supabase.from("internships").select("company_name, role, duration").eq("student_id", studentId),
      supabase.from("resumes").select("resume_text").eq("student_id", studentId).single(),
    ]);

    const resumeText = resumeRow?.resume_text || "Not provided";

    const prompt = `You are an AI Placement Readiness Analyzer.

Analyze the following student information:

Academic Performance:
${academic ? `
- 10th: ${academic.tenth_school || "N/A"} — ${academic.tenth_percentage || "N/A"}%
- 12th: ${academic.twelfth_school || "N/A"} — ${academic.twelfth_percentage || "N/A"}%
- UG: ${academic.ug_college || "N/A"} — CGPA ${academic.ug_cgpa || "N/A"}
- PG: ${academic.pg_college || "N/A"} — CGPA ${academic.pg_cgpa || "N/A"}
- Placement Status: ${academic.placement_status}` : "Not provided"}

Skills:
${skills?.length ? skills.map(s => `- ${s.skill_name} (${s.proficiency || "N/A"})`).join("\n") : "None"}

Certifications:
${certifications?.length ? certifications.map(c => `- ${c.certification_name} by ${c.issuer || "N/A"}`).join("\n") : "None"}

Internships:
${internships?.length ? internships.map(i => `- ${i.role} at ${i.company_name} for ${i.duration || "N/A"}`).join("\n") : "None"}

Resume Content:
${resumeText || "Not provided"}

Return a JSON object with exactly these keys:
{
  "readiness_score": <number 0-100>,
  "readiness_status": "<Ready | Almost Ready | Needs Improvement>",
  "strengths": "<top strengths as a string>",
  "weaknesses": "<areas for improvement as a string>",
  "recommendations": "<recommended skills, certifications, internships as a string>",
  "consolidated_report": "<150-200 word report>"
}
Only return the JSON object, no extra text.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });

    const raw = completion.choices[0].message.content.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: "AI response parsing failed" });

    const result = JSON.parse(jsonMatch[0]);

    const { error: saveError } = await supabase
      .from("placement_analysis")
      .upsert({
        student_id: studentId,
        readiness_score: result.readiness_score,
        readiness_status: result.readiness_status,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        recommendations: result.recommendations,
        consolidated_report: result.consolidated_report,
        analyzed_at: new Date().toISOString(),
      }, { onConflict: "student_id" });

    if (saveError) return res.status(400).json({ error: saveError.message });

    return res.status(200).json({ analysis: result });
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
