// src/components/TipEstimator.tsx
import React, { useState } from "react";
import { AIProjectClient } from "@azure/ai-projects";

interface TipEstimatorProps {
  fare: number;
  estimatedTime: number;
  onEstimate: (tip: number) => void;
}

const TipEstimator: React.FC<TipEstimatorProps> = ({
  fare,
  estimatedTime,
  onEstimate,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setError(null);

    const endpoint = import.meta.env.VITE_PROJECT_ENDPOINT as string | undefined;
    const apiKey = import.meta.env.VITE_AZURE_API_KEY as string | undefined;
    const deployment =
      (import.meta.env.VITE_MODEL_DEPLOYMENT_NAME as string | undefined) ??
      "gpt-4o";

    // 🔎 1. Basic "are keys present?" test
    if (!endpoint || !apiKey) {
      setError("AI is not configured. Check VITE_PROJECT_ENDPOINT and VITE_AZURE_API_KEY.");
      return;
    }

    setLoading(true);
    try {
      // simple browser credential wrapper (same pattern as HaikuGenerator)
      const credential = {
        getToken: async () => ({
          token: apiKey,
          expiresOnTimestamp: Date.now() + 60 * 60 * 1000,
        }),
      };

      // 🔎 2. Create client (this itself tests whether key/endpoint are valid)
      const project = new AIProjectClient(endpoint, credential);
      const client = await project.getAzureOpenAIClient({
        apiVersion: "2024-12-01-preview",
      });

      // 🔎 3. Ask Azure to suggest a tip. If this call throws, you’ll see the error text.
      const safeFare = Number(fare) || 0;
      const safeTime = Number(estimatedTime) || 0;

      const prompt = `
You are a rideshare assistant.

Given:
- Fare: $${safeFare.toFixed(2)}
- Estimated time: ${safeTime} minutes

Return ONLY a suggested tip amount in dollars as a positive number with at most 2 decimals.
Do NOT include any words or currency symbols. Example: 3.5 or 4.25
      `.trim();

      const completion = await client.chat.completions.create({
        model: deployment,
        messages: [
          { role: "system", content: "Return only a number." },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 20,
      });

      const raw = completion.choices?.[0]?.message?.content ?? "";
      const text =
        typeof raw === "string" ? raw.trim() : String(raw).trim();

      const tip = Number(text);

      if (!isNaN(tip) && tip >= 0) {
        const rounded = Number(tip.toFixed(2));
        onEstimate(rounded);
      } else {
        // Fallback if AI responds weirdly
        const fallback = Number((safeFare * 0.15).toFixed(2)); // 15%
        onEstimate(fallback);
        setError("AI returned an invalid value. Using a 15% tip instead.");
      }
    } catch (err) {
      console.error("AI tip error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Could not contact AI. Please enter a tip manually."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "8px" }}>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        style={{
          padding: "8px 12px",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer",
          fontSize: "14px",
          backgroundColor: "#3b82f6",
          color: "white",
        }}
      >
        {loading ? "Calculating tip…" : "Suggest Tip (AI)"}
      </button>
      {error && (
        <div
          style={{
            marginTop: "6px",
            fontSize: "12px",
            color: "#ef4444",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default TipEstimator;
