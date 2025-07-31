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
    
    rem 自動コミット・プッシュ処理
    echo ============================================
    echo Git自動コミット・プッシュを実行します
    echo ============================================
    echo.
    
    rem プロジェクトルートに移動
    cd /d "%PROJECT_ROOT%"
    
    rem git add
    echo git add を実行中...
    git add .
    
    rem 日時を取得してコミットメッセージを作成
    for /f "tokens=1-3 delims=/-. " %%a in ('date /t') do set TODAY=%%a/%%b/%%c
    for /f "tokens=1-2 delims=:. " %%a in ('time /t') do set NOW=%%a:%%b
    set COMMIT_MSG=配布ビルド作成とドキュメント更新 %TODAY% %NOW%
    
    rem git commit
    echo.
    echo git commit を実行中...
    git commit -m "%COMMIT_MSG%"
    
    rem コミット成功時のみプッシュ
    if %errorlevel% equ 0 (
        echo.
        echo git push を実行中...
        git push
        
        if %errorlevel% equ 0 (
            echo.
            echo ============================================
            echo コミット・プッシュが完了しました！
            echo コミットメッセージ: %COMMIT_MSG%
            echo ============================================
        ) else (
            echo.
            echo プッシュに失敗しました。
            echo ネットワーク接続を確認してください。
        )
    ) else (
        echo.
        echo コミットする変更がないか、コミットに失敗しました。
    )
    
    rem 元のディレクトリに戻る
    cd /d "%SCRIPT_DIR%"
    
) else (
    echo.
    echo エラーが発生しました。
    echo Python環境とスクリプトを確認してください。
    echo.
)

pause