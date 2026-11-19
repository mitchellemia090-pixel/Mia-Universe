import {createCollection, KEY, TOTAL, pageId, workId} from './puzzle-state.js';

const time = {first: 3, later: 1.7, grow: .38, fly: .65, interrupt: .23, reduced: .32};
const copy = {
  en: {
    title: 'Felt collection', save: 'Save picture', restart: 'A new journey', close: 'Close',
    start: 'Start puzzling', laterButton: 'Maybe later', retry: 'Retry image',
    cancel: 'Keep this round', confirm: 'Clear this round and draw a new picture?',
    first: 'Follow your curiosity. Collect nine pieces, then bring a little world together.',
    later: 'Another little piece to tuck away.',
    ready: 'All nine pieces are here. Bring your little world together.',
    complete: 'A little world, brought together by you.',
    count: n => 'Collected ' + n + ' / 9',
    remaining: n => n === 1 ? '1 piece left to find.' : n + ' pieces left to find.',
    placed: n => 'Placed ' + n + ' / 9',
    tray: 'Piece tray', help: 'Drag a piece, or select it and choose an empty space.',
    choose: 'Choose an empty space for the selected piece.',
    pick: 'Select a piece from the tray first.',
    miss: 'That piece does not fit there.',
    slot: (r, c) => 'Empty space, row ' + r + ', column ' + c,
    piece: n => 'Piece ' + n + ' in tray',
    preview: 'Touch and hold the image to save it.',
    error: 'The image could not be saved. Please try again.',
    load: 'The puzzle picture could not load. Retry to collect this piece.',
    loading: 'Loading the puzzle picture…',
  },
  zh: {
    title: '毛毡收集袋', save: '保存图片', restart: '开启新一轮', close: '关闭',
    start: '开始拼图', laterButton: '稍后再玩', retry: '重试加载',
    cancel: '保留本轮', confirm: '要清空本轮进度，抽取一张新图吗？',
    first: '每一次好奇，都在拼起一个小世界。收集九块，亲手拼出沿途的风景。',
    later: '又找到一块，先收进口袋。',
    ready: '碎片到齐了，来拼起你的小世界。',
    complete: '这一小片世界，是你亲手拼起来的。',
    count: n => '已收集 ' + n + ' / 9',
    remaining: n => '还差 ' + n + ' 块。',
    placed: n => '已放置 ' + n + ' / 9',
    tray: '碎片托盘', help: '拖动碎片，或先选中碎片，再选择空位。',
    choose: '请选择一个空位。',
    pick: '请先从托盘选一块碎片。',
    miss: '这块碎片无法放在这里。',
    slot: (r, c) => '第 ' + r + ' 行、第 ' + c + ' 列空位',
    piece: n => '托盘中的第 ' + n + ' 块碎片',
    preview: '长按图片即可保存。',
    error: '图片保存失败，请重试。',
    load: '拼图图片加载失败。重试后可领取碎片。',
    loading: '正在加载拼图图片…',
  },
};

let storage, tabStorage, useTabStorage = false;
try { storage = localStorage; } catch {}
try {
  tabStorage = sessionStorage;
  useTabStorage = tabStorage.getItem(KEY) !== null;
} catch {}
const persistence = {
  getItem(key) {
    if (!useTabStorage && storage) {
      try { return storage.getItem(key); } catch { useTabStorage = true; }
    }
    return tabStorage.getItem(key);
  },
  setItem(key, value) {
    if (!useTabStorage && storage) {
      try {
        storage.setItem(key, value);
        return;
      } catch { useTabStorage = true; }
    }
    tabStorage.setItem(key, value);
  },
};
const images = [];
let assets, assetRequest;
function catalog() {
  return assetRequest ??= fetch(new URL('./puzzle-images.json', import.meta.url))
    .then(response => {
      if (!response.ok) throw Error('Puzzle catalog');
      return response.json();
    })
    .then(({images: entries}) => {
      images.push(...entries.map(entry => entry.id));
      assets = new Map(entries.map(entry => [entry.id, entry]));
    })
    .catch(error => { assetRequest = null; throw error; });
}

const collection = createCollection({
  storage: persistence, locks: navigator.locks, images,
  token: () => Array.from(crypto.getRandomValues(new Uint8Array(16)), n => n.toString(16).padStart(2, '0')).join(''),
});
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const language = () => document.documentElement.lang.startsWith('zh') ? 'zh' : 'en';
const words = () => copy[language()];

