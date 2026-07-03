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
- Keep the report concise, executive-level, and impactful (between 150 and 250 words total).
- Avoid verbose paragraphs; use crisp sentences and focus only on critical placement insights.
- Make the report personalized for the student.
- Do not use emojis.
- Do NOT use Markdown header tags (# or ##) in the report text.

The consolidated report must provide a clean executive summary in 3 concise paragraphs covering:
1. Student Profile & Academic Standing
2. Key Competencies & Industry Readiness
3. Priority Action Items for Placement Success

After the report, append a JSON block at the very end in this exact format (no extra text after it):
\`\`\`json
{
  "overall_summary": "<max 60 words>",
  "academic_analysis": "<max 40 words>",
  "resume_analysis": "<max 40 words>",
  "technical_analysis": "<max 40 words>",
  "project_analysis": "<max 40 words>",
  "certification_analysis": "<max 30 words>",
  "internship_analysis": "<max 30 words>",
  "recruiter_impression": "<max 50 words>",
  "career_fit": ["<role 1>", "<role 2>", "<role 3>", "<role 4 optional>", "<role 5 optional>"],
  "final_verdict": "<max 50 words>"
}

FIELD RULES:

1. overall_summary (max 60 words)
   - Professional summary of the student's complete profile
   - Focus on academic performance, technical capability, experience, and career positioning
   - Do NOT repeat raw marks, skill names, project titles, or certification names

2. academic_analysis (max 40 words)
   - Analyze academic performance quality and trends
   - Comment on CGPA trajectory, consistency, and strength
   - Do NOT just state CGPA or marks

3. resume_analysis (max 40 words)
   - Analyze resume presentation and effectiveness
   - Comment on structure, ATS-friendliness, achievement articulation
   - Do NOT repeat resume content

4. technical_analysis (max 40 words)
   - Analyze technical skills depth, relevance, and alignment with industry
   - Comment on proficiency levels and tech stack appropriateness
   - Do NOT list skill names

5. project_analysis (max 40 words)
   - Analyze project quality, complexity, and learning outcomes
   - Comment on relevance to placement and skill development
   - Do NOT list project names

6. certification_analysis (max 30 words)
   - Analyze certification value, relevance, and impact on readiness
   - Do NOT list certifications

7. internship_analysis (max 30 words)
   - Analyze internship quality, roles, and experiential learning
   - Do NOT list internship details

8. recruiter_impression (max 50 words)
   - Describe how recruiters would evaluate this candidate
   - Comment on hiring appeal, strengths, and perceived gaps
   - Professional, objective tone

9. career_fit (array of 3–5 strings)
   - Suggest 3–5 suitable job roles (e.g., "Frontend Developer", "Backend Engineer", "Full Stack Developer", "Data Analyst", "QA Engineer")
   - Base on skills, projects, internships, and academic profile
   - Realistic and aligned with student's demonstrated capabilities

10. final_verdict (max 50 words)
    - Summary of placement readiness and likelihood of placement
    - Professional conclusion

IMPORTANT: Return ONLY the JSON object. No text before or after. No markdown. No explanations.

STUDENT DATA:

${studentData}`;

    const completion = await Promise.race([
      groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("AI analysis timeout")), 120000)),
    ]);

    const raw = completion.choices[0].message.content.trim();

    // Parse JSON response - handle markdown code blocks
    let result;
    let jsonStr = raw;
    
    // Try to extract JSON from markdown code blocks
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    } else {
      // Try to find JSON object directly
      const directMatch = raw.match(/\{[\s\S]*\}/);
      if (directMatch) {
        jsonStr = directMatch[0];
      }
    }

    try {
      result = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error("JSON Parse Error:", parseErr.message);
      console.error("Raw Response:", raw.substring(0, 500));
      return res.status(500).json({ error: "AI response is not valid JSON: " + parseErr.message });
    }

    // Validate required fields
    const requiredFields = ['overall_summary', 'academic_analysis', 'resume_analysis', 'technical_analysis', 'project_analysis', 'certification_analysis', 'internship_analysis', 'recruiter_impression', 'career_fit', 'final_verdict'];
    for (const field of requiredFields) {
      if (result[field] === undefined || result[field] === null) {
        return res.status(500).json({ error: `Missing required field: ${field}` });
      }
    }
    if (!Array.isArray(result.career_fit) || result.career_fit.length < 3) {
      return res.status(500).json({ error: "career_fit must be an array with at least 3 items" });
    }

    const { error: saveError } = await supabase
      .from("placement_analysis")
      .upsert({
        student_id: studentId,
        consolidated_report: JSON.stringify(result),
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
