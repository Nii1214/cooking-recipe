# `infrastructure/repositories`について

## 命名規則
- create〇〇： `INSERT`処理の場合
- save〇〇：`DELETE`処理後に`INSERT`処理をする
  - レシピの手順等、更新では対応できない要件を満たすための表現