let state = {round: null};
let ui, game, art, world, worldId, pictureRequest, pictureId, engine, styles;
let routeRevision = 0, generation = 0, initialized = false, active, latest, animationId = 0;
let resetting = false;
let backgrounded = false, saveURL, saveRevision = 0, focusBeforePanel;
let dockFrame = 0, disposeDock, feedback;
let failedPages = new Set(), failed = false, retrying = false;
const count = () => state.round?.pieces.length || 0;

function loadPicture(id) {
  if (pictureId !== id || !pictureRequest) {
    pictureId = id;
    pictureRequest = import('./puzzle-art.js').then(async module => {
      const image = await module.loadPicture(assets.get(id));
      if (pictureId === id) {
        world = image;
        worldId = id;
        art = module;
      }
      return image;
    }).catch(error => {
      if (pictureId === id) pictureRequest = null;
      throw error;
    });
  }
  return pictureRequest;
}

function loadStyles() {
  return styles ??= new Promise((resolve, reject) => {
    const sheet = document.createElement('link');
    sheet.rel = 'stylesheet';
    sheet.href = new URL('./puzzle.css', import.meta.url);
    sheet.onload = resolve;
    sheet.onerror = reject;
    document.head.append(sheet);
  });
}

function gsap() {
  if (window.gsap) return Promise.resolve(window.gsap);
  return engine ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = new URL('./assets/puzzle-gsap.min.js', import.meta.url);
    script.onload = () => resolve(window.gsap);
    script.onerror = reject;
    document.head.append(script);
  });
}

function watchDock() {
  if (disposeDock) return;
  const controller = new AbortController();
  const options = {signal: controller.signal, passive: true};
  addEventListener('scroll', scheduleDock, {...options, capture: true});
  addEventListener('resize', scheduleDock, options);
  window.visualViewport?.addEventListener('resize', scheduleDock, options);
  document.addEventListener('focusin', scheduleDock, options);
  let lastLanguage = document.documentElement.lang;
  const language = new MutationObserver(() => {
    if (document.documentElement.lang === lastLanguage) return;
    lastLanguage = document.documentElement.lang;
    update();
  });
  language.observe(document.documentElement, {attributes: true, attributeFilter: ['lang']});
  const layout = new ResizeObserver(scheduleDock);
  layout.observe(document.body);
  disposeDock = () => {
    controller.abort();
    layout.disconnect();
    language.disconnect();
    cancelAnimationFrame(dockFrame);
    dockFrame = 0;
    disposeDock = null;
  };
}

function scheduleDock() {
  if (!dockFrame) dockFrame = requestAnimationFrame(positionDock);
}

function positionDock() {
  dockFrame = 0;
  const {host, entry} = ui;
  if (host.hidden || ui.dialog.open || active?.settling) return;
  host.classList.remove('mp-in-flow', 'mp-compact');
  entry.style.removeProperty('--mp-lift');
  const surfaces = new Map();
  const occupied = 'a, button, input, textarea, select, label, summary, video, iframe, canvas, [contenteditable]';
  const range = document.createRange();
  function rectangles(element) {
    if (surfaces.has(element)) return surfaces.get(element);
    const regions = [];
    if (element.matches(occupied)) regions.push(element.getBoundingClientRect());
    for (const node of element.childNodes) {
      if (node.nodeType !== Node.TEXT_NODE || !node.textContent.trim()) continue;
      range.selectNodeContents(node);
      regions.push(...range.getClientRects());
    }
    surfaces.set(element, regions);
    return regions;
  }
  function findSpace() {
    const origin = entry.getBoundingClientRect();
    const step = Math.max(12, Math.floor(origin.height / 2));
    const maxLift = Math.min(innerHeight * .39, 260);
    for (let lift = 0; lift <= maxLift; lift += step) {
      const top = origin.top - lift, bottom = origin.bottom - lift;
      const intersects = r => r.width && r.height && r.right > origin.left - 2 &&
        r.left < origin.right + 2 && r.bottom > top - 2 && r.top < bottom + 2;
      let blocked = false;
    scan: for (let x = origin.left + 2; x < origin.right; x += 14) {
        for (const y of [top + 1, top + origin.height / 2, bottom - 1]) {
          const elements = document.elementsFromPoint(x, y);
          if (elements.some(element => !host.contains(element) && rectangles(element).some(intersects))) {
            blocked = true;
            break scan;
          }
        }
      }
      if (!blocked) {
        if (lift) entry.style.setProperty('--mp-lift', lift + 'px');
        return true;
      }
    }
    return false;
  }
  if (findSpace()) return;
  host.classList.add('mp-compact');
  if (findSpace()) return;
  host.classList.remove('mp-compact');
  // Dense text can fully occupy the left edge on a narrow screen.
  host.classList.add('mp-in-flow');
}

