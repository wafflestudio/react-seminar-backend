import dotenv from "dotenv";

dotenv.config();

const KEYS = [
  "JWT_SECRET"
] as const;
type KeyType = (typeof KEYS)[number];

const KVPS = KEYS.map(key => [key, process.env[key]] as [KeyType, string | undefined]);
if (KVPS.some(([,v]) => v === undefined)) {
  console.error(`please set environment variables: ${KEYS.toString()}`);
  process.exit(1);
}
const OBJ = Object.fromEntries(KVPS) as { [k in KeyType]: string };

export const {
 JWT_SECRET
} = OBJ;
