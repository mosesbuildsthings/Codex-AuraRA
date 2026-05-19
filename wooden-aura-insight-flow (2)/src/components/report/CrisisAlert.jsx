import React from "react";
import { AlertTriangle, Phone, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const crisisResources = [
  {
    name: "National Suicide Prevention Lifeline",
    phone: "988",
    url: "https://988lifeline.org/"
  },
  {
    name: "National Domestic Violence Hotline",
    phone: "1-800-799-7233",
    url: "https://www.thehotline.org/"
  },
  {
    name: "Crisis Text Line",
    phone: "Text HOME to 741741",
    url: "https://www.crisistextline.org/"
  }
];

export default function CrisisAlert() {
  return (
    <div className="rounded-2xl border-2 border-destructive/30 bg-destructive/5 p-6 mb-8">
      <div className="flex items-start gap-3 mb-4">
        <AlertTriangle className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
        <div>
          <h3 className="font-heading text-lg font-semibold text-destructive">Important Safety Notice</h3>
          <p className="text-sm text-foreground/80 mt-1 leading-relaxed">
            Our analysis has detected indicators that suggest you or someone close to you may be 
            in a situation requiring immediate professional support. Aura strongly recommends 
            reaching out to one of the following resources:
          </p>
        </div>
      </div>

      <div className="space-y-3 ml-9">
        {crisisResources.map((resource) => (
          <div key={resource.name} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border/60">
            <div>
              <p className="font-medium text-sm">{resource.name}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Phone className="w-3 h-3" /> {resource.phone}
              </p>
            </div>
            <a href={resource.url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-1">
                Visit <ExternalLink className="w-3 h-3" />
              </Button>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}