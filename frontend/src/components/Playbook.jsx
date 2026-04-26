import { useState, useRef } from 'react';

// ── Markdown formatter ────────────────────────────────────────────────────────
function fmt(t) {
  return t
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^### (.+)$/gm, '<span class="text-[#0073ea] font-bold block mt-2">$1</span>')
    .replace(/^## (.+)$/gm,  '<span class="text-[#0055b8] font-bold text-sm block mt-3">$1</span>')
    .replace(/^# (.+)$/gm,   '<span class="text-gray-800 font-bold text-base block mt-3">$1</span>')
    .replace(/^---$/gm,      '<hr class="border-gray-200 my-3" />')
    .replace(/^→ (.+)$/gm,   '<span class="block pl-3 border-l-2 border-[#0073ea] text-gray-700 my-1">$1</span>')
    .replace(/^• (.+)$/gm,   '<span class="block pl-3 text-gray-700 my-0.5 before:content-[\'•\'] before:mr-2 before:text-[#0073ea]">$1</span>')
    .replace(/^- (.+)$/gm,   '<span class="block pl-3 text-gray-700 my-0.5 before:content-[\'•\'] before:mr-2 before:text-gray-400">$1</span>')
    .replace(/\n/g, '<br/>');
}

// ── Data ──────────────────────────────────────────────────────────────────────
const SCRIPTS = {
  cold_call: (p, c) => `## 🧊 Cold Call — Barbara Script

**Opening:**
"I'm actually calling as a follow-up to a conversation you had with a colleague of mine named Barbara a few months ago. I know it's been a while but do you recall it by any chance — or would a short refresh help?

I'll be very brief. SeaLights is a Quality Intelligence platform within Tricentis. It knows how to skip tests that are not related to code changes so ${p} and your team can execute only the critical, small subset of tests — to reduce your test cycle times and release much faster! It does that for every test type: UI, Regression, End to End... both Manual and Automated!

So I was wondering — do you have any long E2E or regression testing cycles at the moment? Or any long CI cycles or gaps in your test suites?"

---

## 📞 CTA Options — Choose One:

**CTA 1 — Reduce Test Cycles:**
"The main intention of the call is to perhaps schedule a short demonstration of SeaLights with one of our engineers — to showcase how ${c}'s team will be able to optimize your long tests and prevent escaping defects. If you have time later this week, I'd be happy to schedule it."

**CTA 2 — Quality Gates / Untested Code:**
"...showcase how your team will be able to guarantee higher quality releases by flagging untested code changes and preventing them from reaching production using smart quality gates."

**CTA 3 — Combo Pitch:**
"...showcase how you'll be able to optimize manual and automated tests, but also prevent escaping defects."`,

  short_advanced: (p, c) => `## ⚡ Short & Focused Pitch (Advanced)

"SeaLights is a Quality Intelligence Platform within Tricentis. It helps teams save on the costs of testing while increasing their release speed — by executing only the relevant tests based on code changes for each build and release. It also shows gaps in test suites and flags untested code changes to prevent them from reaching production using smart quality gates.

Our newest AI capabilities include **test generation based on code changes** — which is extraordinary.

I was wondering — does ${c} have long CI cycles, or gaps in your test suites?"

---

## 📞 CTA:
"The main intention of the call is to schedule a short demonstration with one of our engineers to show you exactly how it works. If you have time this week or next, I'd love to set that up."`,

  wp_script: (p, c) => `## 📄 White Paper / Inbound Script

**Opening:**
"Hi ${p}, I'm calling since you've downloaded several white papers of ours recently. I was wondering — what prompted your interest, and are you familiar with SeaLights at all?"

---

## 🔁 Follow-Up Depending on Answer:

**If they know SeaLights:**
"That's great! I'd love to learn more about what specifically caught your attention and see if there's a way we can help ${c} more concretely. Do you have a few minutes to chat?"

**If they don't know SeaLights:**
"No problem at all — I'll give you a very brief overview. SeaLights is a Quality Intelligence platform within Tricentis. It helps teams run only the relevant tests based on code changes — so you cut down test cycle times dramatically, and also flag untested code before it hits production.

Given your interest in our content, I'd love to schedule a quick 20-minute demo with one of our engineers. Would you have time this week?"

---

## 📞 CTA:
"The main intention here is just to showcase the platform — I think you'd find it very relevant to what you're already looking into."`,

  ai_feature: (p, c) => `## 🤖 AI Feature Script (Outbound)

**Opening:**
"Hi ${p}, I'm following up on a previous conversation you had with one of my team members a few months ago. Do you recall it by any chance — or would a short refresh help?

Alright, I'll be very brief. SeaLights is a Quality Intelligence platform within Tricentis that **leverages AI to optimize test execution and prevent escaping defects**. It does that by generating missing test cases based on code changes — for the user stories they're related to.

It also flags modified code that hasn't been tested, and skips tests that aren't related to code changes. It does that for **all test types** — E2E, Regression... both manual and automated.

Most teams we speak with aren't leveraging AI within their testing efforts — they don't know which tests are missing and which tests they need to develop.

So I was wondering — does ${c}'s team struggle with long CI cycles, or escaping defects in production?"

---

## 📞 CTA:
"The main intention of the call is to schedule a short demo with one of our product experts who can walk you through exactly how the AI test generation and code change coverage works. If you have time this week, I'd be happy to set that up."`,

  zoom_qual: (p, c) => `## 🎥 Zoom Qualification Call Script

**Intro:**
"Hi ${p}, thanks for joining — how are you? My name is [Your Name], and I'm in charge of business development for Tricentis SeaLights. I reached out after researching ${c} to identify if we could help solve a few challenges. I came across your profile and believe there's a good chance our platform could benefit your group.

My goal today is to elaborate on SeaLights' capabilities and see if we could fit into your workflows — and then schedule a more technical, in-depth overview with my senior director. Did you get a chance to watch the video attached to the invite?"

---

## 🔍 Pain Discovery:
"Normally, we identify 2 critical areas where executives like yourself find SeaLights relevant:

**1. Slow Releases** — Teams find it difficult to understand which tests are most critical to the upcoming release, making them run all tests all the time. This creates a 'snowball' effect — long E2E or regression cycles, delayed time-to-market, and real inefficiencies.

**2. Escaping Defects** — Most software teams aren't able to identify areas of code that haven't been tested — specifically newly added or modified code. This creates gaps, leading to untested code reaching production and causing defects.

**Out of these two — which one resonates with you the most?"**

---

## 📋 Info to Gather:
- Programming languages used
- Team size and structure (separate QA team or engineers doing QA?)
- Type of app (customer-facing / internal)
- Release frequency
- Manual vs automated testing
- Regulations / proof of testing requirements

---

## 📞 Closing CTA:
"Based on our call today, it seems like SeaLights could definitely be of help. I'd love to schedule a demo with my senior director to walk through the architecture and share a few customer success stories. When would you have time this week or next?"`,

  demo_handoff: (p, c) => `## 🤝 Demo Handoff to AE

**Opening (BDR speaks):**
"Hi ${p}, thank you so much for joining — how are you? Let me do a quick round of introductions.

My name is [Your Name] and I work closely with [AE Name], who'll be leading the conversation on SeaLights today. [AE Name] has been with us for quite some time and has worked with many customers similar to ${c}.

${p}, when we spoke on the phone, you mentioned your primary interests were:

1. **Optimizing test execution** — as your team currently runs all tests all the time
2. **Preventing escaping defects** — by gaining visibility into modified code that hasn't been tested
3. **Reducing the cost of testing** — by allocating resources more efficiently

You also confirmed your team primarily develops in [programming language] in-house — is that still correct?

Great — thanks again for your time, ${p}! I'll hand it off to [AE Name] from here. Enjoy the session!"

---

## 📝 Handoff Notes for AE:
- Confirm programming language before the call
- Primary pain: [fill in from qualification]
- Make sure the lead knows what's being covered in the demo`,

  dev_magic: (p, _c) => `## 💻 Magic Paragraph — Dev / Engineering Persona

**Discovery question first:**
"Just out of curiosity — do you run **ALL** of your tests ALL the time?"

*(If yes → "How long does it usually take to run a full suite of E2E or regression tests?")*

---

**The Pitch:**
"I'd just like to note that SeaLights isn't a test automation or framework tool — but rather **a layer of AI that sits on top of your CI/CD** that knows how to correlate code changes to specific tests, and then automatically prioritizes your test strategy accordingly.

So when your team needs quick feedback during a hotfix — they'd run only the critical subset related to those changes. You optimize speed on one hand, and prevent escaping defects on the other.

If this topic interests you, or you think it would be useful for your department or team — the main intention of the call is to perhaps schedule a short demonstration to show you how it works. I think you'd be genuinely impressed by it."

---

## 📞 CTA:
"Would you have some time later this week? I'd love to set up a 20-minute session with one of our engineers."`,

  qa_magic: (_p, _c) => `## 🔍 Magic Paragraph — QA / QE Persona

**The Pitch:**
"SeaLights isn't a test framework or automation tool — but rather **a layer of AI that sits on top of your CI/CD**, showing you where you have testing gaps, quality risks like untested code changes, and preventing them from reaching production.

It covers **ALL test stages** — not just unit tests — and recommends which subset of tests needs to be executed in every run, so your team isn't wasting time running tests that aren't relevant to recent changes.

It also identifies modified code that hasn't been tested yet — so you can block it before it hits production."

---

## 📞 CTA:
"If this sounds relevant to the challenges your QA team is dealing with — the main intention of the call is to schedule a short demo with one of our product experts. Would you have some time this week or next?"`,
};

const SCRIPT_CARDS = [
  { key: 'cold_call',      label: '🧊 Cold Call',              desc: 'Barbara follow-up script' },
  { key: 'short_advanced', label: '⚡ Short Pitch',             desc: 'Advanced focused version' },
  { key: 'wp_script',      label: '📄 White Paper',             desc: 'Inbound / content download' },
  { key: 'ai_feature',     label: '🤖 AI Feature',              desc: 'AI test generation angle' },
  { key: 'zoom_qual',      label: '🎥 Zoom Qual',               desc: 'Full qualification call' },
  { key: 'demo_handoff',   label: '🤝 Demo Handoff',            desc: 'Intro to AE on demo call' },
  { key: 'dev_magic',      label: '💻 Dev Magic Para',          desc: 'Engineering persona pitch' },
  { key: 'qa_magic',       label: '🔍 QA Magic Para',           desc: 'QA / QE persona pitch' },
];

const OBJECTIONS = {
  magic_dev: `## 💻 Magic Paragraph — Dev / Engineering Persona

**Start with this discovery question:**
"Just out of curiosity — do you run **ALL** of your tests ALL the time?"

*(If yes → "How long does it usually take to run a full suite of E2E or regression tests?")*

---

**Then deliver this:**
"I'd just like to note that SeaLights isn't a test automation or framework tool — but rather **a layer of AI that sits on top of your CI/CD** that knows how to correlate code changes to specific tests, and then automatically prioritizes your test strategy accordingly.

So when your team needs quick feedback during a hotfix, for example — they would run only the critical subset of tests related to those changes. You optimize speed on one hand, and prevent escaping defects on the other."

---

## 📞 CTA:
"Would you have some time later this week? I'd love to set up a 20-minute session with one of our engineers."`,

  magic_qa: `## 🔍 Magic Paragraph — QA / QE Persona

"SeaLights isn't a test framework or automation tool — but rather **a layer of AI that sits on top of your CI/CD**, showing you where you have testing gaps, quality risks like untested code changes, and preventing them from reaching production.

It covers **ALL test stages** — not just unit tests — and recommends which subset of tests needs to be executed in every run, so your team isn't wasting time running tests that aren't relevant to recent changes."

---

## 📞 CTA:
"If this sounds relevant to the challenges your QA team is dealing with — the main intention is to schedule a short demo with one of our product experts. Would you have some time this week or next?"`,

  send_email: `## 📧 "Send me an email"

**What to say:**
"I can absolutely send you all the information over email — but from my experience, most of my emails tend to go to spam, so what I find most efficient is to set a tentative slot on the calendar and include everything there. That way you'll have the material to review, and we'll have a placeholder so it doesn't fall through the cracks — I'm sure you're very busy.

If you have some time next week that's generally open, I'll fire over an invite quickly."

---

**Why this works:** You're not pushing back on the email request — you're reframing the calendar slot as a service to them, not a commitment.`,

  inhouse_solution: `## 🏠 "We have an inhouse solution"

**What to say:**
"Excellent — it's great to hear your team already acknowledges the challenges we help solve. I will say, we do have customers who tried to build this in-house themselves, and they just couldn't reach the level of accuracy and efficiency they needed.

There is no other tool that knows how to do **code-to-test mapping for ALL test types** — flagging untested modified code AND skipping tests that aren't related to code changes. That combination is genuinely unique."

---

**CTA:** "If you have time this week, I'd love to schedule a 20-minute session — no commitment, just a look."`,

  already_tool: `## 🔧 "We already have a tool"

**What to say:**
"That's great to hear! SeaLights was actually built to complement existing tools — it integrates natively with Tosca, qTest, Jenkins, GitHub, Azure DevOps, and more.

In fact, many of our existing Tricentis customers already have SeaLights running alongside their current stack — using it to extend visibility directly into their CI/CD pipelines and code changes, beyond what their other tools can see.

The key differentiator is **code-to-test mapping across ALL test types** — something most tools don't do at all."

---

**Follow-up question:** "What tool are you currently using for test management or coverage?"

**CTA:** "Would you be open to a quick 20-minute session just to see how SeaLights would sit alongside what you already have?"`,

  no_budget: `## 💸 "We don't have budget"

**What to say:**
"Thanks for being upfront about that — and I'm glad you find the platform interesting. To be honest, our sales cycles typically run about 3 quarters, so we're not targeting this quarter's budget or even next quarter's.

The main intention here is simply to showcase the platform, see if it fits into your tech initiatives, and establish a point of contact with my senior director for future reference. No commitment needed right now."

---

**Why this works:** You remove all budget pressure by reframing it as a future-planning conversation, not a sales close.`,

  not_dm: `## 👤 "I'm not a decision maker"

**What to say:**
"That's completely fine — we're not looking for decision makers at this stage. We're primarily looking for the people who are actually dealing with the problems we solve, to see if there's any relevance to your day-to-day work.

In the demo, we cover the challenges we help solve, the architecture behind it, and the platform itself. I genuinely think you'd find it interesting."

---

**CTA:** "Would you have 20 minutes this week or next?"`,

  not_relevant: `## 🚫 "Not relevant / not our focus"

**What to say:**
"I hear you — but the interesting thing is that SeaLights goes well beyond standard code coverage visibility. It's really about **engineering efficiency and release confidence**.

For example, SeaLights automatically detects new or changed code that hasn't been tested yet, and uses AI to generate the missing tests based on those changes — helping your teams close gaps and move faster."

---

**CTA:** "Would you be open to a 20-minute session just to take a look? I think the efficiency story might be more relevant than it sounds."`,

  how_does_it_work: `## ❓ "How does it work?"

**What to say:**
"Great question — to be honest, the main intention of this call is to connect you with one of our product experts who can give you a proper technical walkthrough. I don't want to oversimplify it or mislead you with a surface-level answer.

In the demo, they'll cover exactly how it works — the architecture, the integrations, how it plugs into your CI/CD — and walk through some real customer examples."

---

**CTA:** "If you have time this week, I'd love to set that up — it's only 20 minutes and you'll get a much better answer than I can give you over the phone."

---

**Quick summary if they push for more:**
SeaLights sits as a layer on top of your CI/CD. It instruments your code and your tests, then maps which tests cover which code. When code changes, it knows exactly which tests are relevant — and which ones to skip. It also flags code changes that have zero test coverage, and can auto-generate tests for those gaps using AI.`,

  not_qa: `## 🤷 "I don't handle QA"

**What to say:**
"That's completely fine — SeaLights isn't aimed just at QA teams. It integrates with Jira and Azure DevOps to provide **modified code coverage at the User Story level**.

For every user story, you can see exactly which tests cover it — and which code changes within that story haven't been tested. That's useful for **any engineering leader**, not just QA."

---

**Follow-up question:** "Who on your team would typically own this kind of testing visibility — is there a QE lead or engineering manager I should be speaking with?"`,

  tricentis_existing: `## 🔗 "We already use Tricentis / another automation platform"

**What to say:**
"That's great to hear! SeaLights was built to complement exactly that. It integrates natively with **Tosca, qTest, Jenkins, GitHub, Azure DevOps**, and more.

In fact, many of our existing Tricentis customers already have SeaLights running alongside their Tosca setup — using it to extend visibility beyond test automation, directly into their CI/CD pipelines and code changes."

---

**CTA:** "Would you be open to a 20-minute session just to see how it layers on top of what you already have?"`,

  clevel_exec: `## 👔 High-Level Exec / C-Level

**What to say:**
"I completely understand that attending demos isn't typically part of your responsibilities. From my experience though, executives like yourself often find SeaLights compelling because it's a **strategic platform** designed for large organizations to shift-left and fundamentally change their testing practices.

Specifically, it gives leadership:
1. **Visibility into untested code changes** — so nothing unvetted reaches production
2. **Efficient resource allocation** — focusing test execution on what actually matters"

---

**CTA:** "Would 20 minutes work, or would it be better for me to connect with someone on your team first and loop you in at the right stage?"`,

  not_right_person: `## ↩️ "I'm not the right person"

**What to say:**
"Of course — just to make sure I'm not completely off-track here: are you more on the engineering side, or is testing and release visibility handled by someone else on your team?"

**If they say "I'm more dev-focused":**
"I just want to point out that SeaLights isn't just a QA tool — it's really about improving CI/CD efficiency and giving dev teams faster feedback on whether their code is properly covered or introducing new risks."

**If they point to someone else:**
"That's really helpful — would you be comfortable making a quick introduction, or sharing their name so I can reach out directly?"`,

  sonarqube: `## ⚙️ "We use SonarQube / we already have coverage"

**What to say:**
"Actually, SonarQube is quite different from SeaLights — and most of our customers actually use both. While Sonar provides partial coverage at the **Unit Test level only**, SeaLights provides coverage across **all test types** — E2E, Regression, Integration — whether they're manual or automated.

But more importantly, SeaLights goes well beyond coverage reporting:
- It **skips irrelevant tests** that aren't related to recent code changes
- It **flags modified code** that has zero test coverage across any test type
- It **generates missing tests** using AI based on your actual code changes"

---

**CTA:** "Would you be open to a quick 20-minute demo just to see the comparison side by side?"`,
};

const OBJ_PILLS = [
  { key: 'magic_dev',        label: '💻 Magic Para — Dev' },
  { key: 'magic_qa',         label: '🔍 Magic Para — QA' },
  { key: 'send_email',       label: '📧 Send me an email' },
  { key: 'inhouse_solution', label: '🏠 Inhouse solution' },
  { key: 'already_tool',     label: '🔧 Already have a tool' },
  { key: 'no_budget',        label: '💸 No budget' },
  { key: 'not_dm',           label: '👤 Not a DM' },
  { key: 'not_relevant',     label: '🚫 Not relevant' },
  { key: 'how_does_it_work', label: '❓ How does it work?' },
  { key: 'not_qa',           label: '🤷 Don\'t handle QA' },
  { key: 'tricentis_existing',label: '🔗 Already use Tricentis' },
  { key: 'clevel_exec',      label: '👔 C-Level pushback' },
  { key: 'not_right_person', label: '↩️ Not right person' },
  { key: 'sonarqube',        label: '⚙️ SonarQube / coverage' },
];

const EMAILS = {
  cold_call_followup: (n, c, pain) => `**Subject:** Reduce testing cycle time without compromising quality

Hi ${n},

It was a pleasure speaking with you today — I hope we reconnect soon.

Tricentis SeaLights is a next-generation Quality Intelligence platform designed for enterprise quality engineering teams. It empowers Dev and QA teams to accelerate testing cycles and increase quality.${pain ? `\n\nBased on our conversation, I believe SeaLights could specifically help ${c} with: **${pain}**.` : ''}

**SeaLights capabilities:**
• **Test Impact Analytics** — Auto-select and execute only the critical tests related to code changes, for every test type and stage
• **Test Gap Analytics** — Block untested code changes from reaching production
• **AI Test Generation** — Automatically generate tests for untested code changes, based on each user story
• **Advanced Code Coverage** — Comprehensive coverage visibility across every test type

5-minute overview: https://tricentis-video.wistia.com/medias/xkidbjli0a

I'd appreciate the opportunity to showcase our solution in a short demonstration with one of my executives.

Best,
[Your Name]`,

  no_response: (n) => `**Subject:** Re: SeaLights — quick follow-up

Hi ${n},

Did you get a chance to review my previous email? I really hope we could connect this week — even just for 20 minutes.

Best,
[Your Name]`,

  invite: (n, c) => `**Subject:** ${c} <> SeaLights | Introduction

Hi ${n},

To follow up on our previous conversation — I've set a tentative slot for us to showcase SeaLights for your quality initiatives and how you can leverage AI within your processes. I hope this time works for you!

Watch a 5-minute overview of Tricentis SeaLights: https://tricentis-video.wistia.com/medias/xkidbjli0a

**In this session, we'll cover how SeaLights can help ${c} with:**
• Generate missing tests with AI
• Reduce long & expensive testing cycles (up to 90% reduction in release cycle time)
• Minimize production defects
• Focus your organizational quality strategy

Looking forward to it!

Best,
[Your Name]`,

  meeting_declined: (n) => `**Subject:** Re: SeaLights Demo — New Time?

Hi ${n},

Thanks for letting me know — no problem at all. Would [suggest a new date/time] work better for you?

Happy to be flexible — just let me know what works on your end.

Best,
[Your Name]`,

  meeting_accepted: (n) => `**Subject:** Looking forward to our session!

Hi ${n},

Thanks for accepting — really looking forward to it!

To help tailor the session to your team's needs, could you share the **primary programming languages** your team uses to develop your in-house applications? (e.g. Java, C++, Python, C#)

Thanks in advance!

Best,
[Your Name]`,

  assistant_fwd: (n, c) => `**Subject:** Introduction to Tricentis SeaLights — For ${n}

Hi,

I hope you're well. I reached out to ${n} at ${c} regarding Tricentis SeaLights — a Quality Intelligence platform that helps engineering and QA teams reduce test cycle times and prevent escaping defects.

I'd be grateful if you could forward this email to ${n}, or let me know the best way to connect with them.

5-minute overview: https://tricentis-video.wistia.com/medias/xkidbjli0a

Thank you so much for your help!

Best,
[Your Name]`,
};

const EMAIL_TYPES = [
  { key: 'cold_call_followup', label: 'Cold Call Follow-up' },
  { key: 'no_response',        label: 'No Response (Bump)' },
  { key: 'invite',             label: 'Calendar Invite' },
  { key: 'meeting_declined',   label: 'Meeting Declined' },
  { key: 'meeting_accepted',   label: 'Meeting Accepted' },
  { key: 'assistant_fwd',      label: 'Assistant Forward' },
];

const NEXT_STEPS = {
  connected_interested: (p) => `## 🟢 Connected — Interested

**Immediate actions for ${p}:**

**1. Log the dispo in SalesLoft:**
→ Use **SeaLights FUI** (Follow-up Interested)

**2. Send the follow-up email right now:**
→ Subject: "Reduce testing cycle time without compromising quality"
→ Include the 5-minute overview video link
→ Suggest a demo slot in the email body

**3. Send a LinkedIn connection request (if not already connected):**
→ "Hi ${p}, in light of your experience in software engineering, I'd like to connect."

**4. Set a follow-up task:**
→ If no reply in 2 days → call again and reference the email

**5. Slack (if inbound lead):**
→ React with ❤️ (Qualified)

---

**Key principle:** Speed is everything. They're engaged now — send the email before you do anything else.`,

  demo_scheduled: (p) => `## 📅 Demo Scheduled — ${p}

**Immediate actions:**

**1. Log the dispo in SalesLoft:**
→ Use **SeaLights DS** (Demo Scheduled)

**2. Send the meeting accepted email:**
→ "Thanks for accepting my invite ${p}, looking forward! To tailor the session, could you share the primary programming languages your team uses?"

**3. Wait 1 hour, then call to qualify:**
Must confirm BEFORE the meeting:
- ✅ Programming language (is it supported?)
- ✅ Valid pain (escaping defects / long CI cycles)
- ✅ ICP title (Director+)
- ✅ Supported tech stack

**4. Slack (if inbound):**
→ React with ✅ (Booked)

---

**Remember:** We must qualify PRIOR to the meeting. Don't let an unqualified lead through to an AE demo.`,

  followup_hangup: (p) => `## 📞 Follow-Up (Hang-up) — ${p}

**Immediate actions:**

**1. Log the dispo in SalesLoft:**
→ Use **SeaLights FUHU** (Follow-up — Hang-up)

**2. Keep them in the cadence:**
→ Continue calling on the next scheduled cadence step
→ Try different times of day (early morning, end of day)

**3. Try LinkedIn:**
→ Send a connection request + first message after connecting

**4. Don't give up:**
→ Per the playbook: "We don't give up on leads — keep calling, keep following up until we book."

---

**What NOT to do:** Do not send the full follow-up email yet — they didn't hear the pitch, so the email will have no context for them.`,

  not_interested: (p) => `## 🔴 Not Interested — ${p}

**Immediate actions:**

**1. Log the dispo in SalesLoft:**
→ Use **SeaLights NIN** (Not Interested Now)

**2. Ask one more question before accepting the objection:**
→ "Totally understand — just out of curiosity, is it that testing isn't a priority right now, or that you already have a solution in place?"

**3. If truly not interested:**
→ Remove from active cadence
→ Add a note in CRM with reason and date

**4. Slack (if inbound):**
→ React with ❌ and note: "NIN — [brief reason]"

---

**Note:** "Not interested now" is not the same as "not interested ever." Log the reason clearly so you or a future BDR can revisit in 2–3 quarters.`,

  no_answer: (p) => `## 📵 No Answer — ${p}

**Immediate actions:**

**1. Do NOT log a dispo** — no answer = no connection, cadence continues automatically

**2. Leave a voicemail (if applicable):**
→ Keep it under 20 seconds
→ "Hi ${p}, this is [Your Name] from Tricentis SeaLights — I'm calling regarding your team's testing processes. I'll try you again soon, but feel free to reach me at [number]. Have a great day!"

**3. Try at a different time:**
→ If you called in the morning → try late afternoon (4–5pm their time)
→ If you called on a Monday → try mid-week

**4. Continue the cadence as normal**`,

  meeting_declined: (p) => `## ❌ Meeting Declined — ${p}

**Immediate actions (respond ASAP):**

**1. Move the meeting 2 business days forward**

**2. Send this message immediately:**
→ "Thanks for letting me know ${p}. Would [New Date/Time] work better for you?"

**3. Wait for response**

**4. If positive:**
→ Qualify the lead
→ Remove "Suggested" from the invite title
→ Change calendar color to green

---

**Key principle:** Speed is everything — respond the moment you see the decline.`,

  meeting_tentative: (p) => `## ❓ Meeting Tentative — ${p}

**Immediate actions (respond ASAP):**

**1. Move the meeting 2 hours forward**

**2. Send this message immediately:**
→ "Hi ${p}, I saw you tentatively accepted — does this time work better for you?"

**3. Try to reach by phone**

**4. If positive:**
→ Qualify the lead
→ Change calendar color to green

---

**Key principle:** Tentative = they're considering it. Strike while it's hot — call immediately.`,

  meeting_proposed_new_time: (p) => `## 🔄 Proposed New Time — ${p}

**Immediate actions (respond ASAP):**

**1. Accept the new time right away**

**2. Send this message immediately:**
→ "Hi ${p}, this time works perfectly — I just sent an updated invite. Did it come through?"

**3. Try to reach by phone to confirm**

**4. Once confirmed:**
→ Qualify the lead (programming language, pain, ICP title)
→ Change calendar color to green
→ Log as Demo Scheduled in SalesLoft: **SeaLights DS**

---

**Key principle:** They proposed a time = they want to meet. Lock it in immediately before they change their mind.`,

  meeting_accepted: (p) => `## ✅ Meeting Accepted — ${p}

**Immediate actions:**

**1. Check who confirmed:**
→ Was it ${p} directly, or their assistant?

**2. If ${p} confirmed directly — send this now:**
→ "Thanks for accepting my invite ${p}, looking forward! Also, to tailor the session to your needs — could you share the primary programming languages your team uses to develop your in-house applications? (e.g. Java, C++, Python)"

**3. Wait 1 hour, then call to qualify:**
Confirm BEFORE the meeting:
- ✅ Supported programming language
- ✅ Valid pain (escaping defects / long CI cycles / costs)
- ✅ ICP title (Director and above)
- ✅ Inhouse development (not outsourced)

**4. Log in SalesLoft:**
→ **SeaLights DS** (Demo Scheduled)

---

**Remember:** Must qualify PRIOR to the meeting. No exceptions.`,
};

const OUTCOME_CARDS = [
  { key: 'connected_interested',      label: '🟢 Connected — Interested',       desc: 'They heard the pitch & want to know more' },
  { key: 'demo_scheduled',            label: '📅 Demo Scheduled',                desc: 'Meeting booked, qualify before it happens' },
  { key: 'followup_hangup',           label: '📞 Follow-Up (Hang-up)',           desc: 'Hung up before pitch — keep in cadence' },
  { key: 'not_interested',            label: '🔴 Not Interested',                desc: 'Log NIN and note why' },
  { key: 'no_answer',                 label: '📵 No Answer',                     desc: 'No connection — do not log a dispo' },
  { key: 'meeting_declined',          label: '❌ Meeting Declined',              desc: 'Respond ASAP — propose new time' },
  { key: 'meeting_tentative',         label: '❓ Meeting Tentative',             desc: 'Strike while hot — call immediately' },
  { key: 'meeting_proposed_new_time', label: '🔄 Proposed New Time',            desc: 'Accept immediately and confirm' },
  { key: 'meeting_accepted',          label: '✅ Meeting Accepted',              desc: 'Qualify within 1 hour of acceptance' },
];

const DISPOS = [
  { reason: 'Not Interested Now',      desc: 'Relevant person, not interested at the moment',          code: 'SeaLights NIN',  type: 'No Interest',      color: 'bg-red-50 text-red-700 border-red-200' },
  { reason: 'Irrelevant Territory',    desc: 'Relevant person but wrong territory (India, Iran, etc.)', code: 'SeaLights IT',   type: 'Contact Bad Fit',  color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { reason: 'Too Low Level',           desc: 'Relevant person but too low level (manager, engineer)',   code: 'SeaLights TLL',  type: 'Contact Bad Fit',  color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { reason: 'Irrelevant Persona',      desc: 'Not related to software at all',                         code: 'SeaLights IP',   type: 'Contact Bad Fit',  color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { reason: 'Company Too Small',       desc: 'Relevant person but company too small',                  code: 'SeaLights CTS',  type: 'Contact Bad Fit',  color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { reason: 'Too Immature',            desc: 'No CI/CD, not enough dev, new teams',                    code: 'SeaLights TI',   type: 'No Interest',      color: 'bg-red-50 text-red-700 border-red-200' },
  { reason: 'Tech Stack Not Supported',desc: 'Not Java, .NET, C#, C++, etc.',                          code: 'SeaLights TSNS', type: 'Company Bad Fit',  color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { reason: 'Irrelevant Company',      desc: 'Irrelevant industry / territory / blacklist',            code: 'SeaLights IC',   type: 'Company Bad Fit',  color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { reason: 'Follow-up — Hang-up',     desc: "Didn't hear the pitch, want to reconnect",               code: 'SeaLights FUHU', type: 'Followup',         color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { reason: 'Follow-up — Interested',  desc: 'Heard the pitch and is interested',                      code: 'SeaLights FUI',  type: 'Followup',         color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { reason: 'Demo Scheduled',          desc: 'Meeting is booked',                                      code: 'SeaLights DS',   type: '🎉 Booked',        color: 'bg-green-50 text-green-700 border-green-200' },
];

// ── Qualification logic ───────────────────────────────────────────────────────
function runQualify(input) {
  const t = input.toLowerCase();
  const flags = [];
  const passes = [];

  if (/india|iran|latam|brazil|argentina|apac|china|japan|singapore|emea|middle east|dubai|israel(?! tech)|saudi/.test(t))
    flags.push({ icon: '❌', label: 'Territory', msg: 'Appears to be in an excluded territory (India, Iran, LATAM, APAC, EMEA, Middle East)' });
  else
    passes.push({ icon: '✅', label: 'Territory', msg: 'No excluded territory detected' });

  const supported = /java|javascript|angular|react|typescript|nodejs|node\.js|scala|python|c#|\.net|golang|go |c\+\+|gcc/.test(t);
  const unsupported = /mobile|ios|android|salesforce|ruby|oracle|php|linux/.test(t);
  if (unsupported) flags.push({ icon: '❌', label: 'Tech Stack', msg: 'Mentions unsupported technology (mobile/iOS/Android/Salesforce/Ruby/Oracle/PHP/Linux)' });
  else if (supported) passes.push({ icon: '✅', label: 'Tech Stack', msg: 'Supported language detected' });
  else passes.push({ icon: '⚠️', label: 'Tech Stack', msg: 'Language not mentioned — ask: "What primary languages do you develop in?"' });

  if (/\b(manager|engineer|developer|dev|junior|intern|analyst)\b/.test(t) && !/director|vp |vice president|head of|cto|cio|chief|svp|evp/.test(t))
    flags.push({ icon: '❌', label: 'Persona', msg: 'Appears to be too low level (manager/engineer). ICP requires Director and above.' });
  else if (/director|vp |vice president|head of|cto|cio|chief|svp|evp/.test(t))
    passes.push({ icon: '✅', label: 'Persona', msg: 'Director-level or above detected' });
  else
    passes.push({ icon: '⚠️', label: 'Persona', msg: 'Title not clear — confirm they are Director and above' });

  if (/school|university|college|non.?profit|ngo|church|government|public sector|federal|consul|consulting firm/.test(t))
    flags.push({ icon: '❌', label: 'Industry', msg: 'Excluded industry detected (Education, Non-Profit, Government, Consulting)' });
  else
    passes.push({ icon: '✅', label: 'Industry', msg: 'No excluded industry detected' });

  if (/@tricentis\.com|tricentis employee/.test(t))
    flags.push({ icon: '❌', label: 'Email Domain', msg: 'Tricentis employee — do not book' });
  else
    passes.push({ icon: '✅', label: 'Email Domain', msg: 'Not a Tricentis employee' });

  if (/outsourc|consulting|services company|agency|staff augment/.test(t))
    flags.push({ icon: '❌', label: 'Business Type', msg: 'May be a services/outsourcing company rather than a software product company' });
  else
    passes.push({ icon: '✅', label: 'Business Type', msg: 'Appears to be a software product company' });

  const hasPain = /long.*test|test.*cycle|regression|e2e|escaping defect|defect|production bug|coverage|ci cycle|slow release|manual test|automation/.test(t);
  if (hasPain) passes.push({ icon: '✅', label: 'Pain', msg: 'Valid pain indicators detected' });
  else passes.push({ icon: '⚠️', label: 'Pain', msg: 'No clear pain mentioned — ask: "Do you run all tests all the time? Any escaping defects?"' });

  const redFlags = flags.filter(f => f.icon === '❌');
  const bookable = redFlags.length === 0;

  let dispoSuggestion = '';
  if (!bookable) {
    const f = redFlags[0].label;
    dispoSuggestion =
      f === 'Territory'     ? 'SeaLights IT (Irrelevant Territory)' :
      f === 'Tech Stack'    ? 'SeaLights TSNS (Tech Stack Not Supported)' :
      f === 'Persona'       ? 'SeaLights TLL (Too Low Level)' :
      f === 'Industry'      ? 'SeaLights IC (Irrelevant Company)' :
      f === 'Business Type' ? 'SeaLights IC (Irrelevant Company — services firm)' :
      'Review flags above and select the most relevant dispo';
  }

  return { bookable, passes, flags, dispoSuggestion };
}

// ── Copy to clipboard helper ──────────────────────────────────────────────────
function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); } catch { /* fallback */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return { copied, copy };
}

// ── OutputBox component ───────────────────────────────────────────────────────
function OutputBox({ html, rawText }) {
  const { copied, copy } = useCopy();
  if (!html) return null;
  return (
    <div className="mt-4 bg-[#f8fafd] border border-[#c8ddf5] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#d8e8f8] bg-[#eef4fc]">
        <span className="text-xs font-semibold text-[#0055b8]">Generated Output</span>
        <button
          onClick={() => copy(rawText)}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-[#0073ea] bg-white border border-[#c0d8f5] rounded-lg hover:bg-[#e8f2fd] transition-colors"
        >
          {copied ? '✅ Copied!' : '📋 Copy'}
        </button>
      </div>
      <div
        className="px-4 py-4 text-sm text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 mt-6 mb-3">
      <span className="text-[10px] font-bold uppercase tracking-widest text-[#0073ea]">{children}</span>
      <span className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

// ── Tab: Call Scripts ─────────────────────────────────────────────────────────
function ScriptsTab() {
  const [selected, setSelected] = useState('');
  const [prospect, setProspect] = useState('');
  const [company, setCompany] = useState('');
  const [output, setOutput] = useState('');
  const [rawText, setRawText] = useState('');

  const run = () => {
    if (!selected) return;
    const fn = SCRIPTS[selected];
    const p = prospect.trim() || '[Prospect Name]';
    const c = company.trim() || '[Company]';
    const raw = fn(p, c);
    setRawText(raw);
    setOutput(fmt(raw));
  };

  return (
    <div>
      <SectionLabel>Select Script</SectionLabel>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {SCRIPT_CARDS.map((s) => (
          <button
            key={s.key}
            onClick={() => { setSelected(s.key); setOutput(''); }}
            className={`text-left p-3 rounded-xl border text-xs transition-all ${
              selected === s.key
                ? 'border-[#0073ea] bg-[#e8f2fd] text-[#0055b8]'
                : 'border-gray-200 bg-white text-gray-600 hover:border-[#0073ea]/30 hover:bg-gray-50'
            }`}
          >
            <div className="font-semibold mb-0.5">{s.label}</div>
            <div className="text-[11px] text-gray-400">{s.desc}</div>
          </button>
        ))}
      </div>

      {selected && (
        <>
          <SectionLabel>Personalize</SectionLabel>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Prospect Name</label>
              <input
                value={prospect}
                onChange={(e) => setProspect(e.target.value)}
                placeholder="e.g. Sarah Johnson"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#0073ea] focus:ring-2 focus:ring-[#0073ea]/10"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Company</label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#0073ea] focus:ring-2 focus:ring-[#0073ea]/10"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={run}
                className="px-5 py-2 bg-[#0073ea] text-white text-sm font-semibold rounded-lg hover:bg-[#0063d0] transition-colors"
              >
                Generate →
              </button>
            </div>
          </div>
          <OutputBox html={output} rawText={rawText} />
        </>
      )}
    </div>
  );
}

// ── Tab: Objections ───────────────────────────────────────────────────────────
function ObjectionsTab() {
  const [selected, setSelected] = useState('');
  const [output, setOutput] = useState('');
  const [rawText, setRawText] = useState('');

  const pick = (key) => {
    setSelected(key);
    const raw = OBJECTIONS[key] || '';
    setRawText(raw);
    setOutput(fmt(raw));
  };

  return (
    <div>
      <SectionLabel>Select Objection</SectionLabel>
      <div className="flex flex-wrap gap-2">
        {OBJ_PILLS.map((p) => (
          <button
            key={p.key}
            onClick={() => pick(p.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              selected === p.key
                ? 'bg-[#0073ea] text-white border-[#0073ea]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#0073ea]/40 hover:text-[#0073ea]'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <OutputBox html={output} rawText={rawText} />
    </div>
  );
}

// ── Tab: Email Drafter ────────────────────────────────────────────────────────
function EmailTab() {
  const [name, setName]       = useState('');
  const [company, setCompany] = useState('');
  const [eType, setEType]     = useState('cold_call_followup');
  const [pain, setPain]       = useState('');
  const [notes, setNotes]     = useState('');
  const [output, setOutput]   = useState('');
  const [rawText, setRawText] = useState('');

  const run = () => {
    const n = name.trim() || '[First Name]';
    const c = company.trim() || '[Company]';
    const fn = EMAILS[eType];
    let raw = fn ? fn(n, c, pain) : '';
    if (notes.trim()) raw += `\n\n---\n**Call Notes Reference:**\n${notes.trim()}`;
    setRawText(raw);
    setOutput(fmt(raw));
  };

  return (
    <div>
      <SectionLabel>Email Template</SectionLabel>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {EMAIL_TYPES.map((t) => (
          <button
            key={t.key}
            onClick={() => { setEType(t.key); setOutput(''); }}
            className={`text-left px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
              eType === t.key
                ? 'border-[#0073ea] bg-[#e8f2fd] text-[#0055b8]'
                : 'border-gray-200 bg-white text-gray-600 hover:border-[#0073ea]/30'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <SectionLabel>Fill In Details</SectionLabel>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">First Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sarah"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#0073ea]"
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Company</label>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Acme Corp"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#0073ea]"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Pain Point (optional)</label>
          <input
            value={pain}
            onChange={(e) => setPain(e.target.value)}
            placeholder="e.g. long regression cycles, escaping defects in production"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#0073ea]"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Call Notes (optional — to personalise)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Add call notes to reference in the email..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#0073ea] resize-none"
          />
        </div>
      </div>
      <button
        onClick={run}
        className="mt-3 px-5 py-2 bg-[#0073ea] text-white text-sm font-semibold rounded-lg hover:bg-[#0063d0] transition-colors"
      >
        Draft Email →
      </button>
      <OutputBox html={output} rawText={rawText} />
    </div>
  );
}

// ── Tab: Next Steps ───────────────────────────────────────────────────────────
function NextStepsTab() {
  const [selected, setSelected] = useState('');
  const [prospect, setProspect] = useState('');
  const [output, setOutput]     = useState('');
  const [rawText, setRawText]   = useState('');

  const run = () => {
    if (!selected) return;
    const p = prospect.trim() || '[Prospect]';
    const fn = NEXT_STEPS[selected];
    const raw = fn(p);
    setRawText(raw);
    setOutput(fmt(raw));
  };

  return (
    <div>
      <SectionLabel>Call Outcome</SectionLabel>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {OUTCOME_CARDS.map((o) => (
          <button
            key={o.key}
            onClick={() => { setSelected(o.key); setOutput(''); }}
            className={`text-left p-3 rounded-xl border text-xs transition-all ${
              selected === o.key
                ? 'border-[#0073ea] bg-[#e8f2fd]'
                : 'border-gray-200 bg-white text-gray-600 hover:border-[#0073ea]/30 hover:bg-gray-50'
            }`}
          >
            <div className={`font-semibold mb-0.5 ${selected === o.key ? 'text-[#0055b8]' : ''}`}>{o.label}</div>
            <div className="text-[11px] text-gray-400">{o.desc}</div>
          </button>
        ))}
      </div>

      {selected && (
        <>
          <SectionLabel>Prospect Name</SectionLabel>
          <div className="flex gap-3">
            <input
              value={prospect}
              onChange={(e) => setProspect(e.target.value)}
              placeholder="Prospect first name"
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#0073ea]"
            />
            <button
              onClick={run}
              className="px-5 py-2 bg-[#0073ea] text-white text-sm font-semibold rounded-lg hover:bg-[#0063d0] transition-colors"
            >
              Get Next Steps →
            </button>
          </div>
          <OutputBox html={output} rawText={rawText} />
        </>
      )}
    </div>
  );
}

// ── Tab: Qualification ────────────────────────────────────────────────────────
function QualTab() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);

  const run = () => {
    if (!input.trim()) return;
    setResult(runQualify(input));
  };

  return (
    <div>
      <SectionLabel>Describe the Lead</SectionLabel>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={5}
        placeholder={`Paste lead info or describe the prospect here...\n\nExample: "VP of Engineering at a Java/Python fintech company in London, team of 40 devs, struggling with long regression cycles"`}
        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#0073ea] focus:ring-2 focus:ring-[#0073ea]/10 resize-none"
      />
      <button
        onClick={run}
        className="mt-3 px-5 py-2 bg-[#0073ea] text-white text-sm font-semibold rounded-lg hover:bg-[#0063d0] transition-colors"
      >
        Qualify Lead →
      </button>

      {result && (
        <div className="mt-4">
          {/* Verdict */}
          <div className={`p-4 rounded-xl border mb-4 ${result.bookable ? 'bg-[#edf9f0] border-[#b0e8cf]' : 'bg-red-50 border-red-200'}`}>
            <p className={`text-base font-bold ${result.bookable ? 'text-[#007038]' : 'text-red-700'}`}>
              {result.bookable ? '✅ BOOK THIS LEAD' : '❌ DO NOT BOOK'}
            </p>
            <p className={`text-xs mt-1 ${result.bookable ? 'text-[#007038]/70' : 'text-red-600'}`}>
              {result.bookable
                ? 'No disqualifying flags found. Proceed with scheduling a demo.'
                : `Found ${result.flags.filter(f => f.icon === '❌').length} disqualifying issue(s). Review below.`}
            </p>
          </div>

          {/* Checklist */}
          <div className="space-y-2 mb-4">
            {[...result.passes, ...result.flags].map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="flex-shrink-0 text-base leading-none mt-0.5">{item.icon}</span>
                <div>
                  <span className="font-semibold text-gray-700">{item.label}: </span>
                  <span className="text-gray-500">{item.msg}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Discovery questions */}
          <div className="bg-[#f8fafd] border border-[#d8e8f8] rounded-xl p-4 mb-3">
            <p className="text-xs font-bold text-[#0055b8] uppercase tracking-wider mb-2">Questions to Ask</p>
            <div className="text-xs text-gray-600 space-y-1">
              <p>• "What primary programming languages does your team develop in?"</p>
              <p>• "Is the software developed in-house, or is any of it outsourced?"</p>
              <p>• "Do you run all your tests all the time? How long does a full E2E run take?"</p>
              <p>• "Do you ever have issues with escaping defects or untested code reaching production?"</p>
            </div>
          </div>

          {/* Dispo suggestion */}
          {!result.bookable && result.dispoSuggestion && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Suggested Dispo Code</p>
              <p className="text-sm font-semibold text-amber-800">→ {result.dispoSuggestion}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Tab: Dispos ───────────────────────────────────────────────────────────────
function DisposTab() {
  return (
    <div>
      <SectionLabel>SalesLoft Disposition Codes</SectionLabel>
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Dispo Reason</th>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-600 hidden sm:table-cell">Description</th>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Code</th>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {DISPOS.map((d, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800">{d.reason}</td>
                <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{d.desc}</td>
                <td className="px-4 py-3">
                  <code className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px] font-mono">{d.code}</code>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${d.color}`}>{d.type}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionLabel>Inbound Slack Emojis</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {[
          { emoji: '👍', action: 'Claim', desc: 'Reply "ME" — who catches first' },
          { emoji: '❌', action: 'Unqualified', desc: 'Mention why: Low Level / Irrelevant Prospect / Company Bad Fit' },
          { emoji: '❤️', action: 'Qualified', desc: 'Lead is qualified and worth pursuing' },
          { emoji: '✅', action: 'Booked', desc: 'Demo successfully scheduled' },
          { emoji: '🚫', action: 'No Phone', desc: 'Pass back to Yulia for review' },
        ].map((item) => (
          <div key={item.action} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl">
            <span className="text-2xl flex-shrink-0">{item.emoji}</span>
            <div>
              <p className="text-xs font-semibold text-gray-800">{item.action}</p>
              <p className="text-xs text-gray-400">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab: Dashboard ────────────────────────────────────────────────────────────
function DashboardTab() {
  const resources = [
    { icon: '📞', count: '8', label: 'Call Scripts', desc: 'Personalized with prospect name & company' },
    { icon: '🛡️', count: '14', label: 'Objection Responses', desc: 'Exact playbook wording for every scenario' },
    { icon: '✉️', count: '6', label: 'Email Templates', desc: 'Auto-filled with your inputs' },
    { icon: '📋', count: '9', label: 'Next Step Guides', desc: 'With SalesLoft dispo codes' },
    { icon: '✅', count: '∞', label: 'Lead Qualifier', desc: 'Instant keyword-based ICP checker' },
    { icon: '🗂️', count: '11', label: 'Dispo Codes', desc: 'Full SalesLoft disposition reference' },
  ];

  const quickTips = [
    { tip: 'Always lead with a discovery question before the pitch.' },
    { tip: 'Speed is everything — respond to meeting signals immediately.' },
    { tip: 'Qualify BEFORE the demo. No unqualified leads through to AE.' },
    { tip: 'Log every call outcome in SalesLoft — even no-answers.' },
    { tip: 'Use LinkedIn as a parallel track alongside calling.' },
    { tip: '"Not interested now" ≠ "not interested ever" — log and revisit.' },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 mb-6">
        {resources.map((r) => (
          <div key={r.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{r.icon}</span>
              <span className="text-2xl font-bold text-[#0073ea]">{r.count}</span>
            </div>
            <p className="text-xs font-semibold text-gray-800">{r.label}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{r.desc}</p>
          </div>
        ))}
      </div>

      <SectionLabel>Quick Reminders</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {quickTips.map((t, i) => (
          <div key={i} className="flex items-start gap-2 p-3 bg-[#f8fafd] border border-[#d8e8f8] rounded-xl">
            <span className="text-[#0073ea] font-bold text-sm flex-shrink-0">→</span>
            <p className="text-xs text-gray-600">{t.tip}</p>
          </div>
        ))}
      </div>

      <SectionLabel>5-Min Product Overview</SectionLabel>
      <a
        href="https://tricentis-video.wistia.com/medias/xkidbjli0a"
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-[#0073ea]/40 hover:bg-[#e8f2fd] transition-all group"
      >
        <div className="w-10 h-10 rounded-lg bg-[#e8f2fd] flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-[#0073ea]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800 group-hover:text-[#0073ea] transition-colors">SeaLights Product Overview</p>
          <p className="text-xs text-gray-400">5-minute Wistia video · tricentis-video.wistia.com</p>
        </div>
        <svg className="w-4 h-4 text-gray-300 ml-auto group-hover:text-[#0073ea] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  );
}

// ── Main Playbook component ───────────────────────────────────────────────────
const TABS = [
  { id: 'dashboard',  label: '🏠 Overview',       Component: DashboardTab },
  { id: 'scripts',    label: '📞 Call Scripts',    Component: ScriptsTab },
  { id: 'objections', label: '🛡️ Objections',     Component: ObjectionsTab },
  { id: 'emails',     label: '✉️ Email Drafter',  Component: EmailTab },
  { id: 'nextsteps',  label: '📋 Next Steps',      Component: NextStepsTab },
  { id: 'qualify',    label: '✅ Qualify Lead',    Component: QualTab },
  { id: 'dispos',     label: '🗂️ Dispos',          Component: DisposTab },
];

export default function Playbook() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const active = TABS.find((t) => t.id === activeTab);
  const ActiveComponent = active?.Component;

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="px-8 pt-6 pb-0">
        <h1 className="text-lg font-bold text-gray-800">SeaLights BDR Playbook</h1>
        <p className="text-xs text-gray-400 mt-0.5">Your complete guide to call scripts, objections, emails, and lead qualification</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-0.5 px-6 mt-4 border-b border-gray-200 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-4 py-2.5 text-xs font-medium border-b-2 transition-all -mb-px ${
              activeTab === tab.id
                ? 'border-[#0073ea] text-[#0073ea]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
}
