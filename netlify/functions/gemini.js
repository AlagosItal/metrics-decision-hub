exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  try {
    const { userData } = JSON.parse(event.body);
    const apiKey = process.env.GEMINI_API_KEY;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: `Eres el Senior Strategy & Decision Engine del Metrics Decision Hub, herramienta académica UDD/Zigna. Diagnóstico ejecutivo en español usando DIKW y DMAIC. Sin emojis. Tablas Markdown y encabezados ##. Estructura obligatoria: ## 1. DIAGNÓSTICO ESTRATÉGICO (tabla Canal|Métrica|Valor Real|Benchmark|Estado|Brecha) ## 2. MODELO DE ATRIBUCIÓN — ¿QUÉ CANAL MANDA? ## 3. CAUSA RAÍZ Y PUNTO DE FUGA ## 4. SUSTENTO EN CASOS REALES 2023-2026 ## 5. PLAN DMAIC (tabla Fase|Acción Concreta|Métrica de Control|Plazo). Si ROAS>ROI*2 advertir sobreatribución FitLife. Si ROI<benchmark aplicar lógica Botón $300M. Nunca inventes datos.` }]
          },
          contents: [{ role: "user", parts: [{ text: `Analiza y diagnostica:\n\n${userData}` }] }],
          generationConfig: { temperature: 0.15, maxOutputTokens: 1800 },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err?.error?.message || "Error Gemini API");
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ text }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
