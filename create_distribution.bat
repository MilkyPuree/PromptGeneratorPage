@echo off
chcp 65001 > nul
echo PromptGenerator Chrome拡張機能 配布用zipファイル生成
echo ============================================
echo.

rem 現在のディレクトリを取得
set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR%..

echo プロジェクトルート: %PROJECT_ROOT%
echo 出力ディレクトリ: %SCRIPT_DIR%
echo.

rem PowerShellで文字コード設定してPythonスクリプトを実行
powershell -Command "$OutputEncoding = [Text.Encoding]::UTF8; [Console]::OutputEncoding = [Text.Encoding]::UTF8; $env:PYTHONIOENCODING='utf-8'; python '%SCRIPT_DIR%create_distribution.py' 2>&1 | Out-String -Width 4096"

rem 実行結果をチェック
if %errorlevel% equ 0 (
    echo.
    echo 配布用zipファイルの生成が完了しました！
    echo ファイルは配布ページフォルダに保存されました
    echo.
    echo 使用方法:
    echo 1. 生成されたzipファイルをダウンロード
    echo 2. zipファイルを展開
    echo 3. Chrome拡張機能管理画面で「パッケージ化されていない拡張機能を読み込む」
    echo 4. 展開したフォルダを選択
    echo.
) else (
    echo.
    echo エラーが発生しました。
    echo Python環境とスクリプトを確認してください。
    echo.
)

pause