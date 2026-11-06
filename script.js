const LEAD_ENDPOINT = 'https://lead-relay.leestygpt.workers.dev/lead/QPM3S2LB4K';

(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const hasGsap = !!window.gsap && !!window.ScrollTrigger;
  const ruNum = n => Math.round(n).toLocaleString('ru-RU');

  $('#year').textContent = new Date().getFullYear();

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!reduce && window.Lenis && hasGsap) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const goTo = target => {
    if (lenis) lenis.scrollTo(target, { offset: -64, duration: 1.4 });
    else window.scrollTo({ top: target.getBoundingClientRect().top + scrollY - 64, behavior: reduce ? 'auto' : 'smooth' });
  };

  /* ---------- header ---------- */
  const header = $('#header'), burger = $('#burger'), nav = $('#nav');
  let lastY = 0;
  const onScrollHeader = () => {
    const y = scrollY;
    header.classList.toggle('scrolled', y > 8);
    header.classList.toggle('hide', y > lastY && y > 400 && !nav.classList.contains('is-open'));
    lastY = y;
  };
  addEventListener('scroll', onScrollHeader, { passive: true });
  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('is-open');
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
  });
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href.length < 2) return;
    const t = $(href);
    if (!t) return;
    e.preventDefault();
    burger.classList.remove('is-open'); nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false');
    goTo(t);
  }));

  /* ---------- goals accordion ---------- */
  $$('.goal').forEach(li => {
    const b = $('.goal__b', li);
    b.addEventListener('click', () => {
      const open = !li.classList.contains('is-open');
      $$('.goal').forEach(o => { o.classList.remove('is-open'); $('.goal__b', o).setAttribute('aria-expanded', 'false'); });
      if (open) { li.classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); }
      if (window.ScrollTrigger) setTimeout(() => ScrollTrigger.refresh(), 650);
    });
  });

  /* ---------- format picker (the live thing) ---------- */
  const FORMATS = {
    food: { name: 'Корректировка питания', price: 7500, day: 'Первая консультация бесплатно', list: [
      'Бесплатная консультация и анкета', 'Баланс белков, жиров и углеводов', 'Ваша суточная калорийность', 'Принципы здорового питания', 'Рацион под вашу цель: дефицит, профицит или поддержание'] },
    train: { name: 'Программа тренировок', price: 7500, day: 'Первая консультация бесплатно', list: [
      'Бесплатная консультация', 'Анализы крови для безопасных нагрузок', 'Программа на неделю по вашему уровню, возрасту и здоровью', 'Рекомендации по выполнению упражнений', 'Принципы результативных тренировок и периодизация'] },
    'food+train': { name: 'Питание + тренировки', price: 12000, day: 'Дешевле, чем по отдельности, на 3 000 ₽', list: [
      'Бесплатная консультация и анкета', 'БЖУ и калорийность под вашу цель', 'Рацион питания', 'Анализы крови', 'Индивидуальная программа тренировок', 'Принципы периодизации'] },
    lead1: { name: 'Ведение до результата, 1 месяц', price: 15000, day: '500 ₽ в день с личным контролем', list: [
      'Питание и тренировки в одной системе', 'Дополнительные мероприятия, которые ускоряют результат', 'Контроль результатов', 'Анкета, анализы и план с первого дня'] },
    lead3: { name: 'Ведение до результата, 3 месяца', price: 40000, day: '444 ₽ в день, на 5 000 ₽ выгоднее помесячной оплаты', list: [
      'Тот же формат ведения, что и на месяц', 'Питание и тренировки в одной системе', 'Дополнительные мероприятия и контроль результатов', 'Три месяца работы над одной целью'] }
  };
  const resName = $('#resName'), resPrice = $('#resPrice'), resDay = $('#resDay'), resList = $('#resList');
  const priceState = { v: 12000 };
  let current = 'food+train';
  const renderFormat = key => {
    const f = FORMATS[key]; if (!f) return;
    current = key;
    resName.textContent = f.name;
    resDay.textContent = f.day;
    resList.innerHTML = f.list.map(t => `<li>${t}</li>`).join('');
    if (hasGsap && !reduce) {
      gsap.killTweensOf(priceState);
      gsap.to(priceState, { v: f.price, duration: 0.9, ease: 'power3.out', onUpdate: () => { resPrice.textContent = ruNum(priceState.v); } });
      gsap.fromTo($$('li', resList), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, ease: 'power3.out' });
    } else { priceState.v = f.price; resPrice.textContent = ruNum(f.price); }
  };
  $$('input[name="fmt"]').forEach(r => r.addEventListener('change', () => renderFormat(r.value)));
  $$('[data-pick]').forEach(a => a.addEventListener('click', () => {
    const r = $(`input[name="fmt"][value="${a.dataset.pick}"]`);
    if (r) { r.checked = true; renderFormat(r.value); }
  }));
  renderFormat('food+train');
  const fComment = $('#fComment');
  $('#resCta').addEventListener('click', () => {
    const f = FORMATS[current];
    const line = `Формат: ${f.name}, ${ruNum(f.price)} ₽.`;
    if (!fComment.value.trim() || fComment.value.startsWith('Формат:')) fComment.value = line + ' ';
  });

  /* ---------- scroll-driven states (no library needed) ---------- */
  const scene = $('.scene'), imgs = $$('.scene__img'), medals = $$('#medals li'), sceneBar = $('#sceneBar');
  const stepsEls = $$('#steps li'), procBody = $('.proc__body'), procBar = $('#procBar');
  const mqMobile = matchMedia('(max-width:900px)');
  let sceneIdx = -1;
  const setScene = i => {
    if (i === sceneIdx) return; sceneIdx = i;
    imgs.forEach((im, k) => im.classList.toggle('is-on', k === i));
    medals.forEach((m, k) => m.classList.toggle('is-on', k === i));
  };
  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = innerHeight;
    if (mqMobile.matches) {
      let idx = 0;
      medals.forEach((m, k) => { if (m.getBoundingClientRect().top < vh * 0.62) idx = k; });
      setScene(idx);
    } else {
      const r = scene.getBoundingClientRect();
      const p = clamp(-r.top / (r.height - vh), 0, 1);
      setScene(Math.min(imgs.length - 1, Math.floor(p * imgs.length)));
      sceneBar.style.transform = `scaleX(${p})`;
    }
    stepsEls.forEach(li => { if (li.getBoundingClientRect().top < vh * 0.72) li.classList.add('is-on'); });
    const pr = procBody.getBoundingClientRect();
    procBar.style.transform = `scaleY(${clamp((vh * 0.72 - pr.top) / pr.height, 0, 1)})`;
  };
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', req);
  update();

  /* ---------- phone mask + form ---------- */
  $$('input[type="tel"]').forEach(input => input.addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.startsWith('8')) v = '7' + v.slice(1);
    if (!v.startsWith('7')) v = '7' + v;
    v = v.slice(0, 11);
    let out = '+7';
    if (v.length > 1) out += ' (' + v.slice(1, 4);
    if (v.length >= 4) out += ') ' + v.slice(4, 7);
    if (v.length >= 7) out += '-' + v.slice(7, 9);
    if (v.length >= 9) out += '-' + v.slice(9, 11);
    e.target.value = out;
  }));
  const form = $('#leadForm'), formOk = $('#formOk');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = $('button[type="submit"]', form), label = $('span', btn), orig = label.textContent;
    const p = {}; new FormData(form).forEach((v, k) => { p[k] = v; });
    if (p._gotcha) return;
    formOk.hidden = false;
    if (!p.name.trim() || p.phone.replace(/\D/g, '').length < 11) { formOk.textContent = 'Укажите имя и телефон полностью.'; return; }
    btn.disabled = true; label.textContent = 'Отправляем...'; formOk.hidden = true;
    try {
      const r = await fetch(LEAD_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      form.reset(); formOk.hidden = false;
      formOk.textContent = 'Заявка отправлена. Я свяжусь с вами в ближайшее время.';
    } catch (err) {
      formOk.hidden = false; formOk.textContent = 'Не получилось отправить. Напишите мне в Telegram или WhatsApp.';
    } finally { setTimeout(() => { label.textContent = orig; btn.disabled = false; }, 2500); }
  });

  /* ---------- GSAP layer ---------- */
  if (!hasGsap || reduce) return;
  gsap.registerPlugin(ScrollTrigger);

  // split headlines into masked words
  $$('[data-split]').forEach(el => {
    const text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.innerHTML = text.split(/\s+/).map(w => `<span class="w" aria-hidden="true"><span class="wi">${w}</span></span>`).join(' ');
  });

  // hero intro
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl.from('.hero__h1 .wi', { yPercent: 118, duration: 1.2, stagger: 0.09 })
    .from('[data-hero-fade]', { y: 28, opacity: 0, duration: 0.9, stagger: 0.12 }, '-=0.7')
    .from('.hero__frame', { clipPath: 'inset(100% 0 0 0)', duration: 1.5, ease: 'expo.out' }, 0.15)
    .from('.hero__frame img', { scale: 1.35, duration: 1.8, ease: 'expo.out' }, 0.15)
    .from('.bib', { x: -40, opacity: 0, duration: 0.9 }, 0.9);
  const bib = { n: 0 }, bibN = $('#bibN');
  gsap.to(bib, { n: 113, duration: 1.8, delay: 1.0, ease: 'power2.out', onUpdate: () => { bibN.textContent = Math.round(bib.n); }, onStart: () => { bibN.textContent = '0'; } });

  // hero photo parallax
  gsap.to('.hero__frame img', { yPercent: -9, ease: 'none', scrollTrigger: { trigger: '.hero__photo', start: 'top 20%', end: 'bottom top', scrub: true } });
  gsap.to('.hero__text', { y: -50, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // counters
  $$('.count').forEach(el => {
    const to = +el.dataset.to, o = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: 'top 95%', once: true, onEnter: () => {
      gsap.to(o, { v: to, duration: 1.8, delay: 0.5, ease: 'power3.out', onStart: () => { el.textContent = '0'; }, onUpdate: () => { el.textContent = Math.round(o.v); } });
    } });
  });

  // headings below the fold
  $$('[data-split]').forEach(el => {
    if (el.classList.contains('hero__h1')) return;
    gsap.from($$('.wi', el), { yPercent: 115, duration: 1.1, stagger: 0.06, ease: 'power4.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });

  // paragraph / block entrances
  $$('[data-r]').forEach(el => gsap.from(el, { y: 32, opacity: 0, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 90%', once: true } }));
  ScrollTrigger.batch('.goal, .opt, details, .contacts a, .fld, .rv__item', {
    start: 'top 92%', once: true,
    onEnter: els => gsap.from(els, { y: 44, opacity: 0, duration: 0.9, stagger: 0.09, ease: 'power3.out', overwrite: true })
  });

  // scene photo drift
  gsap.fromTo('.scene__pics', { yPercent: 6 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.scene', start: 'top bottom', end: 'top top', scrub: true } });

  // result panel pop when it scrolls into view
  gsap.from('.res', { y: 60, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.res', start: 'top 92%', once: true } });

  // city ticker, speeds up with scroll velocity
  const row = $('.ticker__row');
  row.innerHTML += row.innerHTML;
  const loop = gsap.to(row, { xPercent: -50, duration: 38, ease: 'none', repeat: -1 });
  ScrollTrigger.create({ onUpdate: self => {
    const v = clamp(Math.abs(self.getVelocity()) / 220, 0, 7);
    gsap.to(loop, { timeScale: 1 + v, duration: 0.25, overwrite: true });
    gsap.to(loop, { timeScale: 1, duration: 1.1, delay: 0.25 });
  } });
  gsap.from('.ticker', { clipPath: 'inset(0 100% 0 0)', duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '.ticker', start: 'top 92%', once: true } });

  // footer name rises
  gsap.fromTo('#footName', { yPercent: 40 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: true } });

  // magnetic buttons
  if (fine) $$('[data-magnet]').forEach(el => {
    const xt = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const yt = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      xt((e.clientX - r.left - r.width / 2) * 0.22);
      yt((e.clientY - r.top - r.height / 2) * 0.35);
    });
    el.addEventListener('pointerleave', () => { xt(0); yt(0); });
  });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
