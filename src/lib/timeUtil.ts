import dayjs from "dayjs";
import duration, { Duration } from "dayjs/plugin/duration";

dayjs.extend(duration);

export const makeDurationMs = (ms: number) =>
  dayjs.duration(ms, "milliseconds");
export const now = () => dayjs();
export const fromNow = (duration: Duration) => dayjs().add(duration);
