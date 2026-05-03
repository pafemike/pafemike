// 40 hand-written interview questions with model answers.
// Loaded once on first boot — re-running the server with the same DB is idempotent
// (we INSERT OR IGNORE on the unique slug column).

export const QUESTIONS = [
  // ===== BEHAVIORAL =====
  {
    slug: 'b-leadership-deadline',
    title: 'Tell me about a time you led a project under tight deadlines.',
    category: 'behavioral', framework: 'STAR', tags: 'leadership,delivery',
    answer_md: `**Headline.** I led the Q4 checkout rewrite at [Company] under a 2-week runway and shipped 3 days early with latency down 38% and conversion up 12%.

- **Situation.** Cross-team rewrite, 4 engineers blocked by a brittle legacy gateway, hard go-live on Black Friday.
- **Task.** Own delivery without slipping scope; unblock the team; keep error budget intact.
- **Action.** Parallelized risk burn-down, ran 10-min daily stand-ups with the SRE lead, paired on the rollout plan, and pushed the riskiest migration behind a feature flag with auto-rollback.
- **Result.** Shipped 3 days early. Zero rollback. Latency -38%, conversion +12%.`,
    speaker_note: 'Lead with the result, then walk back through STAR if probed. Hit a number every two sentences.',
  },
  {
    slug: 'b-conflict-manager',
    title: 'Describe a time you disagreed with your manager.',
    category: 'behavioral', framework: 'STAR', tags: 'conflict,have-backbone',
    answer_md: `- **Situation.** My manager wanted to ship a new pricing tier in 4 weeks; my read of the data said we'd cannibalize the existing tier by ~18%.
- **Task.** Push back without blocking the roadmap.
- **Action.** Built a 2-page memo with the cohort analysis, proposed a controlled rollout (5% → 25% → 100%) with kill-switches, and walked them through it 1:1.
- **Result.** They accepted the staged rollout. At 25% we saw the cannibalization land at ~14%, killed the launch, saved an estimated $2.1M ARR.`,
    speaker_note: 'Show backbone but commit. End with the manager seeing the data and changing course.',
  },
  {
    slug: 'b-failure',
    title: 'Tell me about a project that failed.',
    category: 'behavioral', framework: 'STAR', tags: 'failure,learning',
    answer_md: `- **Situation.** Rebuilt our search ranking model end-to-end. I was confident in the offline metrics — NDCG was up 11%.
- **Task.** Ship to production, watch the live KPIs.
- **Action.** Rolled to 50% in week 1. Click-through dropped 6% on the long tail. I'd over-fit to the head of the distribution.
- **Result.** Rolled back, ran a proper interleaving test on a 5% slice, redesigned the loss to up-weight tail queries. The next launch lifted CTR 4% net positive.

**Lesson:** trust live A/B over offline metrics, especially on long-tailed distributions.`,
    speaker_note: 'Own it cleanly. The interviewer is testing whether you blame, hide, or learn.',
  },
  {
    slug: 'b-ambiguity',
    title: 'Tell me about a time you worked through ambiguity.',
    category: 'behavioral', framework: 'STAR', tags: 'ambiguity,bias-for-action',
    answer_md: `- **Situation.** New product line, no spec, no PM, just a sentence from the CEO: "make checkout feel native on mobile."
- **Task.** Define what "native" means and ship something measurable in 6 weeks.
- **Action.** Picked 3 metrics (TTI, abandon rate, NPS), shadowed 5 customers on real checkouts, drafted a 1-page brief, and got sign-off on a thin first slice (Apple Pay + autofill).
- **Result.** Slice shipped in 4 weeks. Abandon rate down 9%. The brief became the spec for the next 3 quarters.`,
    speaker_note: 'Ambiguity questions test whether you create structure. Show the artifact you produced.',
  },
  {
    slug: 'b-prioritize',
    title: 'How do you prioritize when everything feels urgent?',
    category: 'behavioral', framework: 'STAR', tags: 'prioritization',
    answer_md: `**Framework I use.** Reversibility × blast radius. One-way doors with high blast radius go first; two-way doors get queued.

- **Situation.** Heading into a holiday freeze with 14 open issues across 3 services.
- **Task.** Decide what ships before freeze.
- **Action.** Triaged into (a) one-way doors that touched money movement — 3 issues — and (b) cosmetic / dev-only — 11 issues. Killed the cosmetic queue, pulled in a second engineer for (a).
- **Result.** All 3 money-movement issues shipped 2 days before freeze. The cosmetic backlog moved into Q1 with zero customer complaints.`,
  },
  {
    slug: 'b-mentor',
    title: 'Tell me about a time you mentored someone.',
    category: 'behavioral', framework: 'STAR', tags: 'mentorship,growth',
    answer_md: `- **Situation.** Junior engineer joined my team, struggled to break down 2-week tasks into PRs.
- **Task.** Get them shipping weekly within a quarter.
- **Action.** Set up a weekly 30-min 1:1, taught them the "vertical slice" pattern (tiny end-to-end PR, then iterate), pair-coded the first one, then pulled back.
- **Result.** By week 6 they were shipping 3 PRs/week and led their first incident review by month 3. They were promoted to mid-level the next cycle.`,
  },
  {
    slug: 'b-tradeoff',
    title: 'Tell me about a tough technical trade-off.',
    category: 'behavioral', framework: 'STAR', tags: 'tradeoffs,judgment',
    answer_md: `- **Situation.** Migrating from Postgres to a sharded MySQL cluster for a 2B-row table.
- **Task.** Pick: extend Postgres with Citus, or move to MySQL.
- **Action.** Built a 1-page comparison: latency p99, ops cost, hiring market, escape hatch. Postgres+Citus was technically cleaner but the team had no operational muscle for it.
- **Result.** Chose MySQL despite worse query ergonomics — picked the boring tech that the team could run at 3am. Migrated in 8 weeks with zero downtime via dual-write + replay.`,
    speaker_note: 'Show that "best technically" lost to "best for the team to operate." That signals real judgment.',
  },
  {
    slug: 'b-customer-obsession',
    title: 'Tell me about a time you went above and beyond for a customer.',
    category: 'behavioral', framework: 'STAR', tags: 'customer-obsession',
    answer_md: `- **Situation.** Top-10 customer hit a data export bug 24h before their board meeting.
- **Task.** Get them their export without compromising other customers.
- **Action.** Ran a one-off backfill script in a sandbox copy of their tenant, validated against their schema, joined a Slack-shared incident bridge with their CTO, delivered the file in 3 hours, then opened a PR for a permanent fix.
- **Result.** Customer kept the account ($1.4M ARR). The fix shipped to all customers the next week.`,
  },
  {
    slug: 'b-failure-data',
    title: 'Tell me about a time data changed your mind.',
    category: 'behavioral', framework: 'STAR', tags: 'data-driven',
    answer_md: `- **Situation.** I was sure adding social proof to the signup page would lift conversion.
- **Task.** Validate before shipping.
- **Action.** Ran a 2-week 50/50 A/B with ~80k visitors. The variant lost by 1.8% at p < 0.01.
- **Result.** Killed the feature. Found via session replay that the testimonial widget was crowding the CTA on small screens. Re-tested a single-line version → won by 2.3%.`,
  },
  {
    slug: 'b-learning',
    title: 'Tell me about something you taught yourself recently.',
    category: 'behavioral', framework: 'STAR', tags: 'learning',
    answer_md: `**Headline.** Picked up Rust in 6 weeks to rewrite a perf-critical data ingestion path.

- Cycle 1 (week 1): read the book, built a toy parser. Hit lifetime errors hard.
- Cycle 2 (weeks 2–3): rewrote a small Go service in Rust, learned to think in ownership.
- Cycle 3 (weeks 4–6): replaced the production ingester. Throughput up 4×, p99 down 60%, memory down 70%.

**Pattern I use.** Tiny project → real project → production. Every cycle, ship something measurable.`,
  },
  {
    slug: 'b-feedback',
    title: 'Tell me about a time you received tough feedback.',
    category: 'behavioral', framework: 'STAR', tags: 'feedback,growth',
    answer_md: `- **Situation.** My skip-level said in a 360 that I "ran over people in design reviews."
- **Task.** Take it seriously without overcorrecting.
- **Action.** Asked for 3 specific examples, video-watched a recording of my last review, noticed I cut speakers off ~5x in 45 minutes. Started using a "I'll write my reaction in the doc, you keep going" rule.
- **Result.** Next review cycle: peers explicitly called out the change. Decision quality went up — 2 of the next 3 design reviews flipped on a junior engineer's input I'd previously have stepped on.`,
  },
  {
    slug: 'b-impact-no-authority',
    title: 'Tell me about a time you had to influence without authority.',
    category: 'behavioral', framework: 'STAR', tags: 'influence,leadership',
    answer_md: `- **Situation.** Saw 4 teams duplicating an auth client; each had subtle bugs.
- **Task.** Convince them to consolidate without owning the project.
- **Action.** Wrote a 1-page brief showing the 4 incidents traced to those clients, prototyped a shared SDK in 3 days, ran a demo with each team's tech lead 1:1, let them self-volunteer.
- **Result.** 3 of 4 teams adopted in the next quarter. Auth-related incidents dropped from ~1/month to 0 over the next 6 months.`,
  },

  // ===== CODING =====
  {
    slug: 'c-two-sum',
    title: 'Two Sum — find two indices summing to a target.',
    category: 'coding', framework: 'Hash map', tags: 'array,hash',
    answer_md: `**Approach.** One pass with a hash map of value → index. For each \`x\`, check if \`target - x\` is in the map.

\`\`\`
for i, x in enumerate(nums):
    if target - x in seen:
        return [seen[target - x], i]
    seen[x] = i
\`\`\`

**Complexity.** Time O(n), space O(n). Single pass.

**Edge cases.** Duplicates (\`[3,3]\`, target 6 — works because we look up *before* inserting). Negative numbers — fine. No solution — return \`[]\` or raise.`,
  },
  {
    slug: 'c-lru',
    title: 'Implement an LRU cache with O(1) get/put.',
    category: 'coding', framework: 'Hash + doubly-linked list', tags: 'cache,design',
    answer_md: `**Data structure.** Hash map (key → node) + doubly-linked list (most-recent at head, evict at tail).

- \`get(key)\` — hash lookup, splice node to head, return value.
- \`put(key, val)\` — if exists, update + move to head. If not and at capacity, drop tail and remove from map. Insert new node at head.

**Why this works.** Hash gives O(1) lookup; linked list gives O(1) reorder once you have the node pointer.

**Complexity.** O(1) for both ops. O(capacity) space.

**In practice.** Python's \`OrderedDict\` does this for you (\`move_to_end\`, \`popitem(last=False)\`).`,
  },
  {
    slug: 'c-valid-parens',
    title: 'Validate balanced parentheses.',
    category: 'coding', framework: 'Stack', tags: 'string,stack',
    answer_md: `**Approach.** Stack. Push openers, on a closer pop and check it matches.

\`\`\`
pairs = {')':'(', ']':'[', '}':'{'}
stack = []
for c in s:
    if c in '([{': stack.append(c)
    elif not stack or stack.pop() != pairs[c]: return False
return not stack
\`\`\`

**Complexity.** Time O(n), space O(n).

**Edge cases.** Empty string → True. Only closers (\`")"\`) → False. Trailing openers (\`"("\`) → False because stack non-empty at end.`,
  },
  {
    slug: 'c-top-k',
    title: 'Top K frequent elements.',
    category: 'coding', framework: 'Heap / bucket sort', tags: 'array,heap',
    answer_md: `**Two solid approaches:**

**Heap — O(n log k).** Count frequencies, push into a min-heap of size k.
\`\`\`
freq = Counter(nums)
return heapq.nlargest(k, freq, key=freq.get)
\`\`\`

**Bucket sort — O(n).** Buckets[i] holds elements with frequency i. Walk from high to low.

**When to use which.** Heap is the right call almost always. Bucket sort is only worth it when k ≈ n or you genuinely care about the constant factor.`,
  },
  {
    slug: 'c-merge-intervals',
    title: 'Merge overlapping intervals.',
    category: 'coding', framework: 'Sort + sweep', tags: 'array,sort',
    answer_md: `**Approach.** Sort by start. Walk; if next.start ≤ current.end, extend; else push current and reset.

\`\`\`
intervals.sort()
out = [intervals[0]]
for s, e in intervals[1:]:
    if s <= out[-1][1]: out[-1][1] = max(out[-1][1], e)
    else: out.append([s, e])
\`\`\`

**Complexity.** Time O(n log n) from the sort, space O(1) extra (or O(n) for output).

**Watch.** Strict vs non-strict overlap (\`<\` vs \`<=\`) — clarify with the interviewer.`,
  },
  {
    slug: 'c-bst-validate',
    title: 'Validate a Binary Search Tree.',
    category: 'coding', framework: 'Recursion with bounds', tags: 'tree,recursion',
    answer_md: `**Wrong answer.** "Each node > left child, < right child." Fails on grandchildren that violate global ordering.

**Right answer.** Pass \`(low, high)\` bounds down.

\`\`\`
def valid(node, low=-inf, high=inf):
    if not node: return True
    if not (low < node.val < high): return False
    return valid(node.left, low, node.val) and valid(node.right, node.val, high)
\`\`\`

**Complexity.** Time O(n), space O(h) for the call stack (h = tree height).

**Alternative.** In-order traversal must be strictly increasing — same complexity, slightly easier to get wrong on duplicates.`,
  },
  {
    slug: 'c-word-break',
    title: 'Word break — can string s be split into dictionary words?',
    category: 'coding', framework: 'DP', tags: 'string,dp',
    answer_md: `**Approach.** \`dp[i]\` = can \`s[:i]\` be segmented? \`dp[0] = True\`. For each \`i\`, scan back over each word \`w\`; if \`s[i-len(w):i] == w\` and \`dp[i-len(w)]\`, set \`dp[i] = True\`.

\`\`\`
words = set(wordDict)
dp = [False] * (len(s) + 1)
dp[0] = True
for i in range(1, len(s)+1):
    for w in words:
        if i >= len(w) and dp[i-len(w)] and s[i-len(w):i] == w:
            dp[i] = True; break
return dp[-1]
\`\`\`

**Complexity.** Time O(n · m · k) where m = dict size, k = avg word len. Trie-based variant gets it down further.`,
  },
  {
    slug: 'c-streaming-median',
    title: 'Find the median of a stream of integers.',
    category: 'coding', framework: 'Two heaps', tags: 'heap,design',
    answer_md: `**Approach.** Two heaps:
- \`lo\` = max-heap of the lower half
- \`hi\` = min-heap of the upper half
- Keep \`|lo| - |hi| ∈ {0, 1}\`.

**Insert.** Push to \`lo\`, then move \`lo\`'s top to \`hi\`. If \`|hi| > |lo|\`, move \`hi\`'s top back.

**Median.** If sizes equal, average the tops. Else top of \`lo\`.

**Complexity.** Insert O(log n). Median O(1). Space O(n).`,
  },
  {
    slug: 'c-rate-limiter',
    title: 'Design a rate limiter (e.g. 100 req / 60s per user).',
    category: 'coding', framework: 'Sliding window / token bucket', tags: 'design,concurrency',
    answer_md: `**Two common algorithms:**

**Token bucket.** Refill \`r\` tokens per second up to capacity \`c\`. On request, decrement; if zero, reject. Smooth bursts up to \`c\`.

**Sliding window log.** Store request timestamps in Redis (\`ZADD\`). On request, drop entries older than 60s, count remaining, accept if < limit. Memory is O(limit) per user.

**Real-world choice.** Token bucket if you have many users (cheap state). Sliding-window if you need exact accuracy in a regulatory context.

**Distributed concern.** Pin user → shard so the counter is local. If you must coordinate, Redis Lua scripts to make the check-and-decrement atomic.`,
  },

  // ===== SYSTEM DESIGN =====
  {
    slug: 's-url-shortener',
    title: 'Design a URL shortener (bit.ly).',
    category: 'system', framework: 'Scaling estimates', tags: 'storage,scaling',
    answer_md: `**Scope.** 100M new URLs/day, 10:1 read/write, 5-year retention.

**API.** \`POST /shorten\` → \`{long_url}\` returns \`{short_url}\`. \`GET /:code\` → 301 redirect.

**ID strategy.** Pre-generate codes from a base62 counter (Snowflake or a sharded counter). 7 chars → 62^7 ≈ 3.5T URLs. Avoid hashing the long URL (collisions, no clean deletion).

**Storage.** Postgres or DynamoDB, partition by code. Read path is a hot key-value lookup — cache in Redis (~95% hit ratio for a Zipfian workload).

**Bottleneck.** Read QPS at peak. Solve with Redis cluster + read replicas.

**Edge cases.** Custom aliases (separate UNIQUE check). Expired URLs (TTL field). Abuse (block-list + per-user rate limit).`,
  },
  {
    slug: 's-news-feed',
    title: 'Design a news feed (Twitter / Instagram).',
    category: 'system', framework: 'Push vs pull', tags: 'feed,scaling',
    answer_md: `**Two models:**

- **Pull (fan-out on read).** Read time: query each followee, merge, sort. Cheap writes; expensive reads. Good for users with many followees.
- **Push (fan-out on write).** Each post fanned out to follower inboxes at write time. Cheap reads; expensive writes for celebrities.

**Hybrid.** Push for the long tail, pull for celebrities (anyone with > 1M followers). Merge at read time.

**Storage.** Posts in a wide-column store (Cassandra, Bigtable). Inbox = sorted list per user, capped at ~1000 entries.

**Bottleneck.** Celebrity fan-out. Solution: pull on read for them and rate-limit the cache invalidation.

**Ranking.** Reverse-chrono first; layer in ML later. Don't conflate the two.`,
  },
  {
    slug: 's-payment-idempotency',
    title: 'Design idempotent payment processing.',
    category: 'system', framework: 'Idempotency keys', tags: 'payments,reliability',
    answer_md: `**Problem.** Client retries on network errors must not double-charge.

**Solution.** Idempotency key supplied by the client (UUID per intent). Server stores \`{key → result}\` in a \`payment_intents\` table with a UNIQUE constraint.

**State machine.** \`pending → succeeded | failed\`. The first request creates the row in \`pending\` and acquires the work; retries either get the in-flight result or wait briefly.

**Atomicity.** Use the DB's INSERT ... ON CONFLICT to make the create-or-fetch atomic.

**Retention.** Keep keys for 24h. After that, the same key is a fresh request.

**Watch.** Different request body with the same key → reject with 409. Otherwise replays of a slightly different request can leak state across users.`,
  },
  {
    slug: 's-chat',
    title: 'Design a real-time chat system (1:1 + group).',
    category: 'system', framework: 'WS + pub-sub', tags: 'chat,scaling',
    answer_md: `**Connection.** Persistent WebSocket per client to an edge gateway. Gateway is stateless; user → connection map lives in Redis.

**Delivery.** Send → write to message store (Cassandra or DynamoDB, partition by chat_id), publish on a per-chat channel. Recipients subscribed via gateway get pushed.

**Offline.** Push to APNs/FCM. On reconnect, the client requests messages > last_seen_id.

**Group chats.** Same primitive — chat_id channel; fan-out happens at publish.

**Ordering.** Per-chat monotonic id (sequence on the chat row). Clients sort locally.

**Bottleneck.** Hot rooms (1M+ users). Use sharded channels and a separate fan-out service.`,
  },
  {
    slug: 's-file-storage',
    title: 'Design a file storage / Dropbox-like service.',
    category: 'system', framework: 'Object storage + metadata', tags: 'storage,sync',
    answer_md: `**Two planes.**
- **Data plane.** Blobs in S3 / GCS, content-addressed (sha256 → object). Dedup falls out for free.
- **Metadata plane.** \`files (id, user_id, path, version, blob_hash, mtime, deleted)\` in Postgres / Spanner.

**Sync.** Client computes hash per chunk (4-MB chunks), uploads only missing chunks, updates metadata. Conflict resolution = last-writer-wins per path with version vectors for collaborative cases.

**Sharing.** ACL row per (file, principal, permission). Resolve at read time.

**Bottleneck.** Metadata DB on path lookups. Index by (user_id, path).`,
  },
  {
    slug: 's-distributed-counter',
    title: 'Design a distributed view counter (10M views/sec).',
    category: 'system', framework: 'Sharding + flush', tags: 'counters,scaling',
    answer_md: `**Naive approach fails.** Single row + UPDATE → row-level contention.

**Pattern.** Per-host in-memory counter, flushed to a Redis bucket every 1s. Redis flushes to durable storage every 10s. Reads return the warm Redis value.

**Sharding.** Shard the counter by hash(content_id) → N counters, sum on read. N ~= peak QPS / 100k.

**Trade-off.** Eventual consistency: reads can lag by ~10s. Almost always acceptable for analytics.

**For exact counts (e.g. billing).** Use Kafka with at-least-once delivery + idempotent consumer keyed on event_id.`,
  },

  // ===== PRODUCT =====
  {
    slug: 'p-feature-design',
    title: 'Design a feature to improve [product] retention.',
    category: 'product', framework: 'CIRCLES', tags: 'feature,retention',
    answer_md: `**Customer.** Pick 1 segment with the biggest churn delta. E.g., new users who don't return after day 7.

**Insight.** From the data: they never reach the "aha" event (e.g., second meaningful action).

**Idea.** Onboarding nudge that surfaces the aha action in-product on day 1, not day 5.

**Restrict.** Rule out anything that touches the data model in v1; ship inside the existing onboarding shell.

**Critique.** Risk: notification fatigue → soft in-app cards, not pushes. Risk: feels paternalistic → make it dismissible and personalized.

**List.** v1: in-app card on day 1. v2: personalized based on signup intent. v3: ML-ranked next-best-action.

**Evaluate.** D7 retention as primary; secondary = next-step completion within 24h.`,
    speaker_note: 'CIRCLES is the standard PM framework. Pick one segment, one insight, one idea — don\'t spray.',
  },
  {
    slug: 'p-prioritize',
    title: 'How would you prioritize features for a new product?',
    category: 'product', framework: 'RICE', tags: 'prioritization',
    answer_md: `**Framework.** RICE — Reach × Impact × Confidence ÷ Effort.

**Process.**
1. List candidates with rough estimates per axis.
2. Sort. Look at the top 5.
3. Stress-test confidence — anything below 70% goes into a discovery spike, not the build queue.
4. Add a strategic adjacency check: does this open a door for the next 2 features?

**Anti-patterns.**
- Letting the loudest customer dominate.
- Treating effort as fixed when scope is the lever.
- Confusing reach (how many) with impact (how much per).`,
  },
  {
    slug: 'p-metric',
    title: 'What\'s the right north star metric for [product]?',
    category: 'product', framework: 'Activity × Value', tags: 'metrics',
    answer_md: `**Test.** A north star metric must be: (1) tied to user value, (2) measurable weekly, (3) movable by your team.

**Example: Spotify.** Time-spent-listening, not signups. Listening = the value moment.

**Example: Airbnb.** Nights-booked, not GMV. Captures both supply and demand sides.

**For an early product.** Pick activation (got to first value) over revenue. Revenue lags too much to course-correct on.

**Watchout.** A single metric is a target; layer it with 2-3 guardrails (e.g., NPS, refund rate) so you don't optimize the headline at the expense of trust.`,
  },
  {
    slug: 'p-ab-test',
    title: 'How do you decide if an A/B test won?',
    category: 'product', framework: 'Stats + decision', tags: 'experimentation',
    answer_md: `**Three checks before celebrating.**

1. **Statistical significance.** p < 0.05 and the test ran the pre-declared duration (no peeking).
2. **Practical significance.** Is the effect size big enough to justify the maintenance cost?
3. **Cohort sanity.** Does the lift hold across segments (mobile vs desktop, new vs existing)? A win that's all driven by one outlier cohort is suspect.

**Plus negative tests.** Did you instrument any guardrails? Did they degrade?

**If borderline.** Run it longer or kill it. "Borderline + ship anyway" is how you ship neutral features that complicate the codebase.`,
  },
  {
    slug: 'p-growth',
    title: 'How would you 5x signups in a quarter?',
    category: 'product', framework: 'Loops', tags: 'growth',
    answer_md: `**Don't list channels — find the loop.** Sustainable growth needs a loop where output (new users) feeds input (more new users).

**Audit current loops.**
- Viral (users invite users): is sharing core to value?
- Content / SEO (users create content that ranks): does the core action produce indexable artifacts?
- Paid (revenue funds acquisition): is LTV/CAC > 3?

**Pick one to 10x.** Spreading across all three usually 1.2x's all of them.

**Then layer.** Once one loop is healthy, layer the second.

**Anti-pattern.** Growth hacks that don't compound — referral bonuses without a real share moment, paid spend on a leaky funnel.`,
  },
  {
    slug: 'p-tradeoff',
    title: 'You can ship a fast feature or a polished one. Which?',
    category: 'product', framework: 'Reversibility', tags: 'judgment',
    answer_md: `**Default: ship fast, learn, iterate.** Most features fail. Polish before learning is sunk cost.

**Exception 1: trust-critical surfaces.** Money, safety, identity. Polished or don't ship. A buggy auth flow doesn't get a v2 because the user already left.

**Exception 2: one-way doors.** APIs you can't change once partners build on them. Schemas. URL structures. Polish those.

**Default rule of thumb.** If you can deprecate it cleanly in 6 months, ship fast. If you can't, slow down.`,
  },

  // ===== DATA / ML =====
  {
    slug: 'd-fraud',
    title: 'Detect payment fraud on a sparse, imbalanced dataset.',
    category: 'data', framework: 'ML pipeline', tags: 'fraud,classification',
    answer_md: `**Imbalance handling.** Don't naively undersample — you'll lose signal. Two better moves:
- **Class weights** in the loss (cheap, usually enough).
- **Focal loss** if there's a hard subset.

**Threshold tuning.** Optimize for precision-at-recall, not F1. Fraud teams care about "catch X% of fraud at Y% review rate."

**Features.** Velocity features (n txns last 1h, 24h, 7d), graph features (shared device, shared card across accounts), deviation from per-user baseline.

**Evaluation.** PR-AUC, not ROC-AUC (ROC is misleading at 1% positive rate).

**Production.** Shadow score for 2 weeks against the existing rules engine before turning the model on.

**Drift.** Fraud is adversarial — retrain weekly, monitor feature distributions daily.`,
  },
  {
    slug: 'd-recsys',
    title: 'Design a recommender system.',
    category: 'data', framework: 'Two-stage', tags: 'recsys,ml',
    answer_md: `**Two-stage architecture.**
- **Candidate generation.** Reduce the catalog (millions) to ~1000 candidates per user. Two-tower neural model or matrix factorization. Fast.
- **Ranking.** Rich features per (user, item) pair, gradient-boosted trees or DLRM. Slow but only on 1000 items.

**Features.** User: history, demographics, recency. Item: popularity, content embeddings. Cross: past interactions with similar items.

**Cold start.** Content-based fallback for new items. For new users — popularity by their declared preferences.

**Eval.** Offline: NDCG, recall@k. Online: A/B on the headline metric (CTR, retention). Online wins.

**Diversity / fairness.** Re-rank to enforce constraints (e.g., no more than 30% of recs from one creator) — tune against the headline KPI.`,
  },
  {
    slug: 'd-churn',
    title: 'Predict customer churn — what would you build?',
    category: 'data', framework: 'Classification + interventions', tags: 'churn',
    answer_md: `**Definition first.** What is churn? Cancel? Inactivity for N days? Decide before modeling.

**Label.** Binary at end-of-window (e.g., "churned within 30 days").

**Features.** Engagement (sessions, time-on-task), product-fit (depth of feature use), commercial (plan, MRR, support tickets), tenure.

**Model.** Gradient-boosted trees first. Deep nets only if you have lots of sequential signal and sufficient data.

**Output that drives action.** Don't ship a churn score in isolation — pair it with the top-K reasons (SHAP) and the team that owns each lever (CS, product, billing).

**Eval.** Lift curve in the top decile. "How much more accurate is the top-10% model-flagged segment vs random?" That's what success ops cares about.`,
  },
  {
    slug: 'd-metrics',
    title: 'When do you use precision, recall, F1, AUC?',
    category: 'data', framework: 'Classification metrics', tags: 'metrics,ml',
    answer_md: `**Precision.** Of the things I flagged, how many were right? Use when false positives are expensive (spam → user trust).

**Recall.** Of the things that were positive, how many did I catch? Use when false negatives are expensive (cancer screening, fraud).

**F1.** Harmonic mean. Use when both matter and classes are roughly balanced.

**ROC-AUC.** Threshold-independent. Misleading on imbalanced data — flatters the model.

**PR-AUC.** Better for imbalanced (1% positive rate). Use this for fraud, churn, ad-click.

**The real answer.** Pick the metric that matches the *business decision*, not the textbook. Often that's "precision at recall = X%" — the operating point the team will actually run at.`,
  },

  // ===== SPECIALIZED =====
  {
    slug: 'x-why-company',
    title: 'Why this company?',
    category: 'specialized', framework: 'Company × you', tags: 'fit',
    answer_md: `**Three-part answer.**

1. **One specific thing about the company** — a recent product launch, an engineering blog post, a value, a market position. Show you read.
2. **One specific thing about the role** — the team's charter, the problem space, the level you'd operate at.
3. **Why you're a fit right now** — what you'd bring in the first 90 days that someone else wouldn't.

**Anti-pattern.** "I love your products" with no specifics. Interviewers can sniff a generic answer in 10 seconds.

**Tip.** End with a question that shows you've already started thinking like an employee: "Is the [team] still scoped to [X] or has that broadened?"`,
  },
  {
    slug: 'x-weakness',
    title: 'What\'s your biggest weakness?',
    category: 'specialized', framework: 'Honest + actionable', tags: 'self-awareness',
    answer_md: `**The trap.** "I work too hard." Don't. Interviewers grade you on self-awareness.

**Format.** Real weakness → impact it had → what you're doing about it → evidence of progress.

**Example.** "I default to writing things up rather than talking through them. Early on this slowed decisions because async docs took 2 days to circulate. I now run a 30-min sync up-front when the topic is contentious, and only doc after. Cycle time on cross-team decisions dropped from ~5 days to ~1.5."

**Pick something real.** Trivial fake weaknesses are worse than honest ones.`,
  },
  {
    slug: 'x-salary',
    title: 'What are your salary expectations?',
    category: 'specialized', framework: 'Defer or anchor', tags: 'negotiation',
    answer_md: `**If you can defer.** "I'd like to learn more about the role and team before discussing compensation. Could you share the band for this level?"

**If pressed.** Anchor at the high end of your researched range — Levels.fyi, Glassdoor, your network. Always quote total comp (base + equity + bonus), not just base.

**Avoid.** Giving your current salary. In most US states recruiters can't even legally ask.

**If you have a competing offer.** Mention it once. Don't bluff one.

**At offer time.** Ask for ~15% more than the offer. The worst case is they say no. The best case is +$30-50k/year for a 30-second ask.`,
  },
  {
    slug: 'x-questions-for-us',
    title: 'Do you have any questions for us?',
    category: 'specialized', framework: 'Show signal', tags: 'closing',
    answer_md: `**Always have at least 3.** "No" reads as disinterested.

**The signal-rich questions:**
- "What does success look like in this role at the 6-month mark?" (shows you're already thinking outcome-first)
- "What's the biggest open problem the team is working on right now?" (shows you want to do real work)
- "What would surprise me about the team that I wouldn't see from outside?" (forces an honest answer)

**Avoid.** Stuff easily Googled (HQ location, employee count). Compensation in early rounds. Anything that signals you're optimizing for comfort over impact.

**The closer.** "Is there anything about my background that gives you pause? I'd love a chance to address it." High-leverage; turns hesitations into a conversation, not a silent rejection.`,
  },
];
