import { describe, it, expect } from "@jest/globals";
import Authentication from "../Authentication.js";

describe("Authentication entities", () => {
  it("should throw error when payload not contain needed property", () => {
    const payload = {
      accessToken: "accessToken",
    };

    expect(() => {
      new Authentication(payload);
    }).toThrow("AUTHENTICATION.NOT_CONTAIN_NEEDED_PROPERTY");
  });

  it("should throw error when payload not meet data type specification", () => {
    const payload = {
      accessToken: "accessToken",
      refreshToken: 123,
    };

    expect(() => {
      new Authentication(payload);
    }).toThrow("AUTHENTICATION.NOT_MEET_DATA_TYPE_SPECIFICATION");
  });

  it("should create Authentication entities correctly", () => {
    const payload = {
      accessToken: "accessToken",
      refreshToken: "refreshToken",
    };

    const authentication = new Authentication(payload);

    expect(authentication.accessToken).toEqual(payload.accessToken);
    expect(authentication.refreshToken).toEqual(payload.refreshToken);
  });
});
