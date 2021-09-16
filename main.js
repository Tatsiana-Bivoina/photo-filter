const filtersContainer = document.querySelector('.filters');
const inputColor = document.querySelector('.input-color-container');
const btnContainer = document.querySelector('.btn-container');
const image = document.querySelector('.editor-img');
const presetsImages = document.querySelectorAll('.presets-img');
const fullscreen = document.querySelector('.fullscreen');
const presetsBlock = document.querySelector('.presets');
const fileInput = document.querySelector('input[type="file"]');
const canvas = document.querySelector('canvas');
let timesOfDay = '';
let i = 1;

window.onload = () => {
  nextImage();
};

// EventLestener to inputs
inputColor.addEventListener('input', (event) => {
  document.documentElement.style.setProperty(
    `--${event.target.name}`,
    event.target.value
  );
});

filtersContainer.addEventListener('input', (event) => {
  const suffix = event.target.dataset.sizing || '';
  image.style.setProperty(
    `--${event.target.name}`,
    event.target.value + suffix
  );
  event.target.setAttribute('value', event.target.value);
  event.path[0].nextElementSibling.value = event.target.value;
});

// EventLestener to buttons
btnContainer.addEventListener('click', (event) => {
  if (event.target.classList[1] == 'btn-reset') {
    addClassActive(event);
    reset();
  }
  if (event.target.classList[1] == 'btn-next') {
    addClassActive(event);
    nextImage();
  }
  if (event.target.classList[1] == 'btn-load') {
    console.log('hello');
    loadNewImage();
  }
  if (event.target.classList[1] == 'btn-save') {
    addClassActive(event);
    saveImage();
  }
});

const addClassActive = (event) => {
  const active = document.querySelector('.btn-active');
  if (!event.target.classList.contains('btn-active')) {
    active.classList.remove('btn-active');
    event.target.classList.add('btn-active');
  }
};

// Button Reset
const reset = () => {
  const inputsList = document.querySelectorAll('.filters input');
  image.style = '';
  inputsList.forEach((elem, index) => {
    if (
      elem.name != 'saturate' &&
      elem.name != 'spacing' &&
      elem.name != 'contrast' &&
      elem.name != 'brightness'
    ) {
      elem.value = 0;
      elem.nextElementSibling.value = 0;
    } else {
      elem.value = 100;
      elem.nextElementSibling.value = 100;
    }
  });
};

// Button Next
const nextImage = () => {
  const baseUrl =
    'https://raw.githubusercontent.com/rolling-scopes-school/stage1-tasks/assets/images/';
  let time = new Date();
  let hours = time.getHours();
  let minutes = time.getMinutes();
  let imageSrc = '';

  if (hours >= 6 && hours <= 11 && minutes <= 59) timesOfDay = 'morning/';
  if (hours >= 12 && hours <= 17 && minutes <= 59) timesOfDay = 'day/';
  if (hours >= 18 && hours <= 23 && minutes <= 59) timesOfDay = 'evening/';
  if (hours >= 0 && hours <= 5 && minutes <= 59) timesOfDay = 'night/';
  if(i < 10) {
    imageSrc = baseUrl + timesOfDay + '0' + i + '.jpg';
  }
  if(i >= 10 && i <= 20) {
    imageSrc = baseUrl + timesOfDay + i + '.jpg';
  }
  viewBgImage(imageSrc);
  i++;
  if (i > 20) i = 1;
};

function viewBgImage(imageSrc) {
  const img = new Image();
  img.src = imageSrc;
  img.onload = () => {
    image.setAttribute('crossOrigin', 'anonymous');
    image.setAttribute('src', img.src);
    presetsImages.forEach((el) => {
      el.setAttribute('src', img.src);
    })
  };
};

// Button load
fileInput.addEventListener('change', loadNewImage);

function loadNewImage() {
  file = fileInput.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    let img = new Image();
    img.src = reader.result;
    image.setAttribute('src', img.src);
    presetsImages.forEach((el) => {
      el.setAttribute('src', img.src);
    })
  }
  reader.readAsDataURL(file);
  fileInput.value = '';
}

// Button save
const saveImage = () => {
  const ctx = canvas.getContext("2d");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  let blur = getComputedStyle(image).getPropertyValue("--blur");
  let invert = getComputedStyle(image).getPropertyValue("--invert");
  let sepia = getComputedStyle(image).getPropertyValue("--sepia");
  let saturate = getComputedStyle(image).getPropertyValue("--saturate");
  let contrast = getComputedStyle(image).getPropertyValue("--contrast");
  let hueRotate = getComputedStyle(image).getPropertyValue("--hue-rotate");
  let grayscale = getComputedStyle(image).getPropertyValue("--grayscale");
  let brightness = getComputedStyle(image).getPropertyValue("--brightness");
  let sizeDifference = image.naturalHeight / image.height;
  ctx.filter = `blur(${(parseFloat(blur) * sizeDifference)}px) invert(${invert}) sepia(${sepia}) saturate(${saturate}) contrast(${contrast}) hue-rotate(${hueRotate}) grayscale(${grayscale}) brightness(${brightness})`;
  ctx.drawImage(image, 0, 0);
  const link = document.createElement("a");
  link.download = "image.png";
  link.href = canvas.toDataURL();
  link.click();
  link.delete;
}

// Presets filters
presetsBlock.addEventListener('click', (event) => {
  addPresetsFilters(event);
})

const addPresetsFilters = (event) => {
  reset();
  let stylePresets = event.target.getAttribute('style');
  let filters = {};
  if (stylePresets != null) {
    let presetsFilters = stylePresets.split(' ').slice(1);
    presetsFilters.forEach((el) => {
      filters[el.match(/^[a-zA-Z\-]+/)] = el.match(/\d+[^\)]+/)?.pop();
    })
    for (const key in filters) {
      const suffix = event.target.dataset.sizing || '';
      image.style.setProperty(`--${key}`, filters[key]);
      const range = document.querySelector(`input[name=${key}]`);
      range.value = filters[key].match(/\d+/);
      range.nextElementSibling.value = range.value;
    }
  }
}

// Presets slider
let startX;
let scrollLeft;

function sliderActive(event) {
  event.preventDefault();
  startX = event.pageX - presetsBlock.offsetLeft;
  scrollLeft = presetsBlock.scrollLeft;
  presetsBlock.classList.add("active");
  presetsBlock.addEventListener("mousemove", sliderDrag);
}

function sliderOff() {
  presetsBlock.classList.remove("active");
  presetsBlock.removeEventListener("mousemove", sliderDrag);
}

function sliderDrag(event) {
  const x = event.pageX - presetsBlock.offsetLeft;
  const walk = x - startX;
  presetsBlock.scrollLeft = scrollLeft - walk;
}

presetsBlock.addEventListener("mouseup", sliderOff);
presetsBlock.addEventListener("mouseleave", sliderOff);
presetsBlock.addEventListener("dragstart", sliderActive);

// FullScreen
const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
};

fullscreen.addEventListener('click', toggleFullScreen);

console.log(
  ' 1. Повторить исходный проект +10  2. Обязательный дополнительный фукционал +10: в приложение добавила дополнительные фильтры и пресеты. При выборе миниатюры пресета такие же фильтры применяются к основному фото. 3. Дополнительный функционал на выбор +10: перелистывание фото, загрузка в приложение фото с компьютера, сохранение фото на компьютер вместе с наложенными фильтрами, сброс фильтров кликом на кнопку.')
  