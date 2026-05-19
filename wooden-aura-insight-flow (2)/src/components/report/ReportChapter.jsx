import React from "react";
import ReactMarkdown from "react-markdown";

export default function ReportChapter({ number, title, icon: Icon, children, content }) {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        {Icon && (
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        )}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Chapter {number}</p>
          <h3 className="font-heading text-xl font-semibold">{title}</h3>
        </div>
      </div>
      <div className="pl-12">
        {content && (
          <div className="prose prose-sm max-w-none text-foreground/85 leading-relaxed">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
        {children}
      </div>
    </section>
  );
}