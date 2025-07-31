/**
 * ダウンロード統計記録システム
 * 配布ページのダウンロードボタンクリック時にGoogle Apps Scriptに統計を送信
 */

class DownloadStatsManager {
  constructor() {
    // GASのWebアプリURLを設定してください（デプロイ後に更新）
    this.apiUrl = "https://script.google.com/macros/s/AKfycbyqx_WyA1MZb2AGpID8LaqEuPOPmWJueCkbrw2Z_v9k4iRged9DpxFF-Tgrh1xFTDORvA/exec";
    this.version = "1.0.0"; // 拡張機能のバージョン
  }

  /**
   * ダウンロード統計を記録
   * @param {Event} event - クリックイベント（オプション）
   */
  async recordDownload(event = null) {
    try {
      // ユーザーエージェント情報を取得
      const userAgent = navigator.userAgent;
      
      // パラメータを構築
      const params = new URLSearchParams({
        version: this.version,
        userAgent: userAgent,
        timestamp: Date.now()
      });

      // GASに送信（Fire-and-forget方式）
      const url = `${this.apiUrl}?${params.toString()}`;
      
      // 非同期で送信（ダウンロードを阻害しない）
      fetch(url, {
        method: 'GET',
        mode: 'cors'
      })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          console.log(`✅ Download logged: ${data.date}`);
        } else {
          console.warn('❌ Download log failed:', data.message);
        }
      })
      .catch(error => {
        console.warn('📊 Download stats unavailable:', error.message);
        // エラーでもダウンロードは継続
      });

    } catch (error) {
      console.warn('📊 Download stats error:', error.message);
      // エラーでもダウンロードは継続
    }
  }

  /**
   * ダウンロードボタンにイベントリスナーを追加
   * @param {string|Element} buttonSelector - ボタンのセレクターまたは要素
   */
  attachToDownloadButton(buttonSelector) {
    const button = typeof buttonSelector === 'string' 
      ? document.querySelector(buttonSelector)
      : buttonSelector;

    if (!button) {
      console.warn('⚠️ Download button not found:', buttonSelector);
      return;
    }

    // クリックイベントリスナーを追加
    button.addEventListener('click', (event) => {
      // 統計記録（非阻害）
      this.recordDownload(event);
      
      // 元のダウンロード処理は継続
      console.log('📦 Download initiated');
    });

    console.log('✅ Download stats attached to button');
  }

  /**
   * 複数のダウンロードボタンに一括でアタッチ
   * @param {string} buttonSelector - ボタンのセレクター
   */
  attachToAllDownloadButtons(buttonSelector = '.download-button, [download], a[href$=".zip"], a[href$=".crx"]') {
    const buttons = document.querySelectorAll(buttonSelector);
    
    buttons.forEach((button, index) => {
      button.addEventListener('click', (event) => {
        this.recordDownload(event);
        console.log(`📦 Download ${index + 1} initiated`);
      });
    });

    console.log(`✅ Download stats attached to ${buttons.length} buttons`);
  }

  /**
   * APIのURLを設定
   * @param {string} url - GASのWebアプリURL
   */
  setApiUrl(url) {
    this.apiUrl = url;
  }

  /**
   * バージョンを設定
   * @param {string} version - 拡張機能のバージョン
   */
  setVersion(version) {
    this.version = version;
  }
}

// グローバルインスタンスを作成
const downloadStats = new DownloadStatsManager();

// DOM読み込み完了後に自動初期化
document.addEventListener('DOMContentLoaded', () => {
  // 配布ページ専用：動的に生成されるダウンロードボタンを監視
  const observer = new MutationObserver(() => {
    // ダウンロードボタンが動的に生成された後にアタッチ
    const downloadButtons = document.querySelectorAll('#downloadButtons a[href$=".zip"], #downloadButtons a[download]');
    downloadButtons.forEach((button, index) => {
      // 既にリスナーが追加されていないかチェック
      if (!button.hasAttribute('data-stats-attached')) {
        button.addEventListener('click', (event) => {
          downloadStats.recordDownload(event);
          console.log(`📦 Distribution download ${index + 1} initiated`);
        });
        button.setAttribute('data-stats-attached', 'true');
      }
    });
  });

  // downloadButtons要素の変更を監視
  const downloadContainer = document.getElementById('downloadButtons');
  if (downloadContainer) {
    observer.observe(downloadContainer, { childList: true, subtree: true });
  }

  // 既存のダウンロードボタンにもアタッチ
  downloadStats.attachToAllDownloadButtons('a[href="#download"], .btn-primary[href="#download"]');
});

// 手動使用のためのグローバル公開
window.downloadStats = downloadStats;
window.DownloadStatsManager = DownloadStatsManager;