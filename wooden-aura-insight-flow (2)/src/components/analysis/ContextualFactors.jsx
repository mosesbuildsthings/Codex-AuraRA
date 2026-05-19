import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SelectMobile } from "@/components/ui/select-mobile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings2 } from "lucide-react";

const challengeOptions = [
  "Communication Breakdown",
  "Infidelity / Trust Issues",
  "Financial Stress",
  "Family / In-Law Conflict",
  "Mismatched Life Goals",
  "Intimacy Issues",
  "Distance / Availability",
  "Co-Parenting Conflicts",
  "Jealousy / Insecurity",
  "Personal Growth Differences"
];

export default function ContextualFactors({ data, onChange, autoFilling }) {
  const updateField = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const toggleChallenge = (challenge) => {
    const current = data.primary_challenges || [];
    const updated = current.includes(challenge)
      ? current.filter(c => c !== challenge)
      : [...current, challenge];
    updateField("primary_challenges", updated);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Settings2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-heading text-lg font-semibold">Contextual Factors</h3>
          <p className="text-sm text-muted-foreground">
            {autoFilling ? "Aura is pre-filling this from your narrative…" : "Help Aura understand your unique situation"}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Relationship Status */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Relationship Status</Label>
          <SelectMobile
            value={data.relationship_status || ""}
            onValueChange={(v) => updateField("relationship_status", v)}
            placeholder="Select your current status"
            options={[
              { value: "dating", label: "Dating" },
              { value: "engaged", label: "Engaged" },
              { value: "married", label: "Married" },
              { value: "separated", label: "Separated / Considering Reconciliation" },
              { value: "long_distance", label: "Long-Distance" },
              { value: "broken_up", label: "Broken Up" }
            ]}
          />
        </div>

        {/* Ages */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Your Age</Label>
            <Input
              type="number"
              placeholder="Your age"
              value={data.user_age || ""}
              onChange={(e) => updateField("user_age", parseInt(e.target.value) || "")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium mb-2 block">Partner's Age</Label>
            <Input
              type="number"
              placeholder="Partner's age"
              value={data.partner_age || ""}
              onChange={(e) => updateField("partner_age", parseInt(e.target.value) || "")}
            />
          </div>
        </div>

        {/* Primary Challenges */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Primary Challenges</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {challengeOptions.map((challenge) => (
              <label
                key={challenge}
                className="flex items-center gap-3 p-3 rounded-lg border border-border/60 hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <Checkbox
                  checked={(data.primary_challenges || []).includes(challenge)}
                  onCheckedChange={() => toggleChallenge(challenge)}
                />
                <span className="text-sm">{challenge}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Children */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border/60">
            <Label className="text-sm font-medium">Are there children involved?</Label>
            <Switch
              checked={data.has_children || false}
              onCheckedChange={(v) => updateField("has_children", v)}
            />
          </div>

          {data.has_children && (
            <>
              <div>
                <Label className="text-sm font-medium mb-2 block">Children from...</Label>
                <SelectMobile
                  value={data.children_context || ""}
                  onValueChange={(v) => updateField("children_context", v)}
                  placeholder="Select context"
                  options={[
                    { value: "current_relationship", label: "Current relationship" },
                    { value: "previous_relationship", label: "Previous relationship" },
                    { value: "both", label: "Both" }
                  ]}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border/60">
                <Label className="text-sm font-medium">Currently co-parenting with an ex?</Label>
                <Switch
                  checked={data.is_coparenting || false}
                  onCheckedChange={(v) => updateField("is_coparenting", v)}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}