function edge(x, y, vertical, direction) {
  const point = (along, across) => vertical ? [x + across, y + along] : [x + along, y + across];
  return [
    [point(0, 0), point(108, 0)],
    [point(108, 0), point(133, 0), point(109, 26 * direction), point(128, 41 * direction)],
    [point(128, 41 * direction), point(140, 52 * direction), point(160, 52 * direction), point(172, 41 * direction)],
    [point(172, 41 * direction), point(191, 26 * direction), point(167, 0), point(192, 0)],
    [point(192, 0), point(300, 0)],
  ];
}

const horizontal = Array.from({length: 4}, (_, row) => Array.from({length: 3}, (_, col) =>
  row === 0 || row === 3 ? [[[col * 300, row * 300], [(col + 1) * 300, row * 300]]] :
    edge(col * 300, row * 300, false, (row + col) % 2 ? 1 : -1)));
const vertical = Array.from({length: 3}, (_, row) => Array.from({length: 4}, (_, col) =>
  col === 0 || col === 3 ? [[[col * 300, row * 300], [col * 300, (row + 1) * 300]]] :
    edge(col * 300, row * 300, true, (row + col) % 2 ? -1 : 1)));

function trace(path, segments, reverse = false) {
  for (const segment of reverse ? segments.toReversed() : segments) {
    const points = reverse ? segment.toReversed() : segment;
    const coordinates = points.slice(1).flat();
    if (points.length === 2) path.lineTo(...coordinates);
    else path.bezierCurveTo(...coordinates);
  }
}

const pieces = Array.from({length: 9}, (_, pos) => {
  const row = Math.floor(pos / 3), col = pos % 3;
  const path = new Path2D();
  path.moveTo(col * 300, row * 300);
  trace(path, horizontal[row][col]);
  trace(path, vertical[row][col + 1]);
  trace(path, horizontal[row + 1][col], true);
  trace(path, vertical[row][col], true);
  path.closePath();
  return path;
});

const seams = new Path2D();
for (const segments of [...horizontal.slice(1, 3).flat(), ...vertical.flatMap(row => row.slice(1, 3))]) {
  seams.moveTo(...segments[0][0]);
  trace(seams, segments);
}


export async function loadPicture(asset) {
  const image = new Image();
  image.src = new URL(asset.src, import.meta.url).href;
  await image.decode();
  if (image.naturalWidth !== asset.width || image.naturalHeight !== asset.height) throw Error('Puzzle asset size');
  return image;
}

export function drawBoard(canvas, image, positions, width = Math.min(1000, image.naturalWidth)) {
  canvas.width = width;
  canvas.height = Math.round(width * image.naturalHeight / image.naturalWidth);
  const ctx = canvas.getContext('2d');
  ctx.scale(canvas.width / 900, canvas.height / 900);
  if (!positions.length) return;
  const outline = new Path2D();
  for (const slot of positions) outline.addPath(pieces[slot]);
  ctx.save();
  if (positions.length < 9) ctx.clip(outline);
  ctx.drawImage(image, 0, 0, 900, 900);
  ctx.strokeStyle = '#3b1c1577';
  ctx.lineWidth = 2.6;
  ctx.stroke(seams);
  ctx.strokeStyle = '#fbf7eea0';
  ctx.translate(.9, .9);
  ctx.lineWidth = 1.25;
  ctx.stroke(seams);
  ctx.restore();
}

export const PAD = 48;
export const TILE = 300 + 2 * PAD;

export function drawPiece(canvas, image, slot) {
  canvas.width = Math.round(image.naturalWidth * TILE / 900);
  canvas.height = Math.round(image.naturalHeight * TILE / 900);
  const ctx = canvas.getContext('2d');
  ctx.scale(canvas.width / TILE, canvas.height / TILE);
  ctx.translate(PAD - slot % 3 * 300, PAD - Math.floor(slot / 3) * 300);
  ctx.save();
  ctx.clip(pieces[slot]);
  ctx.drawImage(image, 0, 0, 900, 900);
  ctx.restore();
  ctx.strokeStyle = '#3b1c1555';
  ctx.lineWidth = 1.6;
  ctx.stroke(pieces[slot]);
}
