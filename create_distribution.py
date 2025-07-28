#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PromptGenerator Chrome拡張機能 配布用zipファイル生成スクリプト
配布に必要なファイルのみを含むzipファイルを自動生成します
"""

import os
import sys
import zipfile
import shutil
import json
from datetime import datetime
from pathlib import Path

# 配布に必要な最小限のファイル・フォルダ（Chrome拡張機能起動に必要）
REQUIRED_FILES = [
    'manifest.json',
    'popup.html',
]

REQUIRED_FOLDERS = [
    'assets/',      # アイコンとマスターデータ
    'js/',          # 全JavaScriptファイル
    'css/',         # 全CSSファイル  
    'lib/',         # ライブラリ（papaparse等）
]

# 配布から除外するファイル・フォルダのリスト
EXCLUDE_PATTERNS = [
    # 開発・デバッグ用
    'test-*.html',
    '*.code-workspace',
    
    # バックアップファイル
    'backups/',
    'data-management/backups/',
    
    # 開発ツール・スクリプト
    'tools/',
    'data-management/',
    'GAS/',
    'web-api-gas/',
    'bulk_replace_ids.sh',
    
    # ドキュメント・説明ファイル
    '*.md',
    'ReadMe.md',
    'constantsREADME.md',
    
    # 一時ファイル・ログ
    'Stable/',
    '*.log',
    '*.tmp',
    
    # jQuery関連（現在も一部で使用中のため含める）
    # 'lib/jquery*.js',  # コメントアウト - 実際にはまだ使用されている
    
    # 配布ページ自体
    '配布ページ/',
    
    # その他不要ファイル
    '*.tsv',
    '妖精の思い出.md',
    'テスト時の確認項目.md',
    '新要素候補.tsv',
]

def should_include_file(file_path, base_path):
    """ファイルを配布zipに含めるかどうかを判定（最小限構成）"""
    relative_path = os.path.relpath(file_path, base_path).replace('\\', '/')
    
    # 必須ファイルチェック
    if relative_path in REQUIRED_FILES:
        return True
    
    # 必須フォルダチェック
    for folder in REQUIRED_FOLDERS:
        if relative_path.startswith(folder):
            # 除外パターンチェック
            for exclude_pattern in EXCLUDE_PATTERNS:
                if exclude_pattern.endswith('/'):
                    if relative_path.startswith(exclude_pattern) or f'/{exclude_pattern}' in relative_path:
                        return False
                elif '*' in exclude_pattern:
                    import fnmatch
                    if fnmatch.fnmatch(relative_path, exclude_pattern):
                        return False
                else:
                    if relative_path == exclude_pattern or relative_path.endswith(f'/{exclude_pattern}'):
                        return False
            return True
    
    return False

def get_version_from_manifest(project_root):
    """manifest.jsonからバージョン情報を取得"""
    manifest_path = os.path.join(project_root, 'manifest.json')
    try:
        with open(manifest_path, 'r', encoding='utf-8') as f:
            manifest = json.load(f)
            return manifest.get('version', '1.0.0')
    except Exception:
        return '1.0.0'

def create_distribution_zip(project_root, output_dir):
    """配布用zipファイルを作成"""
    
    # バージョン情報とタイムスタンプを取得
    version = get_version_from_manifest(project_root)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    # 基本ファイル名（シンプル）
    basic_zip_filename = 'PromptGenerator.zip'
    basic_zip_path = os.path.join(output_dir, basic_zip_filename)
    
    # 履歴用ファイル名（日付付き）
    history_zip_filename = f'PromptGenerator_v{version}_{timestamp}.zip'
    history_zip_path = os.path.join(output_dir, history_zip_filename)
    
    print(f"配布用zipファイルを作成中: {basic_zip_filename}")
    print("-" * 50)
    
    # まず基本ファイル（PromptGenerator.zip）を作成
    with zipfile.ZipFile(basic_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        file_count = 0
        
        # プロジェクトルートを走査
        for root, dirs, files in os.walk(project_root):
            # .gitなどの隠しディレクトリをスキップ
            dirs[:] = [d for d in dirs if not d.startswith('.')]
            
            for file in files:
                file_path = os.path.join(root, file)
                
                # 隠しファイルをスキップ
                if file.startswith('.'):
                    continue
                
                # 包含判定
                if should_include_file(file_path, project_root):
                    relative_path = os.path.relpath(file_path, project_root)
                    zipf.write(file_path, relative_path)
                    print(f"追加: {relative_path}")
                    file_count += 1
                else:
                    relative_path = os.path.relpath(file_path, project_root)
                    print(f"除外: {relative_path}")
    
    print("-" * 50)
    print(f"基本zipファイル作成完了: {basic_zip_filename}")
    print(f"保存場所: {basic_zip_path}")
    print(f"含まれるファイル数: {file_count}")
    
    # 履歴用ファイルを複製作成
    print(f"履歴用ファイルを作成中: {history_zip_filename}")
    shutil.copy2(basic_zip_path, history_zip_path)
    print(f"履歴用ファイル作成完了: {history_zip_path}")
    
    # ファイルサイズを表示
    zip_size = os.path.getsize(basic_zip_path)
    if zip_size > 1024 * 1024:
        size_str = f"{zip_size / (1024 * 1024):.2f} MB"
    elif zip_size > 1024:
        size_str = f"{zip_size / 1024:.2f} KB"
    else:
        size_str = f"{zip_size} bytes"
    
    print(f"ファイルサイズ: {size_str}")
    
    return basic_zip_path, basic_zip_filename, history_zip_path, history_zip_filename

def update_download_page(output_dir, zip_filename):
    """配布ページのダウンロードリンクを更新（JSON形式）"""
    import glob
    
    # zipファイル情報を収集
    zip_info_list = []
    
    # 1. 基本ファイル（PromptGenerator.zip）を最優先で追加
    basic_zip_path = os.path.join(output_dir, "PromptGenerator.zip")
    if os.path.exists(basic_zip_path):
        zip_size = os.path.getsize(basic_zip_path)
        zip_mtime = os.path.getmtime(basic_zip_path)
        
        zip_info_list.append({
            "name": "PromptGenerator.zip",
            "url": "downloads/PromptGenerator.zip",
            "size": zip_size,
            "lastModified": datetime.fromtimestamp(zip_mtime).isoformat()
        })
    
    # 2. 履歴ファイル（日付付き）を追加
    history_pattern = os.path.join(output_dir, "PromptGenerator_v*_*.zip")
    history_files = glob.glob(history_pattern)
    
    for zip_path in history_files:
        zip_name = os.path.basename(zip_path)
        zip_size = os.path.getsize(zip_path)
        zip_mtime = os.path.getmtime(zip_path)
        
        zip_info_list.append({
            "name": zip_name,
            "url": f"downloads/{zip_name}",
            "size": zip_size,
            "lastModified": datetime.fromtimestamp(zip_mtime).isoformat()
        })
    
    # 履歴ファイルのみをソート（基本ファイルは先頭を維持）
    if len(zip_info_list) > 1:
        # 基本ファイル（PromptGenerator.zip）を除く履歴ファイルをソート
        basic_file = None
        history_files = []
        
        for item in zip_info_list:
            if item["name"] == "PromptGenerator.zip":
                basic_file = item
            else:
                history_files.append(item)
        
        # 履歴ファイルを日付順でソート
        history_files.sort(key=lambda x: x["lastModified"], reverse=True)
        
        # 基本ファイル（先頭）+ 履歴ファイル（日付順）
        zip_info_list = ([basic_file] if basic_file else []) + history_files
    
    # JSONファイルを配布ページルートに生成（downloads外）
    script_dir = os.path.dirname(output_dir)  # downloadsの親ディレクトリ（配布ページルート）
    json_path = os.path.join(script_dir, 'available-files.json')
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump({
            "files": zip_info_list,
            "updated": datetime.now().isoformat(),
            "count": len(zip_info_list)
        }, f, ensure_ascii=False, indent=2)
    
    # JavaScript内の静的ファイルリストも更新
    update_static_file_list(script_dir, zip_info_list)
    
    print(f"配布ページ更新: {zip_filename}")
    print(f"ファイル一覧JSON生成: available-files.json ({len(zip_info_list)}件)")
    print(f"ファイル一覧JS生成: available-files.js (file://プロトコル対応)")

def update_static_file_list(script_dir, zip_info_list):
    """available-files.jsファイルを更新"""
    available_files_js_path = os.path.join(script_dir, 'available-files.js')
    
    try:
        # available-files.jsの内容を生成
        js_content = "// 配布ファイル情報（file://プロトコル対応用）\n"
        js_content += "window.availableFiles = {\n"
        js_content += '  "files": [\n'
        
        for i, file_info in enumerate(zip_info_list):
            js_content += f"""    {{
      "name": "{file_info['name']}",
      "url": "{file_info['url']}",
      "size": {file_info['size']},
      "lastModified": "{file_info['lastModified']}"
    }}"""
            if i < len(zip_info_list) - 1:
                js_content += ","
            js_content += "\n"
        
        js_content += "  ],\n"
        js_content += f'  "updated": "{datetime.now().isoformat()}",\n'
        js_content += f'  "count": {len(zip_info_list)}\n'
        js_content += "};"
        
        # ファイルに書き出し
        with open(available_files_js_path, 'w', encoding='utf-8') as f:
            f.write(js_content)
            
        print(f"available-files.js更新完了: {len(zip_info_list)}件")
        
    except Exception as e:
        print(f"available-files.js更新エラー: {e}")

def main():
    """メイン処理"""
    # プロジェクトルート（このスクリプトの親ディレクトリ）
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    output_dir = os.path.join(script_dir, 'downloads')  # downloadsフォルダに出力
    
    # downloadsフォルダが存在しない場合は作成
    os.makedirs(output_dir, exist_ok=True)
    
    print("PromptGenerator Chrome拡張機能 配布用zipファイル生成")
    print("=" * 60)
    print(f"プロジェクトルート: {project_root}")
    print(f"出力ディレクトリ: {output_dir}")
    print()
    
    try:
        # 配布用zipファイル作成
        basic_zip_path, basic_zip_filename, history_zip_path, history_zip_filename = create_distribution_zip(project_root, output_dir)
        
        # 配布ページの更新（基本ファイル名を使用）
        update_download_page(output_dir, basic_zip_filename)
        
        print()
        print("配布用zipファイルの生成が完了しました！")
        
    except Exception as e:
        print(f"エラーが発生しました: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()