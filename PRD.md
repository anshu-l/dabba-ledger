# Dabba Ledger — Product Requirements Document

A purpose-built ordering and kitchen-management tool for a solo home-food provider ("Aunty") who feeds 60–150 college students today over WhatsApp. This is **not** a food-delivery platform — it's a way to replace manual message-counting with a system that tells her, at a glance, how much to cook and who still owes her money.

---

## 1. Executive Summary

Aunty runs a real, working business by hand: students message her on WhatsApp, she tallies orders in her head or a notebook, cooks to that count, and delivers door-to-door. It works — but every step depends on her personally reading, remembering, and counting messages, for 60–150 customers across up to three meals a day.

The system's only job is to remove that counting-and-remembering burden without asking her to change how she runs the business. Students place an order (meal type + quantity, no menu browsing — she decides what's cooked); the system locks it at her cutoff time and hands her one number: how many of each meal to make, and who they're for. Payment and delivery status live in the same place so "who hasn't paid" stops being a mental note.

Everything else — loyalty programs, ratings, delivery-route optimization, multi-vendor marketplace features — is explicitly out of scope. This is a single-provider operations tool, not a platform.

---

## 2. Problem Statement

At low volume, WhatsApp ordering is fine. Past a certain number of daily orders, three things break down at once:

- **Counting doesn't scale.** Determining "how many lunches today" means scrolling a chat thread (or several, if orders come in via individual DMs) and manually tallying, every single day, against a hard deadline.
- **State lives in her memory.** Who cancelled, who paid, who's a no-show today — none of it is written down anywhere durable. It's reconstructed from memory or a notebook each time it's needed.
- **Errors compound at volume.** A miscounted message, a missed cancellation, a duplicate order — each is a small mistake, but at 60–150 customers they happen daily and directly cost her food, money, or both.

The goal is a system that absorbs the counting and record-keeping, while leaving the parts that already work — her deciding the menu, her cooking, her delivering — completely untouched.

---

## 3. Current Workflow (reconstructed)

| Stage | How it works today |
|---|---|
| Menu | Aunty announces what she's making — e.g. "making X for dinner today" — there is no student-facing menu to browse; students order the meal slot itself, not a dish. |
| Order placement | Free-form WhatsApp message per student, per meal, sent fresh each time. No recurring/subscription pattern — it's one-off, meal by meal. |
| Confirmation | Manual and implicit — a reply, or no reply at all. Students have no reliable way to know their order registered. |
| Cutoff | Lunch: ~11:00 AM same day. Breakfast: previous day. Dinner: a fixed but currently unconfirmed time (**open question**). |
| Quantity planning | Manual tally of messages against the cutoff, from memory/notebook. |
| Modifications/cancellations | Cutoff is **strictly enforced** — no changes accepted after it passes. |
| Delivery | Individual, door-to-door per student/hostel room — not a common pickup point. |
| Payment | Mixed: cash on delivery and UPI, both per-order (no confirmed monthly settlement pattern). |
| Team | Solo operator — no separate admin/helper role to design for. |

