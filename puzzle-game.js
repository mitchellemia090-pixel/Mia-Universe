import {drawBoard, drawPiece, TILE} from './puzzle-art.js';

export function mountGame(root, place, motion, reduced) {
  root.innerHTML = `
    <div class="mp-stage">
      <div class="mp-target" hidden><canvas class="mp-board"></canvas><div class="mp-slots"></div></div>
      <div class="mp-tray" role="group"></div>
    </div>
    <p class="mp-hint"></p>`;
  const target = root.querySelector('.mp-target');
  const board = root.querySelector('.mp-board');
  const slots = root.querySelector('.mp-slots');
  const tray = root.querySelector('.mp-tray');
  const hint = root.querySelector('.mp-hint');
  const controller = new AbortController();
  const options = {signal: controller.signal};
  const tileCache = new Map();
  const snaps = new Map();
  let image, round, text, selected, signature, drag, suppressClick;

  function clearDrag() {
    if (!drag) return;
    drag.ghost?.remove();
    drag.button.classList.remove('mp-dragging');
    drag = null;
  }

  function size() {
    if (round?.phase !== 'play') return;
    const rect = target.getBoundingClientRect();
    if (rect.width) {
      root.style.setProperty('--mp-tile-w', rect.width * TILE / 900 + 'px');
      root.style.setProperty('--mp-tile-h', rect.height * TILE / 900 + 'px');
    }
  }

  const resize = new ResizeObserver(size);
  resize.observe(target);

  function choose(slot) {
    selected = selected === slot ? undefined : slot;
    for (const button of tray.querySelectorAll('button')) {
      button.setAttribute('aria-pressed', String(+button.dataset.tile === selected));
    }
    hint.textContent = selected === undefined ? text.help : text.choose;
  }

  async function attempt(slot, position, keyboard = false) {
    if (slot === undefined) { hint.textContent = text.pick; return; }
    if (slot !== position || round.placed.includes(position)) {
      hint.textContent = text.miss;
      return;
    }
    selected = undefined;
    const token = round.token;
    await place(slot, position);
    if (keyboard && round?.token === token && round.phase === 'play') {
      tray.querySelector('button:not([hidden]):enabled')?.focus();
    }
  }

  root.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || button === suppressClick || round?.phase !== 'play') return;
    if (button.hasAttribute('data-tile')) choose(+button.dataset.tile);
    if (button.hasAttribute('data-slot')) attempt(selected, +button.dataset.slot, true);
  }, options);

  root.addEventListener('pointerdown', event => {
    const button = event.target.closest('[data-tile]');
    if (!button || round?.phase !== 'play' || event.button !== 0 || drag) return;
    const canvas = button.querySelector('canvas');
    const rect = canvas.getBoundingClientRect();
    drag = {
      pointer: event.pointerId, button, canvas, startX: event.clientX, startY: event.clientY,
      dx: event.clientX - rect.left, dy: event.clientY - rect.top, width: rect.width, height: rect.height,
    };
    button.setPointerCapture(event.pointerId);
  }, options);

  function move(event) {
    if (drag?.pointer !== event.pointerId) return;
    if (!drag.ghost && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) >= 6) {
      const ghost = drag.canvas.cloneNode();
      ghost.getContext('2d').drawImage(drag.canvas, 0, 0);
      ghost.className = 'mp-ghost';
      ghost.style.width = drag.width + 'px';
      ghost.style.height = drag.height + 'px';
      ghost.setAttribute('aria-hidden', 'true');
      root.closest('dialog').append(ghost);
      drag.ghost = ghost;
      drag.button.classList.add('mp-dragging');
    }
    if (!drag.ghost) return;
    drag.ghost.style.left = event.clientX - drag.dx + 'px';
    drag.ghost.style.top = event.clientY - drag.dy + 'px';
    const dialog = root.closest('dialog');
    const rect = dialog.getBoundingClientRect();
    if (event.clientY < rect.top + 36) dialog.scrollTop -= 18;
    if (event.clientY > rect.bottom - 36) dialog.scrollTop += 18;
  }

  root.addEventListener('pointermove', move, options);
  root.addEventListener('pointerup', event => {
    if (drag?.pointer !== event.pointerId) return;
    if (drag.ghost) {
      const button = drag.button;
      const rect = target.getBoundingClientRect();
      const centerX = event.clientX - drag.dx + drag.width / 2;
      const centerY = event.clientY - drag.dy + drag.height / 2;
      const col = Math.floor(3 * (centerX - rect.left) / rect.width);
      const row = Math.floor(3 * (centerY - rect.top) / rect.height);
      const slot = +button.dataset.tile;
      const position = col >= 0 && col < 3 && row >= 0 && row < 3 ? row * 3 + col : -1;
      suppressClick = button;
      setTimeout(() => { if (suppressClick === button) suppressClick = null; }, 0);
      if (slot === position && !round.placed.includes(slot) && !reduced.matches) {
        const {ghost, width, height} = drag;
        drag.ghost = null;
        snaps.set(ghost, null);
        const finish = () => { ghost.remove(); snaps.delete(ghost); };
        motion().then(gsap => {
          if (!snaps.has(ghost)) return;
          const x = rect.left + (col + .5) * rect.width / 3 - width / 2;
          const y = rect.top + (row + .5) * rect.height / 3 - height / 2;
          snaps.set(ghost, gsap.to(ghost, {
            left: x, top: y, opacity: 0, duration: .19, ease: 'power2.out', onComplete: finish,
          }));
        }).catch(finish);
      }
      attempt(slot, position);
    }
    clearDrag();
  }, options);
  root.addEventListener('pointercancel', clearDrag, options);
  root.addEventListener('lostpointercapture', clearDrag, options);

  function render(r, asset, bitmap, t, lang) {
    if (image !== bitmap) {
      image = bitmap;
      tileCache.clear();
      signature = null;
    }
    if (round?.token !== r?.token) selected = undefined;
    round = r;
    text = t;
    const playing = r?.phase === 'play', complete = r?.phase === 'complete';
    const key = JSON.stringify([r?.token, r?.phase, r?.pieces, r?.placed, lang, Boolean(bitmap)]);
    if (key === signature) return;
    signature = key;
    clearDrag();
    if (r?.placed.includes(selected)) selected = undefined;
    root.classList.toggle('mp-playing', playing);
    root.style.setProperty('--mp-ratio', asset?.aspectRatio || 1);
    target.hidden = !bitmap || (!playing && !complete);
    tray.hidden = !bitmap || !r?.pieces.length || complete;
    hint.hidden = !playing;
    hint.textContent = selected === undefined ? t.help : t.choose;
    tray.setAttribute('aria-label', t.tray);
    board.setAttribute('role', complete ? 'img' : 'presentation');
    if (complete) board.setAttribute('aria-label', asset.alt[lang]);
    else board.removeAttribute('aria-label');
    slots.hidden = !playing;
    slots.replaceChildren();
    tray.replaceChildren();
    if (!bitmap || !r) return;
    if (!target.hidden) drawBoard(board, bitmap, r.placed);
    if (playing) for (let position = 0; position < 9; position++) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.slot = position;
      button.disabled = r.placed.includes(position);
      button.setAttribute('aria-label', t.slot(Math.floor(position / 3) + 1, position % 3 + 1));
      slots.append(button);
    }
    if (!tray.hidden) {
      const held = new Set(r.pieces.map(piece => piece.position));
      const available = r.order.filter(slot => held.has(slot));
      for (const [index, slot] of available.entries()) {
        const item = document.createElement(playing ? 'button' : 'div');
        if (playing) {
          item.type = 'button';
          item.dataset.tile = slot;
          item.setAttribute('aria-label', t.piece(index + 1));
          item.setAttribute('aria-pressed', String(selected === slot));
          item.style.visibility = r.placed.includes(slot) ? 'hidden' : '';
        }
        if (!tileCache.has(slot)) {
          const fragment = document.createElement('canvas');
          drawPiece(fragment, bitmap, slot);
          tileCache.set(slot, fragment);
        }
        item.append(tileCache.get(slot));
        tray.append(item);
      }
    }
    size();
  }

  return {
    render,
    dispose() {
      clearDrag();
      for (const [ghost, tween] of snaps) {
        tween?.kill();
        ghost.remove();
      }
      snaps.clear();
      controller.abort();
      resize.disconnect();
    },
  };
}
