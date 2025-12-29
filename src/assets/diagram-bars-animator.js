class DiagramBarsAnimator {
  constructor() {
    this.items = [];
    this.valueSets = []; // 4 набора значений для позиций 0%, 33%, 66%, 100%
    this.animationFrameId = null;
    this.lastMouseX = null;
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
    // Находим все элементы diagram-list-item
    this.items = Array.from(
      document.querySelectorAll(".diagram-list-item")
    );

    // Если элементов нет, выходим
    if (this.items.length === 0) {
      return;
    }

    // Создаем 4 набора значений при инициализации
    this.generateValueSets();

    // Устанавливаем начальные значения (позиция курсора 0%)
    this.updateBarsFromCursor(0);

    // Добавляем обработчик движения мыши
    document.addEventListener("mousemove", (event) => {
      this.handleMouseMove(event);
    });

    // Обрабатываем случай, когда мышь покидает окно
    document.addEventListener("mouseleave", () => {
      this.handleMouseMove({ clientX: 0 });
    });
  }

  generateValueSets() {
    // Создаем 4 набора значений для позиций 0%, 33%, 66%, 100%
    this.valueSets = [];
    for (let setIndex = 0; setIndex < 4; setIndex++) {
      const valueSet = [];
      for (let i = 0; i < this.items.length; i++) {
        // Генерируем случайное значение от 0 до 100 для каждой полоски
        valueSet.push(Math.floor(Math.random() * 101));
      }
      this.valueSets.push(valueSet);
    }
  }

  handleMouseMove(event) {
    // Вычисляем позицию курсора в процентах от ширины окна
    const cursorPosition = Math.max(
      0,
      Math.min(100, (event.clientX / window.innerWidth) * 100)
    );

    // Сохраняем позицию для использования в requestAnimationFrame
    this.lastMouseX = cursorPosition;

    // Используем requestAnimationFrame для оптимизации
    if (this.animationFrameId === null) {
      this.animationFrameId = requestAnimationFrame(() => {
        this.updateBarsFromCursor(this.lastMouseX);
        this.animationFrameId = null;
      });
    }
  }

  updateBarsFromCursor(cursorPosition) {
    // Определяем, между какими двумя наборами находится текущая позиция курсора
    let startSet, endSet, t;

    if (cursorPosition <= 33) {
      // 0-33%: интерполируем между набором 0 и набором 1
      startSet = this.valueSets[0];
      endSet = this.valueSets[1];
      t = cursorPosition / 33; // коэффициент от 0 до 1
    } else if (cursorPosition <= 66) {
      // 33-66%: интерполируем между набором 1 и набором 2
      startSet = this.valueSets[1];
      endSet = this.valueSets[2];
      t = (cursorPosition - 33) / (66 - 33); // коэффициент от 0 до 1
    } else {
      // 66-100%: интерполируем между набором 2 и набором 3
      startSet = this.valueSets[2];
      endSet = this.valueSets[3];
      t = (cursorPosition - 66) / (100 - 66); // коэффициент от 0 до 1
    }

    // Ограничиваем t в диапазоне 0-1
    t = Math.max(0, Math.min(1, t));

    // Интерполируем значения для каждой полоски
    this.items.forEach((item, index) => {
      const startValue = startSet[index];
      const endValue = endSet[index];
      const interpolatedValue = Math.round(
        startValue + (endValue - startValue) * t
      );
      this.applyValue(item, interpolatedValue);
    });
  }

  applyValue(item, value) {
    // Устанавливаем ширину (значение в процентах)
    item.style.setProperty("--bar-width", `${value}%`);

    // Определяем цвет в зависимости от значения
    let color;
    if (value <= 20) {
      color = `rgba(var(--ids__text-RGB), 0.1)`;
    } else if (value <= 80) {
      color = `rgba(var(--ids__text-RGB), 0.15)`;
    } else {
      color = `rgba(var(--ids__accent-RGB), 0.2)`;
    }

    // Применяем цвет
    item.style.setProperty("--bar-color", color);

    // Добавляем/убираем зачёркивание для значений ≤20
    if (value <= 20) {
      item.classList.add("strikethrough");
    } else {
      item.classList.remove("strikethrough");
    }
  }

  destroy() {
    // Очищаем requestAnimationFrame при необходимости
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}

// Инициализируем аниматор
new DiagramBarsAnimator();
