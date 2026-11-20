/* Blog likes & comments — talks to the Google Apps Script in google-apps-script/blog-responses.gs */
(function () {
    // Paste the Web app URL from Apps Script here (Deploy → Manage deployments → Web app URL).
    var ENDPOINT = '';

    ENDPOINT = window.VP_RESPONSES_ENDPOINT || ENDPOINT;
    if (!ENDPOINT) return;                        // not connected yet: the sections stay hidden

    function store(key, val) {
        try {
            if (val === undefined) return JSON.parse(localStorage.getItem(key) || 'null');
            localStorage.setItem(key, JSON.stringify(val));
        } catch (e) { return null; }
    }
    function visitorId() {
        var id = store('vp-visitor');
        if (!id) { id = Math.random().toString(36).slice(2) + Date.now().toString(36); store('vp-visitor', id); }
        return id;
    }
    function get(params) {
        var q = Object.keys(params).map(function (k) { return k + '=' + encodeURIComponent(params[k]); }).join('&');
        return fetch(ENDPOINT + (ENDPOINT.indexOf('?') > -1 ? '&' : '?') + q).then(function (r) { return r.json(); });
    }
    function post(body) {
        return fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },   // plain text avoids a CORS pre-flight
            body: JSON.stringify(body)
        }).then(function (r) { return r.json(); });
    }
    function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
    function fmtDate(iso) {
        var d = new Date(iso);
        if (isNaN(d)) return '';
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    /* ---------------- single post ---------------- */
    var box = document.querySelector('.vp-responses[data-slug]');
    if (box) {
        var slug = box.getAttribute('data-slug');
        var likeBtn = box.querySelector('.vp-like-btn');
        var likeNum = box.querySelector('[data-like-count]');
        var likeWord = box.querySelector('[data-like-word]');
        var list = box.querySelector('[data-comments]');
        var countEl = box.querySelector('[data-comment-count]');
        var form = box.querySelector('.vp-comment-form');
        var status = box.querySelector('[data-status]');
        var liked = store('vp-liked') || {};
        var likes = 0, comments = [];

        box.hidden = false;

        function paintLikes() {
            likeNum.textContent = likes;
            likeWord.textContent = likes === 1 ? 'like' : 'likes';
            var on = !!liked[slug];
            likeBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
            likeBtn.classList.toggle('is-liked', on);
            likeBtn.querySelector('.vp-like-label').textContent = on ? 'Liked' : 'Like';
            likeBtn.disabled = on;
        }
        function commentNode(c, fresh) {
            var li = document.createElement('li');
            li.className = 'vp-comment' + (fresh ? ' is-fresh' : '');
            var head = document.createElement('div');
            head.className = 'vp-comment-head';
            var nm = document.createElement('span');
            nm.className = 'vp-comment-name';
            nm.textContent = c.name;
            var tm = document.createElement('time');
            tm.className = 'vp-comment-time';
            tm.dateTime = c.time;
            tm.textContent = fmtDate(c.time);
            head.appendChild(nm);
            head.appendChild(tm);
            var p = document.createElement('p');
            p.className = 'vp-comment-text';
            p.textContent = c.text;
            li.appendChild(head);
            li.appendChild(p);
            return li;
        }
        function paintComments() {
            list.innerHTML = '';
            countEl.textContent = comments.length ? '(' + comments.length + ')' : '';
            if (!comments.length) {
                var empty = document.createElement('li');
                empty.className = 'vp-comments-empty';
                empty.textContent = 'No comments yet. Be the first to respond.';
                list.appendChild(empty);
                return;
            }
            comments.forEach(function (c) { list.appendChild(commentNode(c)); });
        }

        get({ action: 'post', slug: slug }).then(function (d) {
            if (!d.ok) throw new Error(d.error);
            likes = d.likes || 0;
            comments = d.comments || [];
            paintLikes();
            paintComments();
        }).catch(function () {
            list.innerHTML = '<li class="vp-comments-empty">Comments could not be loaded just now. Please try again later.</li>';
            paintLikes();
        });

        likeBtn.addEventListener('click', function () {
            if (liked[slug]) return;
            liked[slug] = 1;
            store('vp-liked', liked);
            likes += 1;
            paintLikes();
            likeBtn.classList.add('is-pop');
            post({ action: 'like', slug: slug, visitor: visitorId() }).then(function (d) {
                if (d.ok && typeof d.likes === 'number') { likes = d.likes; paintLikes(); }
            }).catch(function () {
                delete liked[slug];
                store('vp-liked', liked);
                likes = Math.max(0, likes - 1);
                paintLikes();
            });
        });

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var data = {
                action: 'comment',
                slug: slug,
                name: form.name.value.trim(),
                email: form.email.value.trim(),
                comment: form.comment.value.trim(),
                website: form.website.value,
                visitor: visitorId()
            };
            if (!data.name || !data.comment) { status.textContent = 'Please add your name and a comment.'; return; }
            var btn = form.querySelector('button[type="submit"]');
            btn.disabled = true;
            status.textContent = 'Posting…';
            post(data).then(function (d) {
                if (!d.ok) throw new Error(d.error || 'failed');
                if (d.comment) {
                    comments.push(d.comment);
                    paintComments();
                    var last = list.lastElementChild;
                    if (last) { last.classList.add('is-fresh'); last.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
                }
                form.comment.value = '';
                status.textContent = 'Thank you — your comment has been posted.';
            }).catch(function (err) {
                var msg = err && err.message && err.message !== 'failed' && err.message.indexOf('Failed to fetch') === -1
                    ? err.message : 'Your comment could not be posted. Please try again.';
                status.textContent = msg;
            }).then(function () { btn.disabled = false; });
        });
    }

    /* ---------------- blog listing: counts on each card ---------------- */
    var stats = document.querySelectorAll('[data-stats-slug]');
    if (stats.length) {
        get({ action: 'counts' }).then(function (d) {
            if (!d.ok) return;
            stats.forEach(function (el) {
                var c = d.counts[el.getAttribute('data-stats-slug')] || { likes: 0, comments: 0 };
                el.textContent = '♥ ' + c.likes + '  ·  ' + plural(c.comments, 'comment', 'comments');
                el.hidden = false;
            });
        }).catch(function () {});
    }
})();
