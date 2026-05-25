import { describe, expect, it } from "vitest";
import {
  inferAllowedCountry,
  inferRemoteType,
  isAllowedPipelineJob,
  resolveRemoteType,
} from "./utils";

describe("inferAllowedCountry", () => {
  it("detects United States locations", () => {
    expect(inferAllowedCountry("Remote · United States")).toBe("us");
    expect(inferAllowedCountry("San Francisco, CA")).toBe("us");
  });

  it("detects Canada locations", () => {
    expect(inferAllowedCountry("Remote · Canada")).toBe("canada");
    expect(inferAllowedCountry("Toronto, ON")).toBe("canada");
  });

  it("detects Brazil locations", () => {
    expect(inferAllowedCountry("Remote · Brazil")).toBe("brazil");
    expect(inferAllowedCountry("São Paulo, Brazil")).toBe("brazil");
  });

  it("uses search country for plain remote labels", () => {
    expect(inferAllowedCountry("Remote", "us")).toBe("us");
    expect(inferAllowedCountry("Remoto", "brazil")).toBe("brazil");
  });

  it("rejects excluded regions", () => {
    expect(inferAllowedCountry("Remote · Europe")).toBeNull();
    expect(inferAllowedCountry("Remote · Worldwide")).toBeNull();
  });
});

describe("isAllowedPipelineJob", () => {
  it("accepts remote jobs in allowed countries", () => {
    expect(
      isAllowedPipelineJob({
        title: "Backend Engineer",
        location: "Remote · United States",
        remoteType: "remote",
      })
    ).toBe(true);

    expect(
      isAllowedPipelineJob(
        {
          title: "Software Engineer",
          location: "Remote",
          remoteType: "unknown",
        },
        "canada"
      )
    ).toBe(true);
  });

  it("rejects hybrid and on-site jobs", () => {
    expect(
      isAllowedPipelineJob({
        title: "Backend Engineer",
        location: "Toronto, ON",
        remoteType: "hybrid",
      })
    ).toBe(false);

    expect(
      isAllowedPipelineJob({
        title: "Backend Engineer",
        location: "Austin, TX",
        remoteType: "on-site",
      })
    ).toBe(false);
  });

  it("rejects remote jobs outside target countries", () => {
    expect(
      isAllowedPipelineJob({
        title: "Remote Engineer",
        location: "Remote · Germany",
        remoteType: "remote",
      })
    ).toBe(false);
  });
});

describe("remote type helpers", () => {
  it("infers remote from text", () => {
    expect(inferRemoteType("Software Engineer · Remote")).toBe("remote");
    expect(inferRemoteType("Engenheiro · Remoto")).toBe("remote");
  });

  it("preserves explicit hybrid and on-site types", () => {
    expect(resolveRemoteType("hybrid", "Software Engineer")).toBe("hybrid");
    expect(resolveRemoteType("on-site", "Software Engineer")).toBe("on-site");
  });
});
