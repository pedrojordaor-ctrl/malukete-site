(function () {
  var WA_NUMBER = '5511981142763';

  function waLink(text) {
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text);
  }

  // Origem do visitante (ex.: ?utm_source=instagram&utm_medium=stories) vai junto nas mensagens
  var params = new URLSearchParams(location.search);
  var origem = [params.get('utm_source'), params.get('utm_medium'), params.get('utm_campaign')].filter(Boolean).join(' / ');

  // Links de WhatsApp com mensagem pronta
  document.querySelectorAll('[data-wa]').forEach(function (a) {
    a.href = waLink(a.getAttribute('data-wa') + (origem ? ' (vim pelo ' + origem + ')' : ''));
  });
  document.querySelectorAll('[data-wa-service]').forEach(function (a) {
    a.href = waLink('Olá! Vim pelo site e tenho interesse em: ' + a.getAttribute('data-wa-service') + '. Pode me passar um orçamento?');
  });

  // Conteúdo sazonal: esconde após a data em data-until (e mostra o que tiver data-after)
  var now = Date.now();
  document.querySelectorAll('[data-until]').forEach(function (el) {
    if (now > Date.parse(el.getAttribute('data-until'))) {
      el.classList.add('is-expired');
      if (el.id) {
        document.querySelectorAll('a[href="#' + el.id + '"]').forEach(function (l) { l.classList.add('is-expired'); });
      }
    }
  });
  document.querySelectorAll('[data-after]').forEach(function (el) {
    if (now > Date.parse(el.getAttribute('data-after'))) el.hidden = false;
  });

  // Contagem regressiva
  document.querySelectorAll('[data-countdown]').forEach(function (el) {
    var target = Date.parse(el.getAttribute('data-countdown'));
    function tick() {
      var diff = Math.max(0, target - Date.now());
      var d = Math.floor(diff / 864e5), h = Math.floor(diff / 36e5) % 24, m = Math.floor(diff / 6e4) % 60;
      el.querySelector('[data-d]').textContent = d;
      el.querySelector('[data-h]').textContent = String(h).padStart(2, '0');
      el.querySelector('[data-m]').textContent = String(m).padStart(2, '0');
    }
    tick();
    setInterval(tick, 30000);
  });

  // Menu mobile
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    var setMenu = function (open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      toggle.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
    };
    toggle.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  }

  // Sombra do header ao rolar
  var header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('is-scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  // Animações de entrada
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Formulários: salva o lead no Netlify Forms e abre o WhatsApp com a mensagem pronta
  var LABELS = {
    nome: 'Nome', telefone: 'WhatsApp', data: 'Data', tipo: 'Evento', cidade: 'Local',
    criancas: 'Crianças', idades: 'Idades', servicos: 'Atividades', mensagem: 'Detalhes', origem: 'Origem'
  };
  document.querySelectorAll('form[data-wa-form]').forEach(function (form) {
    var hid = form.querySelector('input[name="origem"]');
    if (hid && origem) hid.value = origem;
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var fd = new FormData(form);
      var lines = [form.getAttribute('data-wa-form'), ''];
      Object.keys(LABELS).forEach(function (k) {
        var v = fd.getAll(k).filter(Boolean);
        if (!v.length) return;
        if (k === 'data') v = [v[0].split('-').reverse().join('/')];
        lines.push('*' + LABELS[k] + ':* ' + v.join(', '));
      });

      // keepalive garante o envio mesmo com a navegação para o WhatsApp
      try {
        fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(fd).toString(),
          keepalive: true
        }).catch(function () {});
      } catch (e) {}

      if (window.gtag) window.gtag('event', 'generate_lead', { method: form.getAttribute('name') });
      window.location.href = waLink(lines.join('\n'));
    });
  });

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
