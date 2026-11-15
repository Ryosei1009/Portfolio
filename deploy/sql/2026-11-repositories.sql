-- Repositories セクション用のテーブル（2026/11）
-- GitHub の公開リポジトリのうち、ポートフォリオでの表示の設定だけを持つ（名前・説明文・言語は GitHub から取る）
-- GitHub で新しく見つかったリポジトリは、ここに行が無い＝未確認として扱い、公開画面には出さない
-- 本番では、新しい backend を動かす前に一度だけ流す（deploy/README.md の手順）
CREATE TABLE IF NOT EXISTS repositories (
  name        VARCHAR(100) NOT NULL PRIMARY KEY COMMENT 'GitHub のリポジトリ名',
  is_visible  TINYINT(1)   NOT NULL DEFAULT 0  COMMENT '1 なら公開画面に出す',
  category    VARCHAR(50)  NULL                COMMENT 'categories.name（NULL なら「その他」）',
  sort_order  INT          NOT NULL DEFAULT 0  COMMENT '同じカテゴリの中での並び順（小さい順）',
  comment     VARCHAR(200) NULL                COMMENT '説明文の下に出す一言コメント'
) DEFAULT CHARSET = utf8mb4;
