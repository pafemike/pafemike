(function () {
  let step = 1;
  const TOTAL = 3;
  const stepPill = document.getElementById('stepPill');
  const continueBtn = document.getElementById('continueBtn');
  const stepsEls = document.querySelectorAll('.wizard-step');
  const wizard = document.getElementById('wizard');
  const live = document.getElementById('live');

  function setStep(n) {
    step = Math.min(Math.max(1, n), TOTAL);
    stepPill.textContent = `STEP ${step} / ${TOTAL}`;
    stepsEls.forEach(el => el.classList.toggle('active', Number(el.dataset.step) === step));
    continueBtn.textContent = step === TOTAL ? 'Go live →' : 'Continue →';
  }

  continueBtn.addEventListener('click', () => {
    if (step < TOTAL) setStep(step + 1);
    else goLive();
  });

  // template card selection (step 1)
  document.querySelectorAll('.tile.select').forEach(t => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.tile.select').forEach(x => x.classList.remove('chosen'));
      t.classList.add('chosen');
    });
  });

  // category chips (step 1) — filter visually
  document.querySelectorAll('.chips .chip').forEach(c => {
    c.addEventListener('click', () => {
      document.querySelectorAll('.chips .chip').forEach(x => x.classList.remove('active'));
      c.classList.add('active');
    });
  });

  // step 3 go-live button
  const goBtn = document.getElementById('goLive');
  if (goBtn) goBtn.addEventListener('click', goLive);

  function goLive() {
    wizard.classList.add('hidden');
    live.classList.remove('hidden');
    stepPill.textContent = '● LIVE';
    stepPill.classList.add('live-pill');
    continueBtn.classList.add('hidden');
    simulateTranscript();
  }

  // ===== live screen behaviour =====
  const ANSWERS = {
    short: `<p>Led the Q4 Acme checkout rewrite. Shipped 3 days early, latency -38%, conversion +12%.</p>`,
    full: `<p><b>STAR — Q4 Acme launch (38% latency cut, +12% conversion)</b></p>
      <ul>
        <li><b>Situation:</b> Cross-team checkout rewrite, 2-week runway, 4 engineers blocked.</li>
        <li><b>Task:</b> Own delivery; unblock the team without slipping scope.</li>
        <li><b>Action:</b> Parallelized risk burn-down, 10-min daily stand-ups, paired with the SRE lead on the rollout plan.</li>
        <li><b>Result:</b> Shipped 3 days early, latency down 38%, conversion +12%, zero rollback.</li>
      </ul>
      <p class="muted small">Tip: lead with the <b>result</b>, then walk back through STAR if probed.</p>`,
    bullets: `<ul>
      <li>Owned a 2-week checkout rewrite at Acme.</li>
      <li>Unblocked 4 engineers via daily 10-min stand-ups.</li>
      <li>Shipped 3 days early; latency -38%; conversion +12%.</li>
      <li>Zero rollback; partnered tightly with SRE.</li>
    </ul>`
  };

  document.querySelectorAll('.live .seg-btn').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.live .seg-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      const ans = document.getElementById('answer');
      ans.style.opacity = .4;
      setTimeout(() => { ans.innerHTML = ANSWERS[b.dataset.len]; ans.style.opacity = 1; }, 250);
    });
  });

  const regen = document.getElementById('regen');
  if (regen) regen.addEventListener('click', () => {
    const ans = document.getElementById('answer');
    ans.style.opacity = .4;
    setTimeout(() => { ans.innerHTML = ANSWERS.full; ans.style.opacity = 1; }, 350);
  });

  const copyBtn = document.getElementById('copyAns');
  if (copyBtn) copyBtn.addEventListener('click', async () => {
    const text = document.getElementById('answer').innerText;
    try { await navigator.clipboard.writeText(text); copyBtn.textContent = '✓ Copied'; setTimeout(()=>copyBtn.textContent='⧉ Copy', 1200); } catch(e){}
  });

  const askBtn = document.getElementById('askBtn');
  const manualQ = document.getElementById('manualQ');
  if (askBtn) askBtn.addEventListener('click', () => {
    const v = manualQ.value.trim();
    if (!v) return;
    const t = document.getElementById('transcript');
    const p = document.createElement('p');
    p.className = 't-line';
    p.innerHTML = `<b>Interviewer:</b> ${v}`;
    t.appendChild(p);
    t.scrollTop = t.scrollHeight;
    manualQ.value = '';
    const ans = document.getElementById('answer');
    ans.style.opacity = .4;
    setTimeout(() => { ans.innerHTML = ANSWERS.full; ans.style.opacity = 1; }, 400);
  });

  const endBtn = document.getElementById('endSession');
  if (endBtn) endBtn.addEventListener('click', () => location.href = 'reports.html');

  function simulateTranscript() {
    const t = document.getElementById('transcript');
    if (!t) return;
    setTimeout(() => {
      const p = document.createElement('p');
      p.className = 't-line muted';
      p.innerHTML = `<i>(Aiyedrix listening…)</i>`;
      t.appendChild(p);
      t.scrollTop = t.scrollHeight;
    }, 1200);
  }

  // honor ?mode=coding|phone from dashboard tiles
  const params = new URLSearchParams(location.search);
  const mode = params.get('mode');
  if (mode === 'coding') document.querySelector('[data-template="coding"]')?.classList.add('chosen');
  if (mode === 'phone')  document.querySelector('[data-template="phone"]')?.classList.add('chosen');
})();
