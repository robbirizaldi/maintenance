/* Pengaturan Integrasi Blogger Feed */
const bloggerDomain = "domainanda.blogspot.com"; // GANTI DENGAN DOMAIN BLOGGER ANDA
const totalArtikel = 6; // Jumlah artikel yang ditampilkan

document.addEventListener("DOMContentLoaded", function() {
    const feedUrl = `https://${bloggerDomain}/feeds/posts/default?alt=json-in-script&max-results=${totalArtikel}&callback=showBloggerPosts`;

    const script = document.createElement('script');
    script.src = feedUrl;
    script.onerror = function() {
        document.getElementById('blogger-feed').innerHTML = '<p style="color:var(--text-muted);">Gagal memuat artikel.</p>';
    };
    document.body.appendChild(script);
});

function showBloggerPosts(data) {
    const bloggerContainer = document.getElementById('blogger-feed');
    
    if (!data || !data.feed || !data.feed.entry || data.feed.entry.length === 0) {
        bloggerContainer.innerHTML = '<p style="color:var(--text-muted);">Belum ada postingan dari Blogger.</p>';
        return;
    }

    const entries = data.feed.entry;
    let htmlContent = '';

    entries.forEach(entry => {
        const title = entry.title.$t;

        let postUrl = '#';
        entry.link.forEach(link => {
            if (link.rel === 'alternate') postUrl = link.href;
        });

        const publishedDate = new Date(entry.published.$t).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        let summary = '';
        if (entry.summary) {
            summary = entry.summary.$t;
        } else if (entry.content) {
            summary = entry.content.$t.replace(/<[^>]*>/g, '');
        }
        summary = summary.substring(0, 160) + '...';

        let thumbnailUrl = '';
        if (entry.media$thumbnail) {
            thumbnailUrl = entry.media$thumbnail.url.replace(/\/s72\-c\//, '/w600-h400-c/');
        } else if (entry.content && entry.content.$t.match(/<img.+?src="([^"]+)"/)) {
            thumbnailUrl = entry.content.$t.match(/<img.+?src="([^"]+)"/)[1];
        } else {
            thumbnailUrl = 'https://picsum.photos/600/400?grayscale';
        }

        htmlContent += `
            <article style="display: flex; gap: 20px; margin-bottom: 30px; border-bottom: 1px dashed var(--border-color); padding-bottom: 20px; flex-wrap: wrap; align-items: flex-start;">
                <div style="flex: 1 1 250px; max-width: 100%;">
                    <a href="${postUrl}" target="_blank" rel="noopener noreferrer">
                        <img src="${thumbnailUrl}" alt="${title}" style="width: 100%; height: 180px; object-fit: cover; border: 1px solid var(--border-color);">
                    </a>
                </div>
                <div style="flex: 2 1 400px;">
                    <h3 style="font-size: 1.4rem; font-style: italic; margin-bottom: 5px;">
                        <a href="${postUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--accent-primary);">${title}</a>
                    </h3>
                    <small style="color: var(--text-muted);">Published on ${publishedDate}</small>
                    <p style="margin-top: 10px; font-size: 1rem; color: var(--text-main);">${summary}</p>
                    <a href="${postUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block; margin-top: 10px; font-size: 0.9rem; text-decoration: underline; color: var(--text-muted);">
                        Read full article &rarr;
                    </a>
                </div>
            </article>
        `;
    });

    bloggerContainer.innerHTML = htmlContent;
}
