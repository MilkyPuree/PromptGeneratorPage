/**
 * 最小限の配布ページ JavaScript（エラー修正版）
 */

class SimpleDistributionManager {
    constructor() {
        this.init();
    }

    async init() {
        try {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.loadFiles());
            } else {
                this.loadFiles();
            }
        } catch (error) {
            console.error('初期化エラー:', error);
        }
    }

    async loadFiles() {
        try {
            console.log('ファイル読み込み開始...');
            
            // 外部JSファイルからデータを取得（file://プロトコル対応）
            if (typeof window.availableFiles === 'undefined') {
                console.error('available-files.jsが読み込まれていません');
                return;
            }
            
            const data = window.availableFiles;
            
            console.log('データ読み込み完了:', data);
            
            this.displayFiles(data.files);
            this.updateLastModified(data.updated);
            
        } catch (error) {
            console.error('ファイル読み込みエラー:', error);
            this.showError(error.message);
        }
    }

    displayFiles(files) {
        const container = document.getElementById('downloadButtons');
        if (!container) {
            console.error('downloadButtons要素が見つかりません');
            return;
        }

        if (!files || files.length === 0) {
            container.innerHTML = '<p>利用可能なファイルがありません</p>';
            return;
        }

        container.innerHTML = ''; // クリア

        // 最新版を強調表示
        const latestFile = files[0];
        if (latestFile) {
            const latestButton = this.createDownloadButton(latestFile, true);
            container.appendChild(latestButton);
        }

        // その他のバージョンがある場合（アコーディオン形式）
        if (files.length > 1) {
            const otherVersionsContainer = this.createVersionsAccordion(files.slice(1));
            container.appendChild(otherVersionsContainer);
        }

        // 使用方法の補足説明
        const instructionDiv = document.createElement('div');
        instructionDiv.className = 'download-instructions';
        instructionDiv.style.cssText = `
            margin-top: 2rem;
            padding: 1rem;
            background: var(--bg-secondary);
            border-radius: var(--border-radius);
            font-size: var(--font-size-sm);
        `;
        instructionDiv.innerHTML = `
            <h4 style="margin-bottom: 0.5rem; color: var(--primary-color);">📋 インストール方法</h4>
            <ol style="margin: 0; padding-left: 1.5rem; color: var(--text-secondary);">
                <li>上記のボタンをクリックしてzipファイルをダウンロード</li>
                <li>ダウンロードしたzipファイルを適当な場所に展開</li>
                <li>Chrome拡張機能管理画面（chrome://extensions/）でデベロッパーモードを有効化</li>
                <li>「パッケージ化されていない拡張機能を読み込む」で展開したフォルダを選択</li>
            </ol>
        `;
        container.appendChild(instructionDiv);
    }

    createVersionsAccordion(historyFiles) {
        const accordion = document.createElement('div');
        accordion.className = 'versions-accordion';
        accordion.style.cssText = `
            margin-top: 1.5rem;
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius);
            overflow: hidden;
        `;

        // ヘッダー
        const accordionHeader = document.createElement('div');
        accordionHeader.className = 'accordion-header';
        accordionHeader.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1rem;
            background: var(--bg-secondary);
            cursor: pointer;
            user-select: none;
            transition: background 0.3s ease;
        `;

        accordionHeader.innerHTML = `
            <span style="font-weight: 600; color: var(--text-primary);">📂 その他のバージョン (${historyFiles.length}個)</span>
            <span class="accordion-arrow" style="font-size: 0.8rem; color: var(--text-secondary); transition: transform 0.3s ease;">▼</span>
        `;

        // コンテンツ
        const accordionContent = document.createElement('div');
        accordionContent.className = 'accordion-content';
        accordionContent.style.cssText = `
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
        `;

        const contentInner = document.createElement('div');
        contentInner.style.cssText = `
            padding: 1rem 1.5rem;
        `;

        historyFiles.forEach(file => {
            const link = this.createDownloadButton(file, false);
            link.style.marginBottom = '1rem';
            contentInner.appendChild(link);
        });

        accordionContent.appendChild(contentInner);

        // クリックイベント
        let isExpanded = false;
        accordionHeader.addEventListener('click', () => {
            isExpanded = !isExpanded;
            
            const arrow = accordionHeader.querySelector('.accordion-arrow');
            
            if (isExpanded) {
                // 展開
                arrow.textContent = '▲';
                accordionHeader.style.background = 'var(--bg-tertiary)';
                accordionContent.style.maxHeight = accordionContent.scrollHeight + 'px';
            } else {
                // 収縮
                arrow.textContent = '▼';
                accordionHeader.style.background = 'var(--bg-secondary)';
                accordionContent.style.maxHeight = '0';
            }
        });

        accordion.appendChild(accordionHeader);
        accordion.appendChild(accordionContent);

        return accordion;
    }

    createDownloadButton(file, isLatest = false) {
        const container = document.createElement('div');
        container.className = 'download-item';
        container.style.cssText = `
            margin-bottom: 1rem;
            padding: 1rem;
            background: ${isLatest ? 'var(--white)' : 'var(--light-gray)'};
            border-radius: var(--border-radius-lg);
            ${isLatest ? 'box-shadow: var(--shadow-md); border: 2px solid var(--primary-color);' : 'border: 1px solid var(--border-color);'}
            transition: all 0.3s ease;
        `;

        const button = document.createElement('a');
        button.href = file.url;
        button.className = `btn ${isLatest ? 'btn-download' : 'btn-secondary'}`;
        button.download = file.name;
        button.style.cssText = `
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            text-decoration: none;
            margin-bottom: 0.5rem;
            padding: 0.75rem 1.5rem;
            border-radius: var(--border-radius);
            transition: all 0.3s ease;
            font-weight: 600;
            ${isLatest ? 
                'background: var(--primary-color); color: var(--white);' : 
                'background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color);'
            }
        `;

        const sizeInKB = Math.round(file.size / 1024);
        const date = new Date(file.lastModified).toLocaleString('ja-JP');

        button.innerHTML = `
            <span>${isLatest ? '📥' : '📋'}</span>
            <span>${isLatest ? '最新版をダウンロード' : 'バージョン'}: ${file.name}</span>
        `;

        const infoDiv = document.createElement('div');
        infoDiv.style.cssText = `
            margin-top: 0.5rem;
            font-size: var(--font-size-sm);
            color: var(--text-secondary);
            display: flex;
            gap: 1rem;
        `;
        infoDiv.innerHTML = `
            <span>💾 ${sizeInKB} KB</span>
            <span>📅 ${date}</span>
        `;

        container.appendChild(button);
        container.appendChild(infoDiv);

        // ホバーエフェクト
        container.addEventListener('mouseenter', () => {
            container.style.transform = 'translateY(-2px)';
            container.style.boxShadow = '0 4px 12px var(--shadow-color)';
        });

        container.addEventListener('mouseleave', () => {
            container.style.transform = 'translateY(0)';
            container.style.boxShadow = isLatest ? 'var(--shadow-md)' : 'none';
        });

        return container;
    }

    updateLastModified(timestamp) {
        const element = document.getElementById('lastUpdated');
        if (element && timestamp) {
            const date = new Date(timestamp);
            element.textContent = date.toLocaleString('ja-JP');
        }
    }

    showError(message) {
        const container = document.getElementById('downloadButtons');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <p>❌ エラーが発生しました: ${message}</p>
                    <p>ページを再読み込みしてください。</p>
                </div>
            `;
        }
    }
}

// タブ切り替え機能
class TabManager {
    constructor() {
        this.initTabs();
    }

    initTabs() {
        const tabButtons = document.querySelectorAll('.setup-tab-btn');
        const tabContents = document.querySelectorAll('.setup-tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');

                // すべてのボタンとコンテンツからactiveを削除
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                // クリックされたボタンとそのコンテンツにactiveを追加
                button.classList.add('active');
                const targetContent = document.getElementById(`${targetTab}-content`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }
}

// 初期化
const distributionManager = new SimpleDistributionManager();
const tabManager = new TabManager();