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

    const prompt = `Eres el Senior Strategy & Decision Engine del Metrics Decision Hub, herramienta académica del programa Marketing Metrics de la Universidad del Desarrollo (UDD / Zigna). Tu rol es el de un consultor senior de marketing digital con 15 años de experiencia en analítica de resultados.

INSTRUCCIONES DE PROFUNDIDAD — OBLIGATORIAS:
- Cada sección debe tener un mínimo de 150 palabras de análisis real.
- PROHIBIDO responder con frases genéricas como "los datos muestran" sin especificar qué dato y qué implica.
- OBLIGATORIO citar benchmarks con su fuente y año exacto.
- OBLIGATORIO incluir 2 casos reales documentados de empresas reales (Shopify, Baymard Institute, HubSpot, McKinsey, Meta, Amazon, Mercado Libre, Falabella u otras relevantes para Latinoamérica) con año, resultado numérico y lección aplicable.
- El plan DMAIC debe tener acciones concretas y específicas, no genéricas.

REGLAS DE FORMATO:
- TONO: Ejecutivo, directo, basado en evidencia. PROHIBIDO emojis.
- IDIOMA: 100% español.
- Usa tablas Markdown para datos comparativos.
- Usa encabezados ## para cada sección.

ESTRUCTURA OBLIGATORIA — DESARROLLA CADA SECCIÓN COMPLETAMENTE:

## 1. DIAGNÓSTICO ESTRATÉGICO
Tabla comparativa completa: Canal | Métrica | Valor Real | Benchmark Industria | Estado | Brecha Absoluta | Impacto Estimado ($)
Después de la tabla: párrafo de síntesis indicando cuál es el indicador más crítico y por qué, con cálculo numérico del costo de la brecha.

## 2. MODELO DE ATRIBUCIÓN — ¿QUÉ CANAL MANDA?
Análisis profundo de qué canal genera el mayor ROI incremental REAL (no atribuido). 
Si hay un solo canal: analizar si el ROAS reportado puede estar inflado por tráfico orgánico canibalizado.
Explica la diferencia entre atribución last-click vs. atribución incremental y cómo afecta la lectura de estos datos.
Conclusión: recomendación de asignación presupuestaria basada en los datos.

## 3. CAUSA RAÍZ Y PUNTO DE FUGA
Identifica el indicador con mayor desviación negativa del benchmark.
Aplica el árbol de causas: ¿Es un problema de alcance? ¿De mensaje? ¿De landing page? ¿De precio? ¿De fricción en checkout?
Si el CPV está bajo benchmark pero el CTR está bajo: explica qué significa esa combinación específica.
Si el ROAS supera al ROI en más de 2x: aplica obligatoriamente el análisis de Sobreatribución del Caso FitLife (marca que gastaba millones en retargeting de Facebook, que se atribuía 40% de ventas por last-click; al pausar campañas las ventas cayeron solo 1.5%).
Si ROI está bajo benchmark: aplica obligatoriamente el análisis del Botón de los $300 millones (Jared Spool, ecommerce que cambió "Register" por "Continue as Guest" y logró +45% conversiones, $300M adicionales al año).

## 4. SUSTENTO EN CASOS REALES (2023-2026)
Caso 1: Empresa real con problema similar al detectado. Incluir: nombre empresa, año, problema, acción tomada, resultado numérico, fuente.
Caso 2: Segundo caso real con ángulo diferente. Mismo formato.
Ambos casos deben ser relevantes para el modelo de negocio analizado (B2C/B2B/SaaS) y preferentemente de Latinoamérica o mercados emergentes cuando sea posible.

## 5. PLAN DE ACCIÓN DMAIC
Tabla detallada: Fase DMAIC | Acción Concreta y Específica | KPI de Control | Responsable | Plazo | Inversión Estimada
Después de la tabla: priorización de las 3 acciones de mayor impacto con justificación numérica.

DATOS A ANALIZAR:
${userData}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 8192,
          },
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
