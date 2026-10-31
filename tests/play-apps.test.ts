import { describe, it, expect } from "vitest";
import { parsePlayApps } from "../src/providers/play-apps.js";
describe("Play app registry", () => {
  it("returns empty list when unconfigured", () => expect(parsePlayApps(undefined)).toEqual([]));
  it("parses configured packages", () => expect(parsePlayApps('[{"packageName":"com.example.app","name":"Example"}]')).toEqual([{packageName:"com.example.app",name:"Example"}]));
  it("rejects invalid package names", () => expect(() => parsePlayApps('[{"packageName":"../bad"}]')).toThrow());
  it("rejects duplicates", () => expect(() => parsePlayApps('[{"packageName":"com.example.app"},{"packageName":"com.example.app"}]')).toThrow());
  it("rejects malformed JSON", () => expect(() => parsePlayApps("oops")).toThrow());
});
