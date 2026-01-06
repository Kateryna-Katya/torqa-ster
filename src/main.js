document.addEventListener('DOMContentLoaded', () => {

  // --- 1. ИНИЦИАЛИЗАЦИЯ ---
  // Проверяем, подключена ли библиотека Lucide
  if (typeof lucide !== 'undefined') {
      lucide.createIcons();
  }

  gsap.registerPlugin(ScrollTrigger);

  // Плавный скролл
  const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
  });
  function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // --- 2. HERO АНИМАЦИЯ (Только если есть Canvas) ---
  const canvas = document.getElementById('heroCanvas');

  // 🔥 ВАЖНОЕ ИСПРАВЛЕНИЕ: Проверка существования канваса
  if (canvas) {
      const ctx = canvas.getContext('2d');
      let width, height;
      let particles = [];

      const config = {
          particleColor: 'rgba(204, 255, 0, 0.5)',
          lineColor: 'rgba(204, 255, 0, 0.15)',
          particleAmount: 60,
          defaultSpeed: 0.5,
          linkRadius: 150
      };

      function resize() {
          width = canvas.width = window.innerWidth;
          height = canvas.height = window.innerHeight;
      }

      class Particle {
          constructor() {
              this.x = Math.random() * width;
              this.y = Math.random() * height;
              this.vx = (Math.random() - 0.5) * config.defaultSpeed;
              this.vy = (Math.random() - 0.5) * config.defaultSpeed;
              this.size = Math.random() * 2 + 1;
          }

          update() {
              this.x += this.vx;
              this.y += this.vy;

              if (this.x > width) this.vx *= -1;
              if (this.x < 0) this.vx *= -1;
              if (this.y > height) this.vy *= -1;
              if (this.y < 0) this.vy *= -1;
          }

          draw() {
              ctx.beginPath();
              ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
              ctx.fillStyle = config.particleColor;
              ctx.fill();
          }
      }

      function initParticles() {
          particles = [];
          const amount = window.innerWidth < 768 ? 30 : config.particleAmount;
          for (let i = 0; i < amount; i++) {
              particles.push(new Particle());
          }
      }

      function animateParticles() {
          ctx.clearRect(0, 0, width, height);

          for (let i = 0; i < particles.length; i++) {
              let p1 = particles[i];
              p1.update();
              p1.draw();

              for (let j = i + 1; j < particles.length; j++) {
                  let p2 = particles[j];
                  let distance = Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2);

                  if (distance < config.linkRadius) {
                      ctx.beginPath();
                      ctx.strokeStyle = config.lineColor;
                      ctx.lineWidth = 1;
                      ctx.moveTo(p1.x, p1.y);
                      ctx.lineTo(p2.x, p2.y);
                      ctx.stroke();
                  }
              }
          }
          requestAnimationFrame(animateParticles);
      }

      window.addEventListener('resize', () => { resize(); initParticles(); });
      resize();
      initParticles();
      animateParticles();

      // Hero контент (появляется только на главной)
      gsap.from('.hero__content > *', {
          y: 30,
          opacity: 0,
          duration: 1,
          stagger: 0.2,
          delay: 0.2,
          ease: 'power3.out'
      });
  }

  // --- 3. АНИМАЦИЯ СЕКЦИЙ (GSAP) ---
  const fadeElements = document.querySelectorAll('.section-title, .section-subtitle, .about__text, .innovations__content');
  if (fadeElements.length > 0) {
      fadeElements.forEach(el => {
          gsap.fromTo(el,
              { y: 50, opacity: 0 },
              {
                  y: 0,
                  opacity: 1,
                  duration: 0.8,
                  ease: 'power2.out',
                  scrollTrigger: {
                      trigger: el,
                      start: 'top 90%',
                      toggleActions: 'play none none none'
                  }
              }
          );
      });
  }

  const grids = ['.programs__grid', '.mentors__grid', '.blog__grid', '.numbers__grid', '.steps'];
  grids.forEach(selector => {
      const grid = document.querySelector(selector);
      if (grid) {
          gsap.fromTo(grid.children,
              { y: 40, opacity: 0 },
              {
                  y: 0,
                  opacity: 1,
                  duration: 0.6,
                  stagger: 0.15,
                  ease: 'back.out(1.2)',
                  scrollTrigger: {
                      trigger: grid,
                      start: 'top 85%',
                      toggleActions: 'play none none none'
                  }
              }
          );
      }
  });

  // --- 4. МОБИЛЬНОЕ МЕНЮ (Работает везде) ---
  const burger = document.querySelector('.header__burger');
  const nav = document.querySelector('.header__nav');
  const navLinks = document.querySelectorAll('.header__link');
  const body = document.body;

  if (burger && nav) {
      burger.addEventListener('click', () => {
          burger.classList.toggle('is-active');
          nav.classList.toggle('is-active');
          body.classList.toggle('no-scroll');
      });

      navLinks.forEach(link => {
          link.addEventListener('click', () => {
              burger.classList.remove('is-active');
              nav.classList.remove('is-active');
              body.classList.remove('no-scroll');
          });
      });
  }

  // --- 5. ХЕДЕР ПРИ СКРОЛЛЕ ---
  let lastScroll = 0;
  const header = document.querySelector('.header');

  window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY;
      if (currentScroll > lastScroll && currentScroll > 100) {
          header.style.transform = 'translateY(-100%)';
      } else {
          header.style.transform = 'translateY(0)';
      }
      lastScroll = currentScroll;
  });

  // --- 6. АККОРДЕОН И ФОРМА ---
  // FAQ
  document.querySelectorAll('.accordion__trigger').forEach(btn => {
      btn.addEventListener('click', () => {
          const item = btn.parentElement;
          document.querySelectorAll('.accordion__item').forEach(i => {
              if (i !== item) i.classList.remove('is-open');
          });
          item.classList.toggle('is-open');
      });
  });

  // Форма (Только если есть на странице)
  const form = document.getElementById('contactForm');
  if (form) {
      form.addEventListener('submit', (e) => {
          e.preventDefault();
          const msgBox = document.querySelector('.form__message');
          const captcha = document.getElementById('captcha').value;

          if (parseInt(captcha) !== 8) {
              msgBox.textContent = 'Ошибка вычисления!';
              msgBox.style.color = 'red';
              return;
          }

          const btn = form.querySelector('button');
          const oldText = btn.textContent;
          btn.textContent = 'Отправка...';
          btn.disabled = true;

          setTimeout(() => {
              btn.textContent = oldText;
              btn.disabled = false;
              msgBox.textContent = 'Заявка отправлена!';
              msgBox.style.color = '#ccff00';
              form.reset();
          }, 1500);
      });
  }

  // Cookie
  const cookiePopup = document.getElementById('cookiePopup');
  if (cookiePopup && !localStorage.getItem('cookiesAccepted')) {
      setTimeout(() => cookiePopup.classList.add('is-visible'), 2000);
      document.getElementById('acceptCookie').addEventListener('click', () => {
          localStorage.setItem('cookiesAccepted', 'true');
          cookiePopup.classList.remove('is-visible');
      });
  }
});