import { test } from "@playwright/test";

test.describe("public profile smoke", () => {
  test.skip("loads a public business profile from local seeded route", async ({
    page,
  }) => {
    await page.goto("/pidhimadh");
  });
});
