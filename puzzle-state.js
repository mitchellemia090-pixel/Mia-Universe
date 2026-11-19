export const KEY = 'mia-nine-pieces-v2';
export const TOTAL = 9;
const pages = new Set(['about', 'work', 'archive', 'contact', 'personal']);
const aliases = {
  'about-me': 'about', 'selected-work': 'work', 'selected-works': 'work',
  selected: 'work', works: 'work', 'contact-me': 'contact',
  'personal-space': 'personal', private: 'personal', space: 'personal',
};

export function pageId(hash) {
  const match = /^#\/([a-z-]+)\/?(?:\?.*)?$/.exec(hash);
  const page = aliases[match?.[1]] || match?.[1];
  return pages.has(page) ? page : null;
}

export function workId(id) {
  const editions = {'romance-thesis': 'romance', 'screenshot-thesis': 'screenshot', 'tourism-report': 'tourism'};
  return typeof id === 'string' && /^[a-z0-9-]+$/.test(id) ? 'work:' + (editions[id] || id) : null;
}

export const eligible = id => pages.has(id) || (typeof id === 'string' && /^work:[a-z0-9-]+$/.test(id));
const slots = Array.from({length: TOTAL}, (_, i) => i);
const empty = () => ({version: 2, bag: [], round: null});
const distinct = (items, valid) => Array.isArray(items) && new Set(items).size === items.length && items.every(valid);
const validSlot = slot => slots.includes(slot);

function shuffled(items, random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function decode(raw, images) {
  try {
    const {version, bag, round} = JSON.parse(raw);
    if (version !== 2 || !distinct(bag, id => images.includes(id))) return empty();
    if (!round) return bag.length ? empty() : {version, bag, round: null};
    const {token, imageId, order, pieces, placed, phase} = round;
    if (typeof token !== 'string' || !token || !images.includes(imageId) || bag.includes(imageId) ||
        !distinct(order, validSlot) || order.length !== TOTAL ||
        !Array.isArray(pieces) || pieces.length > TOTAL || !distinct(pieces.map(p => p.id), eligible) ||
        !distinct(pieces.map(p => p.position), validSlot) || !distinct(placed, validSlot)) return empty();
    if (pieces.length < TOTAL && (phase !== 'collect' || placed.length) ||
        pieces.length === TOTAL && !['ready', 'play', 'complete'].includes(phase) ||
        phase === 'ready' && placed.length ||
        (phase === 'complete') !== (placed.length === TOTAL)) return empty();
    return {version, bag, round: {token, imageId, order, pieces, placed, phase}};
  } catch {
    return empty();
  }
}

export function createCollection({storage, locks, images, token, random = Math.random}) {
  let memory = empty();
  let persistent = Boolean(storage);
  let pending = Promise.resolve();

  function read() {
    if (persistent) {
      try { memory = decode(storage.getItem(KEY), images); }
      catch { persistent = false; }
    }
    return memory;
  }

  function transact(update) {
    const run = () => {
      const current = read();
      const next = update(current);
      if (current !== next) {
        memory = next;
        if (persistent) {
          try { storage.setItem(KEY, JSON.stringify(next)); }
          catch { persistent = false; }
        }
      }
      return next;
    };
    const job = pending.then(() => persistent && locks ? locks.request(KEY, run) : run());
    pending = job.catch(() => {});
    return job;
  }

  function nextRound(state) {
    const bag = state.bag.length ? [...state.bag] : shuffled(images, random);
    if (bag.length > 1 && bag[0] === state.round?.imageId) [bag[0], bag[1]] = [bag[1], bag[0]];
    const imageId = bag.shift();
    const order = shuffled(slots, random);
    if (order.every((slot, i) => slot === i)) [order[0], order[1]] = [order[1], order[0]];
    return {...state, bag, round: {token: token(), imageId, order, pieces: [], placed: [], phase: 'collect'}};
  }

  return {
    read,
    prepare: () => transact(state => state.round ? state : nextRound(state)),
    reset: expected => transact(state => state.round?.token === expected ? nextRound(state) : state),
    claim(id, expected) {
      let piece;
      return transact(state => {
        const round = state.round;
        if (!eligible(id) || round?.token !== expected || round?.phase !== 'collect' ||
            round.pieces.some(item => item.id === id)) return state;
        const used = new Set(round.pieces.map(item => item.position));
        const position = slots.find(slot => !used.has(slot));
        piece = {id, position};
        const pieces = [...round.pieces, piece];
        return {...state, round: {...round, pieces, phase: pieces.length === TOTAL ? 'ready' : 'collect'}};
      }).then(state => ({state, piece}));
    },
    start: expected => transact(state => state.round?.token === expected && state.round.phase === 'ready'
      ? {...state, round: {...state.round, phase: 'play'}} : state),
    place(piece, target, expected) {
      return transact(state => {
        const round = state.round;
        if (round?.token !== expected || round?.phase !== 'play' || !validSlot(piece) ||
            piece !== target || round.placed.includes(piece)) return state;
        const placed = [...round.placed, piece];
        return {...state, round: {...round, placed, phase: placed.length === TOTAL ? 'complete' : 'play'}};
      });
    },
  };
}
