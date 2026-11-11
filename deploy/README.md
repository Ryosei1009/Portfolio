# 本番（VPS）での動かし方

Portfolio の API（`backend/`）を、VPS（ConoHa・Ubuntu 24.04）の Docker で動かしています。画面は Vercel です。

```
https://www.shinoryo.com  → Vercel（frontend/）
https://api.shinoryo.com  → Cloudflare → VPS の Caddy → portfolio コンテナ（127.0.0.1:3000）→ MySQL（/srv/infra）
```

| 置き場所 | 中身 |
|---|---|
| `/srv/portfolio/compose.yaml` | このフォルダの `compose.yaml` |
| `/srv/portfolio/.env` | 設定（`backend/.env.example` を参照。Git に入れない） |
| `/srv/portfolio/app` | `backend/` の中身（`Dockerfile` も含む） |
| `/srv/portfolio/app/images` | 作品の画像（コンテナの外に置いて、作り直しても消えないようにする） |

## 更新

`backend/` の変えたファイルを `/srv/portfolio/app` に置いて、作り直します。

```bash
cd /srv/portfolio && sudo docker compose up -d --build
```

## 工具管理を外したときの手順（2026/11）

それまでは、工具管理（tool_management）の API もこのコンテナの中で一緒に動かしていました
（`app/tool_management` に置いたコードを `/tool` で読み込み、`api.shinoryo.com/tool/api`）。
工具管理は別のコンテナ（`/srv/tool`、`toolapi.shinoryo.com`）に分けました。

**先に、工具管理の新しいコンテナを動かして、画面（tool.shinoryo.com）から使えることを確かめてから行います**
（工具管理リポジトリの `docs/vps.md`）。

```bash
cd /srv/portfolio
# 念のため、今のものを丸ごと取っておく
sudo cp -a app ~/portfolio-app-before-split
cp -a compose.yaml ~/portfolio-compose-before-split.yaml

# 1. 工具管理を読み込んでいる行を消す（index.js の3行・Dockerfile の2行・compose.yaml の1行）
sed -i '/工具管理システム（https:\/\/api.shinoryo.com\/tool\/）/d; /下の allowedOrigins のチェックより前に置く/d; /tool_management\/backend\/router/d' app/index.js
sed -i '/tool_management/d' app/Dockerfile compose.yaml
grep -n tool app/index.js app/Dockerfile compose.yaml   # 何も出なければ OK

# 2. 作り直して、動いているか確かめる
sudo docker compose up -d --build
sudo docker compose logs --tail 20
curl -s -o /dev/null -w '%{http_code}\n' https://api.shinoryo.com/aboutme/   # 200 なら OK

# 3. 工具管理の設定とコードを消す
sed -i '/^TM_/d' .env
sudo rm -rf app/tool_management
sudo docker compose up -d --build
```

最後に、Portfolio の DB ユーザー（`.env` の `MYSQL_USER`）から `tool_management` の権限を外します。

```bash
cd /srv/infra
U=$(grep '^MYSQL_USER=' /srv/portfolio/.env | cut -d= -f2)
sudo docker compose exec -T mysql sh -c 'exec mysql -uroot -p"$MYSQL_ROOT_PASSWORD"' <<EOF
SHOW GRANTS FOR '$U'@'%';
REVOKE ALL PRIVILEGES ON tool_management.* FROM '$U'@'%';
EOF
```

`REVOKE` がエラーになるときは、`SHOW GRANTS` の結果を見て、どの範囲に権限があるかを確かめます。
