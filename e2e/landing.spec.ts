import { expect, test } from "@playwright/test";

test.describe("ランディングページ", () => {
  test("ヒーローのコピーと主要 CTA が表示される", async ({ page }) => {
    await page.goto("/");

    const main = page.getByRole("main");

    await expect(
      page.getByRole("heading", { level: 1 }),
    ).toContainText("家族の味を");

    const start = main.getByRole("link", { name: "無料ではじめる" });
    await expect(start).toBeVisible();
    await expect(start).toHaveAttribute("href", "/signup");

    await expect(
      main.getByRole("link", { name: "ログイン" }),
    ).toBeVisible();

    await expect(
      main.getByRole("button", { name: "ゲストで試す" }).first(),
    ).toBeVisible();
  });

  test("「無料ではじめる」から新規登録画面へ遷移する", async ({ page }) => {
    await page.goto("/");

    await page
      .getByRole("main")
      .getByRole("link", { name: "無料ではじめる" })
      .first()
      .click();

    await expect(page).toHaveURL(/\/signup$/);
    await expect(
      page.getByRole("heading", { name: "アカウント作成" }),
    ).toBeVisible();
  });

  test("主要セクションの見出しが揃っている", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "ふと思い出す、あの味" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "レシピを、こう残していく" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "3 ステップで、味帳ができる" }),
    ).toBeVisible();
  });
});
