import { getCurveName, convertToAssets } from "./contracts";

const bondingCurveId = 4n; // adjust as needed
const curveName = await getCurveName(bondingCurveId)
console.log("curveName: " + curveName)

type Point = {
  shares: bigint;
  sharePrice: bigint;
};

const points = new Map<bigint, bigint>();
points.set(0n, 0n);

// Grabs intermediary points between start and end
// Rounds to consistent resolution in order to avoid cache becoming huge
export async function getPoints(start: bigint, end: bigint, specialPoint: bigint): Promise<[Point[], Point]> {
  const range: Point[] = [];

  // Round start and end to a consistent resolution
  const resolution = 1000000n; // 1 million units for high precision
  const roundedStart = (start / resolution) * resolution;
  const roundedEnd = ((end + resolution - 1n) / resolution) * resolution; // Round up

  // Use a fixed number of points (16) for any range
  const span = roundedEnd - roundedStart;
  const step = span > 0n ? span / 16n : 1n;
  // Round step to resolution as well
  const roundedStep = ((step + resolution - 1n) / resolution) * resolution;
  const finalStep = roundedStep > 0n ? roundedStep : resolution;

  for (let i = roundedStart; i <= roundedEnd; i += finalStep) {
    const [shares, sharePrice] = await getSharePrice(i);
    range.push({ shares, sharePrice });
  }

  const specialPointPrice = await getSharePrice(specialPoint); // small bloat, interpolate later
  const currentPoint: Point = { shares: specialPointPrice[0], sharePrice: specialPointPrice[1] }

  return [range, currentPoint]
}

// Get the share price from the cache, or read from RPC into cache if missing
async function getSharePrice(shares: bigint) {
  let price = points.get(shares);
  if (price === undefined) {
    price = await convertToAssets(shares, shares, 0n, bondingCurveId);
    points.set(shares, price);
    console.log("shares: " + shares + " price: " + price)
  } else {
    console.log("Found existing point for shares: " + shares + " price: " + price + " in cache")
  }
  return [shares, price];
}