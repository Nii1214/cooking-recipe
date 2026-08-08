import { expect, test } from "@playwright/test";

test.describe("ランディングページ", () => {
  test("ヒーローのコピーと主要 CTA が表示される", async ({ page }) => {
    await page.goto("/");

    const main = page.getByRole("main");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "家族のレシピを",
    );

    const start = main.getByRole("link", { name: "無料で登録する" }).first();
    await expect(start).toBeVisible();
    await expect(start).toHaveAttribute("href", "/signup");

    await expect(main.getByRole("link", { name: "ログイン" })).toBeVisible();

    await expect(
      main.getByRole("button", { name: "ゲストで試す" }).first(),
    ).toBeVisible();
  });

  test("「無料で登録する」から新規登録画面へ遷移する", async ({ page }) => {
    await page.goto("/");

    await page
      .getByRole("main")
      .getByRole("link", { name: "無料で登録する" })
      .first()
      .click();

    await expect(page).toHaveURL(/\/signup$/);
    await expect(
      page.getByRole("heading", { name: "アカウント作成" }),
    ).toBeVisible();
  });

  test("主要セクションの見出しが揃っている", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "使える機能" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "レシピ登録で入力できる項目" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "よくある質問" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "まずは1品、登録してみてください" }),
    ).toBeVisible();
  });

  test("機能一覧に実装済みの機能が並ぶ", async ({ page }) => {
    await page.goto("/");

    for (const feature of [
      "レシピ登録",
      "写真つき一覧",
      "キーワード検索",
      "お気に入り",
      "下書き保存",
      "家族グループ",
    ]) {
      await expect(
        page.getByRole("heading", { name: feature, exact: true }),
      ).toBeVisible();
    }
  });
});
