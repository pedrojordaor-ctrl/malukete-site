(function () {
  var WA_NUMBER = '5511981142763';

  function waLink(text) {
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text);
  }

  // Links de WhatsApp com mensagem pronta
  document.querySelectorAll('[data-wa]').forEach(function (a) {
    a.href = waLink(a.getAttribute('data-wa'));
  });
  document.querySelectorAll('[data-wa-service]').forEach(function (a) {
    a.href = waLink('Olá! Vim pelo site e tenho interesse em: ' + a.getAttribute('data-wa-service') + '. Pode me passar um orçamento?');
  });

  // Conteúdo sazonal: esconde após a data definida em data-until
  var now = Date.now();
  document.querySelectorAll('[data-until]').forEach(function (el) {
    if (now > Date.parse(el.getAttribute('data-until'))) {
      el.classList.add('is-expired');
      if (el.id) {
        document.querySelectorAll('a[href="#' + el.id + '"]').forEach(function (l) { l.classList.add('is-expired'); });
      }
    }
  });

  // Menu mobile
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav');
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    toggle.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
  }
  toggle.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
  nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });

  // Sombra do header ao rolar
  var header = document.querySelector('.header');
  window.addEventListener('scroll', function () {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  }, { passive: true });

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

  // Formulário: salva o lead no Netlify Forms e abre o WhatsApp com a mensagem pronta
  var form = document.getElementById('quote-form');
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var fd = new FormData(form);
    var servicos = fd.getAll('servicos');
    var dataEvento = fd.get('data');
    if (dataEvento) dataEvento = dataEvento.split('-').reverse().join('/');

    var lines = [
      'Olá, Malukete! Gostaria de um orçamento 🎉',
      '',
      '*Nome:* ' + fd.get('nome'),
      '*WhatsApp:* ' + fd.get('telefone'),
      dataEvento && ('*Data:* ' + dataEvento),
      '*Evento:* ' + fd.get('tipo'),
      fd.get('cidade') && ('*Local:* ' + fd.get('cidade')),
      fd.get('criancas') && ('*Crianças:* ' + fd.get('criancas')),
      fd.get('idades') && ('*Idades:* ' + fd.get('idades')),
      servicos.length && ('*Atividades:* ' + servicos.join(', ')),
      fd.get('mensagem') && ('*Detalhes:* ' + fd.get('mensagem'))
    ].filter(Boolean);

    // keepalive garante o envio mesmo com a navegação para o WhatsApp
    try {
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(fd).toString(),
        keepalive: true
      }).catch(function () {});
    } catch (e) {}

    if (window.gtag) window.gtag('event', 'generate_lead', { method: 'form_whatsapp' });
    window.location.href = waLink(lines.join('\n'));
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
