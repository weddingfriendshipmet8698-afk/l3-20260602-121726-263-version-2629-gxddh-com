document.addEventListener('DOMContentLoaded', function () {
  var menuButton = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.main-nav');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var slides = Array.from(document.querySelectorAll('.hero-slide'));
  var dots = Array.from(document.querySelectorAll('.slide-dots button'));
  var active = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    active = (index + slides.length) % slides.length;

    slides.forEach(function (slide, currentIndex) {
      slide.classList.toggle('active', currentIndex === active);
    });

    dots.forEach(function (dot, currentIndex) {
      dot.classList.toggle('active', currentIndex === active);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  showSlide(0);

  var filterInput = document.querySelector('[data-filter-input]');
  var yearSelect = document.querySelector('[data-year-select]');
  var regionSelect = document.querySelector('[data-region-select]');
  var cards = Array.from(document.querySelectorAll('.movie-card[data-title]'));
  var countLabel = document.querySelector('[data-result-count]');
  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';

  if (filterInput && query) {
    filterInput.value = query;
  }

  function matchText(card, value) {
    if (!value) {
      return true;
    }

    var pool = [
      card.dataset.title || '',
      card.dataset.region || '',
      card.dataset.year || '',
      card.dataset.genre || ''
    ].join(' ');

    return pool.toLowerCase().indexOf(value.toLowerCase()) !== -1;
  }

  function filterCards() {
    if (!cards.length) {
      return;
    }

    var textValue = filterInput ? filterInput.value.trim() : '';
    var yearValue = yearSelect ? yearSelect.value : '';
    var regionValue = regionSelect ? regionSelect.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var ok = matchText(card, textValue);

      if (ok && yearValue) {
        ok = (card.dataset.year || '') === yearValue;
      }

      if (ok && regionValue) {
        ok = (card.dataset.region || '') === regionValue;
      }

      card.classList.toggle('hidden-card', !ok);

      if (ok) {
        visible += 1;
      }
    });

    if (countLabel) {
      countLabel.textContent = visible.toString();
    }
  }

  [filterInput, yearSelect, regionSelect].forEach(function (item) {
    if (item) {
      item.addEventListener('input', filterCards);
      item.addEventListener('change', filterCards);
    }
  });

  filterCards();
});
