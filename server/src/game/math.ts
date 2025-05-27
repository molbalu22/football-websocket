export function vector2Length(v: [number, number]): number {
  const [x, y] = v;
  return Math.sqrt(x * x + y * y);
}

export function vector2Normalize(v: [number, number]): [number, number] {
  const [x, y] = v;
  const len = vector2Length(v);
  return [x / len, y / len];
}

export function vector2Scale(v: [number, number], z: number): [number, number] {
  const [x, y] = v;
  return [z * x, z * y];
}

export function vector2Add(
  u: [number, number],
  v: [number, number]
): [number, number] {
  const [x1, y1] = u;
  const [x2, y2] = v;
  return [x1 + x2, y1 + y2];
}
