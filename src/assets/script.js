class SlidesPlayer {
  constructor() {
    this.slides = [];
    this.currentSlide = 0;
    this.numberInput = "";
    this.numberInputTimer = null;

    this.init();
  }

  init() {
    // Ждем загрузки DOM
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.findAndSetupSlides();
    this.setupKeyboardHandlers();
    this.setupHashNavigation();
  }

  findAndSetupSlides() {
    // Находим все слайды и присваиваем ID
    this.slides = Array.from(document.querySelectorAll(".slide"));

    this.slides.forEach((slide, index) => {
      slide.id = `slide-${index + 1}`;
    });

    // Определяем текущий слайд из hash или устанавливаем первый
    this.setCurrentSlideFromHash();
  }

  setupKeyboardHandlers() {
    document.addEventListener("keydown", (event) => {
      // Стрелки - мгновенная навигация
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        this.previousSlide();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        this.nextSlide();
      }

      // Цифры - ввод номера слайда с задержкой
      else if (event.key >= "0" && event.key <= "9") {
        event.preventDefault();
        this.handleNumberInput(event.key);
      }
    });
  }

  setupHashNavigation() {
    // Отслеживаем изменения hash (кнопки назад/вперед браузера)
    window.addEventListener("hashchange", () => {
      this.setCurrentSlideFromHash();
    });
  }

  setCurrentSlideFromHash() {
    const hash = window.location.hash;
    if (hash.startsWith("#slide-")) {
      const slideNumber = parseInt(hash.replace("#slide-", ""));
      if (slideNumber >= 1 && slideNumber <= this.slides.length) {
        this.currentSlide = slideNumber - 1;
        return;
      }
    }

    // Если hash некорректный, устанавливаем первый слайд
    this.currentSlide = 0;
    this.goToSlide(this.currentSlide);
  }

  nextSlide() {
    if (this.currentSlide < this.slides.length - 1) {
      this.currentSlide++;
      this.goToSlide(this.currentSlide);
    }
  }

  previousSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
      this.goToSlide(this.currentSlide);
    }
  }

  goToSlide(slideIndex) {
    if (slideIndex >= 0 && slideIndex < this.slides.length) {
      this.currentSlide = slideIndex;
      const slideId = `slide-${slideIndex + 1}`;

      // Мгновенный переход без плавной прокрутки
      window.location.hash = slideId;
    }
  }

  handleNumberInput(digit) {
    // Добавляем цифру к вводу
    this.numberInput += digit;

    // Сбрасываем предыдущий таймер
    if (this.numberInputTimer) {
      clearTimeout(this.numberInputTimer);
    }

    // Устанавливаем новый таймер на 1 секунду
    this.numberInputTimer = setTimeout(() => {
      this.processNumberInput();
    }, 1000);
  }

  processNumberInput() {
    const slideNumber = parseInt(this.numberInput);

    if (slideNumber >= 1 && slideNumber <= this.slides.length) {
      this.goToSlide(slideNumber - 1);
    }

    // Очищаем ввод
    this.numberInput = "";
    this.numberInputTimer = null;
  }
}

// Инициализируем проигрыватель
new SlidesPlayer();
