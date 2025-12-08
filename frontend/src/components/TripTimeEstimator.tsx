// src/components/TripTimeEstimator.tsx
import React, { useState } from "react";
import { AIProjectClient } from "@azure/ai-projects";

interface Props {
  pickup: string;
  dropoff: string;
  onEstimate: (minutes: number) => void;
}

const TripTimeEstimator: React.FC<Props> = ({ pickup, dropoff, onEstimate }) => {
  const [loading, setLoading] = useState(false);

  const estimateTripTime = async () => {
    if (!pickup.trim() || !dropoff.trim()) return;

    setLoading(true);

    try {
      const endpoint = import.meta.env.VITE_PROJECT_ENDPOINT as string;
      const apiKey = import.meta.env.VITE_AZURE_API_KEY as string;
      const deployment =
        import.meta.env.VITE_MODEL_DEPLOYMENT_NAME ?? "gpt-4o";

      // Azure auth wrapper (same as HaikuGenerator)
      const credential = {
        getToken: async () => ({
          token: apiKey,
          expiresOnTimestamp: Date.now() + 3600000,
        }),
      };

      const project = new AIProjectClient(endpoint, credential);
      const client = await project.getAzureOpenAIClient({
        apiVersion: "2024-12-01-preview",
      });

      // Ask model for a VERY SIMPLE estimate
      const prompt = `
        Estimate travel time between:
        Pickup: ${pickup}
        Dropoff: ${dropoff}

        Rules:
        - Return ONLY a number in minutes. No text.
        - If unsure, guess a reasonable number between 5–25.
      `;

      const result = await client.chat.completions.create({
        model: deployment,
        messages: [
          { role: "system", content: "Return only a number." },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 10,
      });

      const output = String(result.choices?.[0]?.message?.content || "").trim();
      const minutes = Number(output);

      if (!isNaN(minutes) && minutes > 0) {
        onEstimate(minutes);
      } else {
        // fallback: fake formula
        const fallback = 10 + Math.floor(Math.random() * 10);
        onEstimate(fallback);
      }
    } catch (e) {
      console.error("Trip time AI error:", e);
      const fallback = 12 + Math.floor(Math.random() * 8);
      onEstimate(fallback);
    }

    setLoading(false);
  };

  return (
    <button
      onClick={estimateTripTime}
      disabled={loading}
      style={{
        marginTop: "8px",
        padding: "10px 16px",
        backgroundColor: "#3b82f6",
        color: "white",
        borderRadius: "6px",
        border: "none",
        cursor: "pointer",
      }}
    >
      {loading ? "Estimating..." : "Estimate Travel Time"}
    </button>
  );
};

export default TripTimeEstimator;