Rows marked as open in [§ 11 Open Questions](#11-open-questions) reflect gaps still to confirm with Aunty directly, not assumptions baked into the design.

---

## 4. Users & Personas

Two roles only. A separate administrator role was considered and rejected for MVP — Aunty is a solo operator, and a second role would add login/permission complexity with no one to use it.

### Aunty — Provider (the only privileged role)
Runs the kitchen. Not highly technical. Needs the app open for minutes, not hours, per day.
- See today's cook count the instant cutoff passes
- See it broken down by meal and by student
- Mark orders delivered / paid with one tap
- Change tomorrow's menu text and cutoff times herself

### Student — Customer (repeat, high-frequency user)
Ordering the same 2–3 meal types most days. Optimizes for speed — this replaces a 10-second WhatsApp text.
- See today's/tomorrow's meal and the cutoff clock
- Order in one or two taps, no browsing required
- Know instantly the order was recorded
- See what they owe and what's already paid

---

## 5. Pain Points

*(Hypotheses, not all confirmed — distinguishing what's directly stated versus inferred keeps the design honest about what still needs validating with Aunty.)*

| Pain point | Status | Whose problem |
|---|---|---|
| Manually tallying orders against a hard cutoff, for up to 150 customers | Reported | Provider |
| No durable record of who paid / who's unpaid | Reported | Provider |
| Students unsure whether a WhatsApp order actually registered | Assumed | Student |
| Retyping the same order text every day | Assumed | Student |
| Missed/forgotten cutoff, no meal that day | Assumed | Student |
| Duplicate orders from message threading confusion | Potential | Provider |

---

## 6. Product Principles

1. **Replace the tally, not the relationship.** Aunty still decides the menu and talks to her customers — the system only removes counting and remembering.
2. **One screen answers "how much do I cook."** If the provider dashboard doesn't answer that in one glance, it has failed its core job.
3. **Ordering is faster than WhatsApp, or it's not worth switching.** No menu browsing, no cart — pick meal, pick quantity, done.
4. **Cutoff is sacred and configurable.** Enforced strictly like today, but Aunty can change the time herself without asking anyone.
5. **No feature without a named problem.** Every item in scope traces to a stated pain point, not a hypothetical one.

---

## 7. Business Rules

| Rule | Value | Configurable by provider? |
|---|---|---|
| Lunch cutoff | ~11:00 same day | Yes |
| Dinner cutoff | TBC — open question | Yes |
| Breakfast cutoff | Prior day, exact time TBC | Yes |
| Post-cutoff modification | Not permitted | — |
| Post-cutoff cancellation | Not permitted | — |
| Late order (after cutoff) | Rejected by the system; provider can still hand-add an exception | — |
| Menu content | Free text per meal slot, set daily by provider — no item-level selection for students | Yes, daily |
| Recurring orders | Not modeled — every order is a fresh, one-off action | — |
| Payment methods | UPI or cash, recorded per order | — |
| Holidays / days off | Provider marks a day closed; ordering disabled for that date | Yes |

> **Note:** Cutoff times are stored as provider-editable settings, not hard-coded constants — the exact dinner and breakfast times still need confirming with Aunty, and she may want to change them seasonally (e.g. exam weeks).

---

## 8. Order Lifecycle

Deliberately short. There is no "Preparing" / "Ready" / "Out for delivery" granularity — a solo operator delivering door-to-door in one trip has no use for tracking intermediate kitchen states; it would be data entry with no payoff.

```
Placed → Confirmed (auto, at placement) → Locked (at cutoff) → Delivered (provider taps)

Exit states:
  Cancelled — student, pre-cutoff only
  No-show   — provider marks, post-delivery window
```

Payment is tracked as a parallel flag (`unpaid → paid`) on the order, not a lifecycle state — an order can be **Delivered** and **unpaid** at the same time, which is exactly the view Aunty needs to chase up.

---

## 9. Functional Requirements

### MVP

**Place order** — *Student*
- Problem: replaces a free-text WhatsApp message with a faster, unambiguous action
- Preconditions: meal slot open today; cutoff not passed; day not marked closed
- Main flow: open app → see today's/tomorrow's meal slots → pick meal + quantity → confirm
- Output: order created in `Confirmed` state; visible instantly in provider's tally

**Cancel order (pre-cutoff)** — *Student*
- Business rule: only permitted before that meal's cutoff, matching current WhatsApp practice
- Output: order moves to `Cancelled`; removed from provider's cook count immediately

**Today's cook count** — *Provider*
- Problem: the core pain point — manual tallying against a deadline
- Main flow: open app → see per-meal totals (e.g. Lunch: 34) with a live count that finalizes at cutoff → expand to see the name list
- Success criteria: answers "how many do I cook" in under 5 seconds, no scrolling a chat

**Set today's menu & cutoff** — *Provider*
- Main flow: type a short line of text per meal slot ("Rajma chawal") → optionally adjust that slot's cutoff time → publish
- Data: free text, no structured dish/ingredient model — matches how she already communicates the menu

**Mark delivered / paid** — *Provider*
- Main flow: from the order list, tap a name to toggle Delivered and Paid independently
- Output: feeds the "who still owes me" and "who's left to deliver to" views directly

### V1

**Order again** — *Student*
- Problem: students order the same 2–3 meal types repeatedly; re-entering each time is pure friction
- Simplest useful version: a single "repeat yesterday's order" shortcut — not a schedule/subscription builder

**Provider-side manual order** — *Provider*
- Problem: some students will always call/text her directly; she needs to add an order on their behalf, including past cutoff as a deliberate exception

**Push/WhatsApp reminders** — *Student*
- Problem: missed cutoffs (hypothesis, unconfirmed) — a reminder 30–60 min before cutoff closes could address it
- Channel: undecided — deferred to design phase; simplest to ship is in-app only, WhatsApp integration is a later cost/build decision

### Future

**Weekly settlement view**
- Not confirmed as a current pattern (payment today is per-order) — build only if a monthly/weekly plan pattern emerges

**Delivery-route ordering, ratings, multi-provider marketplace**
- Why excluded: would turn a single-provider ops tool into a generic delivery platform — explicitly against the project's premise

---

## 10. Data Model

| Entity | Key fields | Notes |
|---|---|---|
| `Student` | name, phone, hostel/room | Phone is the identifier; matches how she already recognizes customers |
| `MealSlot` | date, type (breakfast/lunch/dinner), menu_text, cutoff_at, is_open | One row per date per meal type; provider-edited daily |
| `Order` | student_id, meal_slot_id, quantity, status, paid, payment_method, delivered | status ∈ {confirmed, cancelled, no_show}; paid and delivered are independent flags, not lifecycle states |
| `Payment` | order_id, method (UPI/cash), amount, recorded_at | One row per settled order; no separate ledger for MVP |

No `Menu`, `Dish`, or `RecurringOrder` entities — there's no item-level catalog to model, and no confirmed recurring pattern to support yet.

---

## 11. Edge Cases

| Case | Behavior |
|---|---|
| Order attempted after cutoff | Rejected in-app with the exact reason and next available slot; provider can still hand-add it as a manual exception (V1) |
| Cancel attempted after cutoff | Rejected — matches current strict policy |
| Provider edits menu after orders exist | Allowed; existing orders are unaffected since they're tied to the meal slot, not menu text |
| Two students order the last unit simultaneously | No hard inventory cap in MVP — Aunty cooks to the confirmed count, so there's no "sold out" race to protect against |
| Provider marks a day closed after orders exist | Existing orders for that date are auto-cancelled with a visible note to the student |
| Duplicate order, same student/slot | Quantity field absorbs this — increases the existing order rather than creating a second row |
| Student never opens the app / prefers WhatsApp | Provider's manual order entry (V1) exists precisely for this case — the system doesn't require 100% adoption to be useful |

---

## 12. Scope

### MVP
Everything needed to replace manual tallying and nothing else. Ships as a mobile-first web app — no native app, no payment gateway integration (payment stays cash/UPI-in-person, just *recorded* by the system).
- Student: view today/tomorrow's meal slots + cutoff clock, place order, cancel pre-cutoff, view own order history
- Provider: set daily menu text + cutoff per slot, live cook-count dashboard, mark delivered/paid, mark a day closed
- Both: simple phone-number based login, no password reset flows needed at this scale

### V1
- Order-again / repeat-yesterday shortcut
- Provider manual order entry (covers non-adopters and post-cutoff exceptions)
- Deadline reminder notification (channel TBD)
- Simple order history export for the provider (e.g. for her own records/taxes)

### Future / explicitly deferred
- Recurring/subscription orders — only if a real pattern emerges (currently one-off per meal)
- Weekly/monthly settlement billing — only if payment behavior shifts that way
- In-app payments/gateway integration
- Multi-provider support, delivery-route optimization, ratings/reviews — out of scope for a single-provider tool by design

---

## 13. UX Approach

**Student:** Open → see today's meal & cutoff → tap quantity → confirm. No menu-browsing UI, since there's nothing to browse — one meal slot, one decision.

**Provider:** Open → see today's numbers → deliver → tap names off the list → close the day. Large tap targets, no charts or analytics that aren't immediately actionable, mobile-first since she's not sitting at a desktop between deliveries.

---

## 14. Technical Architecture (sketch)

| Layer | Choice | Why |
|---|---|---|
| Frontend | Mobile-first responsive web app | No app-store friction for either side; both roles use it inside a browser |
| Backend + DB | Single small server, relational DB (e.g. Postgres) | Order volume is tens per day — no need for anything beyond a simple CRUD service |
| Auth | Phone number + OTP | Matches the identifier she already uses to recognize customers |
| Notifications | In-app for MVP; WhatsApp/SMS integration deferred to V1 | Avoids taking on a messaging-API dependency before it's proven necessary |
| Payments | Recorded, not processed | Cash/UPI-in-person continues as-is; system just logs the outcome |

---

## 15. Success Metrics

- Time for Aunty to know today's full cook count, from cutoff to number-in-hand (target: under 1 minute, from a process that today takes manual tallying)
- Reduction in unpaid orders going untracked past a week
- Share of orders placed in-app vs. still arriving via WhatsApp (adoption, not a forced 100% target)
- Cancellation/no-show rate before vs. after — should hold steady or improve, not worsen

---

## 16. Open Questions

- **Confirm with Aunty:** Exact dinner cutoff time, and the exact breakfast cutoff time (currently only known as "day before").
- **Confirm with Aunty:** Whether missed-deadline students are ever informally accommodated in practice, despite the stated strict policy — this affects whether an exception path is truly needed in V1 or can wait.
- **Confirm with Aunty:** Whether there's any per-meal quantity ceiling (a max she can physically cook) that the system should enforce.
- **Design decision, not urgent:** Which notification channel (in-app vs. WhatsApp integration) is worth the build cost — deferred until MVP usage shows whether missed deadlines are actually a real problem.
