/* The Living Archive — shared behaviour (loaded on every page, after app.js) */
(function () {
    var root = document.documentElement;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function bn(n) { return String(n).padStart(2, '0'); }
    window.axBengali = bn;
    root.classList.add('ax-js');

    /* ---------- notice strip: slower, and point it somewhere useful ---------- */
    var marq = document.querySelector('marquee.marq');
    if (marq) {
        marq.setAttribute('scrollamount', '4');
        var ml = marq.querySelector('a');
        if (ml && !ml.getAttribute('href')) ml.setAttribute('href', 'guideline.html');
    }

    /* ---------- navigation ---------- */
    var nav = document.querySelector('nav');
    var list = document.getElementById('nav-list');
    if (nav && !nav.querySelector('.ax-navtitle')) {
        var t = document.createElement('a');
        t.className = 'ax-navtitle';
        t.href = 'index.html';
        t.textContent = 'Voices from the Periphery';
        nav.insertBefore(t, nav.firstChild);
    }
    var here = location.pathname.split('/').pop() || 'index.html';
    if (list) {
        list.querySelectorAll('a[href]').forEach(function (a) {
            if (a.getAttribute('href') === here) {
                a.setAttribute('aria-current', 'page');
                var parent = a.closest('.dropdown');
                if (parent && parent.previousElementSibling) parent.previousElementSibling.setAttribute('aria-current', 'page');
            }
        });
        // mobile: tap a section title to open its sub-menu
        list.querySelectorAll(':scope > li > a[href="#"]').forEach(function (a) {
            a.addEventListener('click', function (e) {
                if (window.innerWidth > 1024) return;
                e.preventDefault();
                a.parentElement.classList.toggle('ax-open');
            });
        });
        var sync = function () { document.body.classList.toggle('ax-menu-open', list.classList.contains('active')); };
        new MutationObserver(sync).observe(list, { attributes: true, attributeFilter: ['class'] });
    }

    /* ---------- social seal ---------- */
    var floats = document.querySelectorAll('.whatsapp-float, .facebook-float, .instagram-float, .youtube-float');
    if (floats.length) {
        var seal = document.createElement('div');
        seal.className = 'ax-seal';
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ax-seal-btn';
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-label', 'Follow Voices from the Periphery');
        btn.textContent = 'V';
        var ul = document.createElement('div');
        ul.className = 'ax-seal-list';
        var seen = {};
        floats.forEach(function (a) {
            var key = a.className + a.getAttribute('href');
            if (seen[key]) { a.remove(); return; }
            seen[key] = 1;
            var label = (a.className.match(/(whatsapp|facebook|instagram|youtube)/) || [, 'link'])[1];
            a.setAttribute('aria-label', label.charAt(0).toUpperCase() + label.slice(1));
            a.setAttribute('rel', 'noopener');
            ul.appendChild(a);
        });
        seal.appendChild(btn);
        seal.appendChild(ul);
        document.body.appendChild(seal);
        btn.addEventListener('click', function () {
            var open = seal.classList.toggle('is-open');
            btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        document.addEventListener('click', function (e) {
            if (!seal.contains(e.target)) { seal.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); }
        });
    }

    /* ---------- reveal on scroll ---------- */
    var auto = [
        'main h1', 'main h2', '.platform-section', '.vp-card', '.vp-post-title', '.vp-recent-card',
        '.pp-card', '.pp-heading', '.pp-walks-heading', '.card', '.card-2', '.pdf-container', '.contact-info > h4'
    ];
    document.querySelectorAll(auto.join(',')).forEach(function (el) {
        if (el.hasAttribute('data-reveal') || el.closest('[data-reveal]') || el.closest('header, nav')) return;
        if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return; // already on screen: leave it be
        el.setAttribute('data-reveal', '');
    });
    // photographs that "develop" from sepia
    document.querySelectorAll('.vp-card-img img, .vp-post-hero img, .vp-recent-card img, .pp-card-media img, .gallery img, .ax-dev-auto')
        .forEach(function (img) { img.classList.add('ax-dev'); });

    var targets = Array.prototype.slice.call(document.querySelectorAll('[data-reveal], .ax-dev'));
    if (reduce || !('IntersectionObserver' in window)) {
        targets.forEach(function (el) { el.classList.add('is-in'); });
    } else {
        var pending = targets.slice();
        var reveal = function (el) {
            el.classList.add('is-in');
            io.unobserve(el);
            var k = pending.indexOf(el);
            if (k > -1) pending.splice(k, 1);
        };
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) { if (en.isIntersecting) reveal(en.target); });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
        targets.forEach(function (el) { io.observe(el); });
        // belt and braces: anchor jumps, fast flings, restored scroll positions
        var checking = false;
        var check = function () {
            checking = false;
            var h = window.innerHeight;
            pending.slice().forEach(function (el) {
                var r = el.getBoundingClientRect();
                if (r.top < h * 0.94 && r.bottom > 0) reveal(el);
            });
        };
        var queue = function () { if (!checking && pending.length) { checking = true; requestAnimationFrame(check); } };
        window.addEventListener('scroll', queue, { passive: true });
        window.addEventListener('resize', queue);
        window.addEventListener('hashchange', queue);
        window.addEventListener('scrollend', queue);
        window.addEventListener('load', function () { check(); setTimeout(check, 700); });
        setTimeout(check, 400);
        setTimeout(check, 1500);
    }

    /* ---------- reading line on long articles ---------- */
    var article = document.querySelector('.vp-post');
    if (article) {
        var bar = document.createElement('div');
        bar.className = 'ax-progress';
        document.body.appendChild(bar);
        var tick = false;
        var update = function () {
            var r = article.getBoundingClientRect();
            var total = r.height - window.innerHeight;
            var p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1;
            bar.style.transform = 'scaleX(' + p + ')';
            tick = false;
        };
        window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(update); } }, { passive: true });
        update();
    }

    /* ---------- slow parallax for [data-parallax] images ---------- */
    var para = document.querySelectorAll('[data-parallax]');
    if (para.length && !reduce) {
        var pt = false;
        var move = function () {
            para.forEach(function (el) {
                var box = el.parentElement.getBoundingClientRect();
                if (box.bottom < 0 || box.top > window.innerHeight) return;
                var shift = (box.top + box.height / 2 - window.innerHeight / 2) * -0.12;
                el.style.transform = 'translate3d(0,' + shift.toFixed(1) + 'px,0) scale(1.08)';
            });
            pt = false;
        };
        window.addEventListener('scroll', function () { if (!pt) { pt = true; requestAnimationFrame(move); } }, { passive: true });
        move();
    }

    /* ---------- simple crossfade carousels: [data-ax-carousel] ---------- */
    document.querySelectorAll('[data-ax-carousel]').forEach(function (box) {
        var slides = Array.prototype.slice.call(box.querySelectorAll('[data-ax-slide]'));
        if (!slides.length) return;
        var dotsWrap = box.querySelector('[data-ax-dots]');
        var count = box.querySelector('[data-ax-count]');
        var interval = parseInt(box.getAttribute('data-ax-carousel'), 10) || 7000;
        var i = 0, timer = null, paused = false;
        var dots = [];
        if (dotsWrap) {
            slides.forEach(function (_, n) {
                var d = document.createElement('button');
                d.type = 'button';
                d.setAttribute('aria-label', 'Show item ' + (n + 1));
                d.addEventListener('click', function () { show(n); restart(); });
                dotsWrap.appendChild(d);
                dots.push(d);
            });
        }
        function show(n) {
            i = (n + slides.length) % slides.length;
            slides.forEach(function (s, k) {
                s.classList.toggle('is-active', k === i);
                s.setAttribute('aria-hidden', k === i ? 'false' : 'true');
            });
            dots.forEach(function (d, k) { d.classList.toggle('is-active', k === i); });
            if (count) count.textContent = bn(i + 1) + ' / ' + bn(slides.length);
        }
        function restart() {
            if (timer) clearInterval(timer);
            if (reduce) return;
            timer = setInterval(function () { if (!paused && !document.hidden) show(i + 1); }, interval);
        }
        var prev = box.querySelector('[data-ax-prev]'), next = box.querySelector('[data-ax-next]');
        if (prev) prev.addEventListener('click', function () { show(i - 1); restart(); });
        if (next) next.addEventListener('click', function () { show(i + 1); restart(); });
        box.addEventListener('mouseenter', function () { paused = true; });
        box.addEventListener('mouseleave', function () { paused = false; });
        box.addEventListener('focusin', function () { paused = true; });
        box.addEventListener('focusout', function () { paused = false; });
        box.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowRight') { show(i + 1); restart(); }
            if (e.key === 'ArrowLeft') { show(i - 1); restart(); }
        });
        var sx = null;
        box.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; paused = true; }, { passive: true });
        box.addEventListener('touchend', function (e) {
            if (sx !== null) {
                var dx = e.changedTouches[0].clientX - sx;
                if (Math.abs(dx) > 40) { show(dx < 0 ? i + 1 : i - 1); restart(); }
            }
            sx = null; paused = false;
        });
        show(0);
        restart();
    });
})();
