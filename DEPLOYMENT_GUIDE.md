# 🚀 GitHub Pages 配布サイト更新ガイド

**対象**: Claude Code（妖精ちゃん）向けの詳細手順書

## 📋 目次

1. [更新が必要なタイミング](#更新が必要なタイミング)
2. [事前準備](#事前準備)
3. [更新手順](#更新手順)
4. [トラブルシューティング](#トラブルシューティング)
5. [確認項目](#確認項目)

---

## 🎯 更新が必要なタイミング

以下の変更があった場合、配布サイトを更新する必要があります：

- ✅ マスターデータ更新（`assets/master/default-master.js`）
- ✅ 機能追加・バグ修正
- ✅ バージョン番号変更（`manifest.json`）
- ✅ UI/CSS の変更

## 🔧 事前準備

### 1. バージョン確認

```bash
# manifest.json のバージョンを確認
cat manifest.json | grep version
# 例: "version": "1.0.1"
```

### 2. 変更内容の確認

```bash
# 変更されたファイルを確認
git status
git diff
```

## 📝 更新手順

### ステップ1: バージョン表記を更新

**ファイル**: `配布ページ/index.html`

```html
<!-- 更新箇所 -->
<p class="version">Chrome Extension v1.0.1</p>
```

- `manifest.json` のバージョンと一致させること

### ステップ2: 配布ファイルを生成

**重要**: プロジェクトルートから実行すること！

```bash
# ✅ 正しい実行方法（プロジェクトルートから）
python "配布ページ/create_distribution.py"

# ❌ 間違った実行方法（配布ページフォルダ内から実行すると失敗）
cd 配布ページ
python create_distribution.py  # これは NG！
```

**実行結果の確認**:
- `配布ページ/downloads/PromptGenerator.zip` が生成される
- ファイルサイズ: 約 700-800KB（JSファイルが53個含まれる）
- タイムスタンプが最新になっている

### ステップ3: 生成されたzipファイルを確認

```bash
# zipファイルサイズを確認（700KB以上が正常）
ls -lh "配布ページ/downloads/PromptGenerator.zip"

# JSファイル数を確認（53個が正常）
unzip -l "配布ページ/downloads/PromptGenerator.zip" | grep "\.js$" | wc -l

# マスターデータが含まれているか確認
unzip -l "配布ページ/downloads/PromptGenerator.zip" | grep "default-master.js"
```

### ステップ4: 自動Git操作の確認

`create_distribution.py` は以下を自動実行します：

1. **GitHubフォルダ同期** - 配布用ファイルを `配布ページ/GitHub/` にコピー
2. **GitHubフォルダCommit & Push** - `origin/master` にプッシュ
3. **配布ページリポジトリCommit & Push** - `origin/main` にプッシュ

**成功メッセージの例**:
```
GitHub フォルダ Git 操作: 成功
配布ページリポジトリ Git 操作: 成功
```

### ステップ5: GitHub Pages デプロイ確認

数分待ってから、以下のURLにアクセスして確認：

- **配布サイトURL**: https://milkypuree.github.io/PromptGeneratorPage/
- **バージョン表記**: ヘッダーに表示されるバージョンが最新か確認
- **ダウンロードリンク**: zipファイルがダウンロードできるか確認

---

## 🐛 トラブルシューティング

### 問題1: エンコーディングエラーが発生

**症状**:
```
エラーが発生しました: 'cp932' codec can't encode character
```

**原因**: 特殊文字を含むファイル名の表示エラー

**解決策**:
- スクリプトは既に修正済み（try-except で囲んでいる）
- エラーメッセージは無視してOK（zipファイルは正常に生成される）

### 問題2: zipファイルが小さい（300KB以下）

**症状**:
```bash
# JSファイルが1個しか含まれていない
unzip -l "配布ページ/downloads/PromptGenerator.zip" | grep "\.js$" | wc -l
# 出力: 1
```

**原因**: 配布ページフォルダ内から実行した

**解決策**:
```bash
# プロジェクトルートから再実行
cd e:\Project\Extension\Prompt
python "配布ページ/create_distribution.py"
```

### 問題3: Git操作が失敗する

**症状**:
```
GitHub フォルダ Git 操作: 失敗
```

**原因**:
- GitHubフォルダのリモートリポジトリ設定が間違っている
- ネットワーク接続の問題

**解決策**:
```bash
# GitHubフォルダのリモート確認
cd "配布ページ/GitHub"
git remote -v

# 配布ページリポジトリのリモート確認
cd ..
git remote -v
```

### 問題4: バージョン番号が古いまま

**原因**: `配布ページ/index.html` のバージョン表記を更新していない

**解決策**:
```html
<!-- 配布ページ/index.html の27行目あたり -->
<p class="version">Chrome Extension v1.0.1</p>
```

---

## ✅ 確認項目チェックリスト

配布サイト更新時の必須確認項目：

### 事前確認
- [ ] `manifest.json` のバージョン確認
- [ ] 変更内容の確認（git status / git diff）
- [ ] マスターデータ更新時は `generate_master.py` 実行済み

### バージョン表記更新
- [ ] `配布ページ/index.html` のバージョンを更新
- [ ] `manifest.json` とバージョン番号が一致している

### 配布ファイル生成
- [ ] プロジェクトルートから `create_distribution.py` 実行
- [ ] zipファイルサイズが 700KB 以上
- [ ] JSファイル数が 53個
- [ ] マスターデータが含まれている

### Git操作確認
- [ ] GitHubフォルダ Git操作: 成功
- [ ] 配布ページリポジトリ Git操作: 成功
- [ ] リモートリポジトリにプッシュ完了

### デプロイ確認
- [ ] GitHub Pages サイトにアクセス可能
- [ ] バージョン表記が最新
- [ ] zipファイルがダウンロード可能
- [ ] ファイルサイズが正常（700KB以上）

---

## 📚 関連ファイル

| ファイル | 役割 |
|---------|------|
| `配布ページ/create_distribution.py` | 配布ファイル生成スクリプト |
| `配布ページ/create_distribution.bat` | Windowsバッチファイル（自動実行用） |
| `配布ページ/index.html` | 配布サイトのメインページ |
| `配布ページ/downloads/` | 配布zipファイル保存先 |
| `配布ページ/GitHub/` | GitHub Pages 用ファイル（自動同期） |
| `manifest.json` | 拡張機能のバージョン情報 |

---

## 🧚 妖精ちゃんへのメモ

- **迷ったらこのガイドを見るのです！**
- **エラーメッセージは怖くないのです！** - エンコーディングエラーは無視してOK
- **zipファイルサイズが最重要チェックポイント** - 700KB未満なら失敗
- **Git操作は自動** - `create_distribution.py` が全部やってくれるのです
- **困ったらユーザーに聞くのです！** - 無理に進めない

---

**最終更新**: 2025-11-04
**更新者**: リリィ（Claude Code 妖精）
