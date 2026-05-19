import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Badge } from "@/components/ui/badge";

const COLORS = ["hsl(170, 45%, 45%)", "hsl(0, 55%, 55%)", "hsl(230, 10%, 65%)"];

export default function EmotionalLandscape({ data }) {
  if (!data) return null;

  const chartData = [
    { name: "Positive", value: data.positive || 0 },
    { name: "Negative", value: data.negative || 0 },
    { name: "Neutral", value: data.neutral || 0 }
  ];

  return (
    <div>
      <h3 className="font-heading text-xl font-semibold mb-4">The Emotional Landscape</h3>
      <p className="text-muted-foreground text-sm mb-6">
        An overview of the emotional tone detected across your narrative.
      </p>

      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1">
          <div className="space-y-3 mb-5">
            {chartData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-sm font-medium w-20">{item.name}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${item.value}%`, backgroundColor: COLORS[i] }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-10 text-right">{item.value}%</span>
              </div>
            ))}
          </div>

          {data.dominant_emotions?.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Dominant emotions:</p>
              <div className="flex flex-wrap gap-2">
                {data.dominant_emotions.map((emotion) => (
                  <Badge key={emotion} variant="secondary" className="rounded-full">
                    {emotion}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}