function mount() {
  if (ui) return;
  const host = document.createElement('div');
  host.id = 'mia-puzzle';
  host.dataset.noTranslate = '';
  host.innerHTML = `
    <button class="mp-entry" type="button" aria-haspopup="dialog">
      <span class="mp-bag" aria-hidden="true"></span>
      <strong></strong>
    </button>
    <span class="mp-live" role="status" aria-live="polite" aria-atomic="true"></span>
    <div class="mp-flight" aria-hidden="true" hidden>
      <canvas width="400" height="400"></canvas><p></p>
    </div>
    <dialog class="mp-dialog" aria-labelledby="mp-title">
      <h2 id="mp-title" tabindex="-1"></h2>
      <p class="mp-progress" role="status" aria-atomic="true"></p>
      <div class="mp-game"></div><p class="mp-load" role="status"></p>
      <p class="mp-complete"></p>
      <div class="mp-preview" hidden><p></p><img alt="" width="2400" height="2400"></div>
      <div class="mp-actions">
        <button type="button" data-action="start"></button>
        <button type="button" data-action="laterButton"></button>
        <button type="button" data-action="retry"></button>
        <button type="button" data-action="save"></button>
        <button type="button" data-action="restart"></button>
        <button type="button" data-action="close"></button>
      </div>
      <div class="mp-confirm" hidden>
        <p></p><div class="mp-actions">
          <button type="button" data-action="reset"></button>
          <button type="button" data-action="cancel"></button>
        </div>
      </div>
      <p class="mp-error" role="alert" hidden></p>
    </dialog>`;
  const footer = document.querySelector('body > footer');
  if (footer) footer.before(host);
  else document.body.append(host);
  const find = selector => host.querySelector(selector);
  ui = {
    host, entry: find('.mp-entry'), thumb: find('.mp-bag'), flight: find('.mp-flight'),
    flyingPiece: find('.mp-flight canvas'), dialog: find('.mp-dialog'), gameRoot: find('.mp-game'),
    title: find('#mp-title'), live: find('.mp-live'), confirmation: find('.mp-confirm'),
    preview: find('.mp-preview'), error: find('.mp-error'),
  };
  ui.entry.onclick = () => openPanel();
  watchDock();
  ui.dialog.addEventListener('click', event => {
    switch (event.target.dataset.action) {
      case 'laterButton':
      case 'close': ui.dialog.close(); break;
      case 'start': startGame(); break;
      case 'retry': retry(); break;
      case 'save': exportImage(); break;
      case 'restart': count() ? confirmReset(true) : reset(); break;
      case 'cancel': confirmReset(false); break;
      case 'reset': reset(); break;
    }
  });
  ui.dialog.addEventListener('cancel', event => {
    if (!ui.confirmation.hidden) {
      event.preventDefault();
      confirmReset(false);
    }
  });
  ui.dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const buttons = [...ui.dialog.querySelectorAll('button:enabled')].filter(button => button.getClientRects().length);
    const index = buttons.indexOf(document.activeElement);
    if (event.shiftKey ? index <= 0 : index === buttons.length - 1) {
      event.preventDefault();
      buttons.at(event.shiftKey ? -1 : 0)?.focus();
    }
  });
  ui.dialog.addEventListener('close', () => {
    if (ui.dialog.open) return;
    cancelFlight();
    closeGame();
    clearPreview();
    confirmReset(false, false);
    scheduleDock();
    if (!backgrounded) (focusBeforePanel?.isConnected ? focusBeforePanel : ui.entry).focus({preventScroll: true});
  });
}

function button(action) {
  return ui.dialog.querySelector('[data-action="' + action + '"]');
}

