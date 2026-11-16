-- 作品の期間・人数・担当・技術のタグと、About Me のスキル欄（2026/11）
-- これまで目的の先頭に「【期間】…／【人数】…／【担当】…／【技術】…」と文章で書いていたものを、専用の項目にする
-- スキルは、これまで自己紹介の「詳しく読む」の中に書いていたものを、専用の項目にしてカードで出す
-- 本番では、新しい backend を動かす前に一度だけ流す（2回流すと「列がすでにある」エラーになるだけで、データは壊れない）
ALTER TABLE works
  ADD COLUMN period VARCHAR(50)  NULL COMMENT '期間（例: 2024年2月〜2026年7月）',
  ADD COLUMN team   VARCHAR(50)  NULL COMMENT '人数（例: 2〜3人）',
  ADD COLUMN role   VARCHAR(100) NULL COMMENT '担当（例: オーナー）',
  ADD COLUMN tech   VARCHAR(255) NULL COMMENT '技術（「, 」か「、」区切り。例: React, MySQL）';

ALTER TABLE about_me
  ADD COLUMN skills TEXT NULL COMMENT 'スキル（Markdown）';
