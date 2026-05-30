import { a as createServerFn, u as createSsrRpc } from "./index.mjs";
const clean = (value, max = 120) => String(value ?? "").trim().slice(0, max);
const validatePreview = (input) => ({
  dateOfBirth: clean(input?.dateOfBirth, 20),
  birthLocationLabel: clean(input?.birthLocationLabel, 120),
  birthTimeLocal: clean(input?.birthTimeLocal, 20),
  birthTimezone: clean(input?.birthTimezone, 80),
  birthLatitude: typeof input?.birthLatitude === "number" && Number.isFinite(input.birthLatitude) ? input.birthLatitude : void 0,
  birthLongitude: typeof input?.birthLongitude === "number" && Number.isFinite(input.birthLongitude) ? input.birthLongitude : void 0,
  birthTimePrecision: ["unknown", "morning", "afternoon", "evening", "night", "exact"].includes(input?.birthTimePrecision) ? input.birthTimePrecision : "unknown"
});
const validateConfirm = (input) => ({
  ...validatePreview(input),
  accessToken: clean(input?.accessToken, 5e3),
  zodiacPublicOptIn: input?.zodiacPublicOptIn !== false
});
createServerFn({
  method: "POST"
}).inputValidator(validatePreview).handler(createSsrRpc("6e0b427c068764957f473644cb3275e727da2c8b14da409f491c1f658e6a5f49"));
const confirmZodiacIdentity = createServerFn({
  method: "POST"
}).inputValidator(validateConfirm).handler(createSsrRpc("8c3c3cad9ad0fabc6045fd491b744fd2a03840891ddcbdae73994749203284aa"));
const getDailyZodiacReading = createServerFn({
  method: "POST"
}).inputValidator((input) => ({
  zodiacSign: clean(input?.zodiacSign, 40),
  cuspLabel: input?.cuspLabel ? clean(input.cuspLabel, 80) : null,
  isCusp: input?.isCusp === true
})).handler(createSsrRpc("4a4eba1ddc908c8b0d90e2cdb9733e3a40ba166d58868dc7ac094c4adfd33ba3"));
export {
  confirmZodiacIdentity as c,
  getDailyZodiacReading as g
};