function closeGame() {
  game?.dispose();
  game = null;
  ui.gameRoot.replaceChildren();
}

function confirmReset(show, focus = true) {
  ui.confirmation.hidden = !show;
  ui.gameRoot.inert = show;
  update();
  if (focus) button(show ? 'cancel' : 'restart').focus();
}

function clearPreview() {
  saveRevision++;
  if (saveURL) URL.revokeObjectURL(saveURL);
  saveURL = null;
  ui.preview.hidden = true;
  ui.gameRoot.hidden = false;
  ui.preview.querySelector('img').removeAttribute('src');
  ui.error.hidden = true;
}

function update(announce = false) {
  if (!ui) return;
  const {host, entry, dialog} = ui;
  const r = state.round, n = count(), phase = r?.phase, t = words();
  host.hidden = (!initialized && !n && !failed) || (document.body.dataset.page === 'home' && !n && !dialog.open);
  host.classList.toggle('mp-home', document.body.dataset.page === 'home');
  host.classList.toggle('mp-failed', failed);
  entry.setAttribute('aria-label', t.title + ', ' + t.count(n) + (failed ? '. ' + t.load : ''));
  entry.querySelector('strong').textContent = host.classList.contains('mp-home') ? n + ' / 9' : t.count(n);
  ui.title.textContent = t.title;
  dialog.classList.toggle('mp-wide', phase === 'play');
  dialog.querySelector('.mp-progress').textContent = phase === 'play' || phase === 'complete'
    ? t.count(n) + ' \u00b7 ' + t.placed(r.placed.length) : t.count(n);
  const message = dialog.querySelector('.mp-complete');
  message.hidden = phase === 'play';
  message.textContent = phase === 'complete' ? t.complete : phase === 'ready' ? t.ready : t.remaining(TOTAL - n);
  dialog.querySelector('.mp-load').textContent = failed ? t.load : retrying ? t.loading : '';
  ui.preview.querySelector('p').textContent = t.preview;
  ui.confirmation.querySelector('p').textContent = t.confirm;
  dialog.querySelector('.mp-actions').hidden = !ui.confirmation.hidden;
  for (const action of ['save', 'restart', 'close', 'cancel', 'reset', 'start', 'laterButton', 'retry']) {
    button(action).textContent = t[action === 'reset' ? 'restart' : action];
  }
  button('save').hidden = phase !== 'complete';
  button('start').hidden = phase !== 'ready';
  button('laterButton').hidden = phase !== 'ready';
  button('close').hidden = phase === 'ready';
  button('retry').hidden = !failed || retrying;
  if (announce) ui.live.textContent = announce === 'placed' ? t.placed(r.placed.length) : t.count(n);
  scheduleDock();
  if (game && dialog.open) game.render(r, assets?.get(r?.imageId), worldId === r?.imageId ? world : null, t, language());
}

async function openPanel() {
  if (ui.dialog.open || backgrounded) return;
  focusBeforePanel = ui.entry;
  cancelFlight();
  ui.dialog.showModal();
  update();
  ui.title.focus();
  if (state.round && count() && !failed) await ensureGame();
}

async function ensureGame() {
  const expected = state.round?.token;
  if (!expected || game || !ui.dialog.open) return;
  try {
    const [{mountGame}] = await Promise.all([import('./puzzle-game.js'), loadPicture(state.round.imageId)]);
    if (!ui.dialog.open || state.round?.token !== expected) return;
    game ??= mountGame(ui.gameRoot, place, gsap, reduced);
    update();
  } catch {
    if (state.round?.token === expected) { failed = true; update(); }
  }
}

async function startGame() {
  state = await collection.start(state.round?.token);
  update();
  ui.title.focus();
}

async function place(piece, target) {
  const previous = state.round?.placed.length;
  state = await collection.place(piece, target, state.round?.token);
  update(state.round?.placed.length !== previous ? 'placed' : false);
  if (state.round?.phase === 'complete') {
    ui.title.focus();
    if (!reduced.matches) {
      const motion = await gsap();
      if (ui.dialog.open && state.round?.phase === 'complete') {
        feedback = motion.fromTo(ui.gameRoot.querySelector('.mp-target'), {opacity: .65}, {opacity: 1, duration: .38, clearProps: 'opacity'});
      }
    }
  }
}

