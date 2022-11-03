import { assert, expect, test } from "vitest";
import info from "@/info.json";

test("info.json file are present and valid", () => {
  const output = JSON.stringify(info);

  expect(output).not.eq(undefined);
  assert.isString(output, "info.json is not a string");
});

test("default keys are present", () => {
  const defaultKeys = Object.keys(info);

  expect(JSON.stringify(defaultKeys)).eq('["meta","project","techs"]');
});
