import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import AuraLogo from "@/components/ui/AuraLogo";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="max-w-3xl mx-auto px-6 py-6 flex items-center gap-4">
        <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <AuraLogo variant="wordmark" size="sm" />
      </nav>

      <div className="max-w-3xl mx-auto px-6 pb-20">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="font-heading text-3xl font-bold">Privacy Policy</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-10">Last updated: April 28, 2026</p>

        <div className="space-y-8 text-foreground">

          <section>
            <h2 className="font-heading text-xl font-semibold mb-3">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to <strong>Aura – Relationship AI</strong> ("Aura", "we", "us", or "our"). We are committed to
              protecting your personal information and your right to privacy. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you use our mobile application and web service.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              By using Aura, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold mb-3">2. Information We Collect</h2>
            <h3 className="font-semibold mb-2 mt-4">2.1 Information You Provide Directly</h3>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li><strong>Account information:</strong> name, email address, and password when you register.</li>
              <li><strong>Relationship narratives:</strong> written stories, journal entries, and reflections you submit for analysis.</li>
              <li><strong>Uploaded files:</strong> screenshots, images, or documents you voluntarily upload as evidence for analysis.</li>
              <li><strong>Profile data:</strong> age, relationship status, and other context you provide to improve analysis accuracy.</li>
              <li><strong>Goals and milestones:</strong> relationship goals, milestones, and progress notes you create.</li>
              <li><strong>Feedback:</strong> any feedback, bug reports, or feature requests you submit.</li>
            </ul>

            <h3 className="font-semibold mb-2 mt-4">2.2 Information Collected Automatically</h3>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li><strong>Device information:</strong> device type, operating system version, unique device identifiers.</li>
              <li><strong>Usage data:</strong> pages visited, features used, session duration, and interaction logs.</li>
            </ul>

            <h3 className="font-semibold mb-2 mt-4">2.3 Permissions We Request</h3>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li><strong>Camera (android.permission.CAMERA):</strong> used only when you explicitly choose to take a photo to attach to an analysis session. Images are never accessed passively.</li>
              <li><strong>Internet:</strong> required for app functionality and syncing your data.</li>
              <li><strong>Storage (read/write):</strong> used to allow you to select files from your device for upload.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Provide, operate, and maintain the Aura service.</li>
              <li>Generate AI-powered relationship analyses and personalized guidance.</li>
              <li>Improve, personalize, and expand our services.</li>
              <li>Communicate with you about updates, support, or account-related matters.</li>
              <li>Detect and prevent fraud, abuse, or security incidents.</li>
              <li>Comply with legal obligations.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              <strong>Anonymization:</strong> Before your narrative or uploads are processed by our AI systems, all personally
              identifiable details (names, locations, etc.) are automatically anonymized.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold mb-3">4. Data Storage & Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your data is stored on secure cloud infrastructure. We retain your personal data for as long as your account
              is active or as needed to provide services. You may request deletion at any time (see Section 7).
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold mb-3">5. Sharing Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              We do not sell, trade, or rent your personal information to third parties. We may share data with:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground mt-3">
              <li><strong>AI/LLM providers:</strong> anonymized text is sent to AI model providers to generate your analysis. Providers are contractually prohibited from training on your data.</li>
              <li><strong>Infrastructure providers:</strong> hosting, database, and storage services under strict data processing agreements.</li>
              <li><strong>Legal requirements:</strong> if required by law, court order, or to protect our rights.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold mb-3">6. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement industry-standard security measures including encryption in transit (TLS) and at rest, access
              controls, and regular security reviews.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold mb-3">7. Your Rights & Choices</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li><strong>Access:</strong> you may request a copy of the personal data we hold about you.</li>
              <li><strong>Correction:</strong> you may update your account information at any time in the app.</li>
              <li><strong>Deletion:</strong> you may delete your account and all associated data from the Profile page, or by emailing <strong>support@theauraapp.com</strong>. Deletion is processed within 30 days.</li>
              <li><strong>Opt-out:</strong> you may opt out of non-essential communications at any time.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold mb-3">8. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Aura is not intended for children under 13 years of age. We do not knowingly collect personal information
              from children under 13.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold mb-3">9. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of significant changes by
              updating the "Last updated" date and by in-app notification where appropriate.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold mb-3">10. Contact Us</h2>
            <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-muted-foreground text-sm">
              <p><strong>Aura – Relationship AI</strong></p>
              <p>Email: support@theauraapp.com</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}