async function exportImage() {
  const r = state.round;
  if (r?.phase !== 'complete' || !art || worldId !== r.imageId) return;
  clearPreview();
  const revision = saveRevision;
  button('save').disabled = true;
  try {
    const canvas = document.createElement('canvas');
    art.drawBoard(canvas, world, r.placed, world.naturalWidth);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    if (revision !== saveRevision) return;
    if (!blob) throw Error('PNG export');
    saveURL = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = saveURL;
    link.download = 'mia-' + r.imageId + '.png';
    if ('download' in link) link.click();
    if (!('download' in link) || matchMedia('(pointer: coarse)').matches) {
      const image = ui.preview.querySelector('img');
      image.width = canvas.width;
      image.height = canvas.height;
      image.alt = assets.get(r.imageId).alt[language()];
      image.src = saveURL;
      ui.preview.hidden = false;
      ui.gameRoot.hidden = true;
    }
  } catch {
    if (revision === saveRevision) {
      ui.error.textContent = words().error;
      ui.error.hidden = false;
    }
  } finally {
    button('save').disabled = false;
  }
}

function cancelFlight() {
  animationId++;
  latest = null;
  active?.timeline.kill();
  feedback?.revert();
  feedback = null;
  active = null;
  if (ui) ui.flight.hidden = true;
}

function land(motion, duration) {
  const piece = ui.flyingPiece.getBoundingClientRect();
  const target = ui.thumb.getBoundingClientRect();
  const x = target.left + target.width / 2 - piece.left - piece.width / 2;
  const y = target.top + target.height / 2 - piece.top - piece.height / 2;
  const currentScale = Number(motion.getProperty(ui.flight, 'scaleX')) || 1;
  return {
    x: Number(motion.getProperty(ui.flight, 'x')) + x,
    y: Number(motion.getProperty(ui.flight, 'y')) + y,
    scale: Math.min(.22, currentScale * target.width / piece.width), opacity: 0,
    duration, ease: 'power2.inOut',
  };
}

function settle(fast = false) {
  if (!active || (fast && active.settling)) return;
  const {motion, piece} = active;
  active.timeline.kill();
  active.settling = true;
  const done = () => {
    ui.flight.hidden = true;
    active = null;
    scheduleDock();
    if (!reduced.matches) feedback = motion.fromTo(ui.thumb, {scale: 1.12}, {scale: 1, duration: .28, clearProps: 'transform'});
    if (piece.order === TOTAL - 1 && state.round?.phase === 'ready') openPanel();
    else if (latest) {
      const next = latest;
      latest = null;
      play(next, motion);
    }
  };
  active.timeline = motion.timeline({onComplete: done}).to(ui.flight, reduced.matches
    ? {opacity: 0, duration: .13}
    : land(motion, fast ? time.interrupt : time.fly));
}

function play(piece, motion) {
  if (active) {
    latest = piece;
    settle(true);
    return;
  }
  if (ui.dialog.open) {
    if (piece.order !== TOTAL - 1) return;
    update();
    return;
  }
  art.drawPiece(ui.flyingPiece, world, piece.position);
  ui.flight.querySelector('p').textContent = words()[piece.order === 0 ? 'first' : 'later'];
  ui.flight.hidden = false;
  const small = reduced.matches;
  motion.set(ui.flight, {x: 0, y: 0, scale: small ? 1 : .78, opacity: 0});
  const timeline = motion.timeline({onComplete: () => settle()});
  active = {motion, timeline, piece, settling: false};
  timeline.to(ui.flight, {opacity: 1, scale: 1, duration: small ? .12 : time.grow, ease: 'power2.out'});
  timeline.to({}, {duration: small ? time.reduced : (piece.order === 0 ? time.first : time.later)});
}

async function show(piece, token) {
  if (backgrounded) return;
  const id = animationId;
  await loadStyles();
  if (backgrounded) return;
  mount();
  update(Boolean(piece));
  if (!piece) return;
  const motion = await gsap();
  if (id === animationId && state.round?.token === token && !backgrounded) play(piece, motion);
}

async function reset() {
  if (resetting) return;
  resetting = true;
  generation++;
  routeRevision++;
  cancelFlight();
  clearPreview();
  closeGame();
  failedPages.clear();
  failed = false;
  try {
    state = await collection.reset(state.round?.token);
    initialized = true;
    confirmReset(false, false);
    update(true);
    if (ui.dialog.open) ui.title.focus();
  } finally {
    resetting = false;
  }
}

