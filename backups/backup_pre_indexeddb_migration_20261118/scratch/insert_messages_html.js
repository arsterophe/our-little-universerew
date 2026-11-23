import fs from 'fs';

let html = fs.readFileSync('index.html', 'utf8');

// 1. Add link stylesheet in <head>
if (!html.includes('/messages.css')) {
  html = html.replace(
    /<link rel="stylesheet" href="\/photobooth\.css">/,
    '<link rel="stylesheet" href="/photobooth.css">\r\n  <link rel="stylesheet" href="/messages.css">'
  );
}

// 2. Messages view markup
const messagesSection = `
    <!-- ========================================================================= -->
    <!-- VIEW: OUR LITTLE MESSAGES (FASE 6) -->
    <!-- ========================================================================= -->
    <section class="view-section view-messages" id="view-messages" aria-label="Our Little Messages" aria-hidden="true">
      <div class="msg-container">
        <!-- Top Bar -->
        <header class="msg-top-bar">
          <div class="msg-brand-group">
            <div class="msg-brand-icon" aria-hidden="true">✉</div>
            <div>
              <h2 class="msg-title">Our Little Messages</h2>
              <p class="msg-subtitle">Kotak Surat & Obrolan Realtime Sahabat ✦ Nyanya, Lala, Lele</p>
            </div>
          </div>

          <div class="msg-top-actions">
            <!-- Active User Identity Banner -->
            <div class="pb-active-identity-banner" id="msg-active-user-badge">
              <img src="/assets/avatar_nyanya_hd.png" alt="Avatar User" class="pb-identity-avatar" id="msg-active-user-avatar" />
              <div class="pb-identity-meta">
                <span class="pb-identity-name" id="msg-active-user-name">Nyanya ★</span>
                <span class="pb-identity-sub" id="msg-active-user-sub">Universe KIDULT</span>
              </div>
            </div>

            <!-- Return Home Button -->
            <button type="button" class="msg-btn-back" id="btn-msg-return-home" title="Kembali ke Halaman Universe">
              🏠 Kembali
            </button>
          </div>
        </header>

        <!-- Main Chat Grid -->
        <div class="msg-main-grid">
          <!-- Left Sidebar: Conversations List -->
          <aside class="msg-conversations-card" aria-label="Daftar Percakapan Sahabat">
            <div class="msg-sidebar-header">
              <h3 class="msg-sidebar-title">💬 Percakapan Sahabat</h3>
            </div>
            <div class="msg-conversation-items" id="msg-conversation-list" role="tablist">
              <!-- Rendered dynamically by messages_view.js -->
            </div>
          </aside>

          <!-- Right: Chat Window Pane -->
          <main class="msg-chat-card" aria-label="Jendela Percakapan">
            <!-- Chat Header -->
            <div class="msg-chat-header">
              <div class="msg-chat-partner-info">
                <img src="/assets/avatar_lala_hd.png" alt="Partner Avatar" class="msg-partner-avatar" id="msg-partner-avatar" />
                <div>
                  <h4 class="msg-partner-name" id="msg-partner-name">Lala ☼</h4>
                  <p class="msg-partner-sub" id="msg-partner-sub">Universe TO YOU</p>
                </div>
              </div>
              <div id="msg-thread-status" style="display:none; font-size:0.75rem; color:#fde047;"></div>
            </div>

            <!-- Message Thread Scroll Area -->
            <div class="msg-feed-area" id="msg-feed-area" role="log" aria-live="polite">
              <!-- Rendered dynamically by messages_view.js -->
            </div>

            <!-- Message Composer -->
            <footer class="msg-composer">
              <!-- Quick Emoji Bar -->
              <div class="msg-quick-emojis" aria-label="Pintasan Emoji">
                <button type="button" class="msg-emoji-btn" data-emoji="💖" title="Hati">💖</button>
                <button type="button" class="msg-emoji-btn" data-emoji="✨" title="Kilau">✨</button>
                <button type="button" class="msg-emoji-btn" data-emoji="🌸" title="Bunga">🌸</button>
                <button type="button" class="msg-emoji-btn" data-emoji="🌙" title="Bulan">🌙</button>
                <button type="button" class="msg-emoji-btn" data-emoji="★" title="Bintang">★</button>
                <button type="button" class="msg-emoji-btn" data-emoji="💌" title="Surat">💌</button>
                <button type="button" class="msg-emoji-btn" data-emoji="☕" title="Kopi">☕</button>
              </div>

              <!-- Input Row -->
              <div class="msg-input-row">
                <textarea
                  class="msg-textarea"
                  id="msg-input-text"
                  placeholder="Tulis pesan manis untuk sahabatmu..."
                  rows="1"
                  maxlength="2000"
                  aria-label="Isi pesan"
                ></textarea>
                <button type="button" class="msg-send-btn" id="btn-msg-send" title="Kirim Pesan" disabled>
                  <span>➤</span>
                </button>
              </div>

              <!-- Footer with Char Counter and Hint -->
              <div class="msg-composer-footer">
                <span>Tekan Enter untuk kirim, Shift+Enter untuk baris baru</span>
                <span id="msg-char-counter">0 / 2000</span>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </section>
`;

if (!html.includes('id="view-messages"')) {
  const targetPattern = /<\/section>\s*<\/div>\s*<!-- Notification Toast/;
  const match = html.match(targetPattern);
  if (match) {
    html = html.replace(targetPattern, '</section>\r\n' + messagesSection + '\r\n    </div>\r\n\r\n    <!-- Notification Toast');
    console.log('Inserted view-messages into index.html');
  } else {
    console.error('Could not find insertion point');
  }
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully updated index.html with Messages view and CSS');

