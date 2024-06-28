export default function randomRgb(): [number, number, number] {
    const o = Math.round, r = Math.random, s = 255;
    return [o(r()*s), o(r()*s), o(r()*s)];
}