function synchronize() {
  if (!assets) return;
  const next = collection.read(), before = state.round;
  if (next.round?.token !== before?.token) {
    generation++;
    cancelFlight();
    if (ui) {
      clearPreview();
      closeGame();
    }
    failed = false;
    failedPages.clear();
  }
  state = next;
  if (ui) update(count() !== before?.pieces.length || (next.round?.placed.length !== before?.placed.length && 'placed'));
  else if (count()) show(null).catch(console.error);
  if (ui?.dialog.open && count()) ensureGame();
}

async function grant(id, epoch) {
  let expected;
  try {
    await catalog();
    if (epoch !== generation || backgrounded) return;
    const snapshot = await collection.prepare();
    expected = snapshot.round;
    if (epoch !== generation || backgrounded) return;
    state = snapshot;
    if (expected.phase !== 'collect' || expected.pieces.some(piece => piece.id === id)) {
      if (count()) await show(null);
      return;
    }
    await loadPicture(expected.imageId);
  } catch {
    if (epoch !== generation || backgrounded) return;
    failedPages.add(id);
    failed = true;
    initialized = true;
    await show(null);
    return;
  }
  if (epoch !== generation || backgrounded) return;
  const result = await collection.claim(id, expected.token);
  if (epoch !== generation || backgrounded) return;
  state = result.state;
  failedPages.delete(id);
  failed = Boolean(failedPages.size);
  initialized = true;
  if (ui) {
    update(Boolean(result.piece));
    if (ui.dialog.open) ensureGame();
  }
  if (result.piece || !ui) await show(result.piece && {...result.piece, order: count() - 1}, expected.token);
}

async function retry() {
  if (retrying) return;
  const epoch = generation;
  retrying = true;
  failed = false;
  update();
  const pages = [...failedPages];
  try {
    if (pages.length) {
      if (ui.dialog.open) {
        const closed = new Promise(resolve => ui.dialog.addEventListener('close', resolve, {once: true}));
        ui.dialog.close();
        await closed;
      }
      await Promise.all(pages.map(id => grant(id, epoch)));
      if (failed && epoch === generation) await openPanel();
    }
    else if (state.round) {
      await loadPicture(state.round.imageId);
      if (ui.dialog.open) await ensureGame();
    }
  } catch {
    if (epoch === generation) failed = true;
  } finally {
    retrying = false;
    update();
    if (ui.dialog.open) ui.title.focus();
  }
}

async function visit(id) {
  const revision = ++routeRevision;
  if (active) settle(true);
  if (!id) { update(); return; }
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  if (revision !== routeRevision || backgrounded || resetting) return;
  await grant(id, generation);
}

function routeId(route) {
  return route?.work ? workId(route.work) : pageId(route?.hash || '');
}

function readPage() {
  const page = document.body.dataset.puzzleWork;
  if (page === 'tourism' && !window.reportReady) return null;
  if (page === 'photography' && !document.querySelector('#canvas .page-image')) return null;
  if (page) return workId(page);
  if (window.MIA_WORK_READY) return workId(window.MIA_WORK_READY.id);
  return routeId(window.MIA_PUZZLE_PAGE);
}

function start() {
  if (ui) watchDock();
  const listeners = new AbortController();
  const options = {signal: listeners.signal};
  const route = event => visit(routeId(event.detail)).catch(console.error);
  addEventListener('mia-puzzle-page', route, options);
  addEventListener('mia-puzzle-work-ready', event => visit(workId(event.detail)).catch(console.error), options);
  addEventListener('storage', event => {
    if (!useTabStorage && event.storageArea === storage && (event.key === KEY || event.key === null)) synchronize();
  }, options);
  addEventListener('pagehide', () => {
    backgrounded = true;
    listeners.abort();
    disposeDock?.();
    cancelFlight();
    if (ui) {
      ui.dialog.close();
      clearPreview();
    }
  }, {...options, once: true});
  catalog().then(() => {
    state = collection.read();
    if (count()) return show(null);
  }).catch(() => {});
  visit(readPage()).catch(console.error);
}

addEventListener('pageshow', event => {
  if (!event.persisted) return;
  backgrounded = false;
  synchronize();
  start();
});
if (window.top === window) {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once: true});
  else start();
}
