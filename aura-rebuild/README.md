# Aura Rebuild (Web App + Android App Wrapper)

This is a brand-new Aura implementation rebuilt from the provided planning docs and Base44 feature direction.

## What this build includes

- Fresh codebase independent of Base44 scaffolding
- Secure local session model with 30-minute auto logout
- Relationship Manager for switching between multiple relationship contexts
- New Analysis flow with:
  - narrative-first intake
  - automatic context/core-question suggestions
  - editable suggested fields
  - working relationship status selection
  - primary challenges with `Other` custom input
- Evidence Locker with client-side AES-GCM encryption before storage
- Report engine with:
  - quick summary
  - risk-level scoring
  - fatherly/motherly voice support
  - `Both` voice premium gating
  - report action buttons (journal, partner link, action plan, challenge/exercise/quiz creation, vision)
- Premium page ($15/mo) with feature gating behavior
- Profile page with MBTI mini-assessment, Enneagram selection, and Zodiac calculation
- Feedback page for feature suggestions
- Future Advice Types roadmap page
- Privacy Policy and Terms pages
- Capacitor Android wrapper (`appId: com.aurarelationshipapp.app`)

## Run locally (web)

```bash
npm install
npm run dev
```

## Build and sync Android wrapper

```bash
npm run android:build
npm run android:open
```

## Quality checks

```bash
npm run lint
npm run test
npm run build
npm run smoke
```

## Notes

- Reports and encrypted evidence are stored in local browser storage in this build.
- If you want release APK/AAB output next, run the Android Gradle build from Android Studio after `npm run android:open`.
