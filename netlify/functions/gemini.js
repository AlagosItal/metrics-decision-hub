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
    if (!apiKey) throw new Error("GEMINI_API_KEY no configurada");

    // system_instruction NO está disponible en v1 con gemini-1.5-flash
    // Se fusiona el system prompt directamente en el mensaje del usuario
    const systemPrompt = `Eres el Senior Strategy & Decision Engine del Metrics Decision Hub, herramienta académica del programa Marketing Metrics de la Universidad del Desarrollo (UDD / Zigna). Transformas métricas operativas en Sabiduría Estratégica usando el modelo DIKW y el ciclo DMAIC.

REGLAS ABSOLUTAS:
- TONO: Ejecutivo, sobrio, basado en evidencia. PROHIBIDO emojis.
- FORMATO: Tablas Markdown y encabezados ## para cada sección.
- IDIOMA: 100% español.
- ESTRUCTURA OBLIGATORIA:
  ## 1. DIAGNÓSTICO ESTRATÉGICO
  Tabla: Canal | Métrica | Valor Real | Benchmark | Estado | Brecha
  ## 2. MODELO DE ATRIBUCIÓN — ¿QUÉ CANAL MANDA?
  Análisis comparativo. Identifica el canal con mejor ROI incremental real vs atribuido.
  ## 3. CAUSA RAÍZ Y PUNTO DE FUGA
  Indicador más crítico. Máximo 3 párrafos.
  ## 4. SUSTENTO EN CASOS REALES (2023-2026)
  2 casos documentados análogos (Shopify, Baymard, McKinsey, HubSpot, Meta).
  ## 5. PLAN DE ACCIÓN DMAIC
  Tabla: Fase | Acción Concreta | Métrica de Control | Plazo
- Si ROAS supera ROI en más de 2x: advertir sobreatribución algorítmica (Caso FitLife).
- Si ROI está bajo benchmark: aplicar lógica Botón $300 millones.
- Nunca inventes datos.

DATOS A ANALIZAR:
`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: systemPrompt + userData }],
            },
          ],
          generationConfig: {
            temperature: 0.15,
            maxOutputTokens: 1800,
          },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err?.error?.message || "Error Gemini API");
    }

    const data = await res.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;

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
