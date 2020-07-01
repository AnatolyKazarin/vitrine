import './main.scss'
import $ from 'jquery'
import './js/jquery.typeahead.js'
import {jsonData} from './data.js'

// Функция отрисовки товаров по входному массиву

function createShop(items) {
  $('.shop__item-list').empty();
  for(var i=0; i<items.length; i++) {
    var item = `
    <li class="item">
      <img class="item__image" src="https://www.imumk.ru/svc/coursecover/${items[i].courseId}">
      <div class="item__info-wrapper">
        <p class="item__title">${items[i].subject}</p>
        <p class="item__grade">${items[i].gradeEdited} класс</p>
        <p class="item__genre">${items[i].genre}</p>
        <a class="item__link" href="${items[i].shopUrl}">Подробнее</a><br>
        <a class="item__button" href="#" data-price=${items[i].price} data-bonus=${items[i].priceBonus}>Попробовать</a>
      </div>
    </li>`;
    $('.shop__item-list').append(item);
  }
  displayPrice();
}

// Функция наполнения селектов

function cleanArray(arr) {
  arr = arr.sort();
  arr = arr.filter((item, i) => {
    return item !== arr[i+1];
  })
  return arr;
}

function fillSelects(items) {
  let subjects = [];
  let genres = [];
  
  items.forEach((item, i) => {
    subjects[i] = item.subject;
  });
  items.forEach((item, i) => {
    genres[i] = item.genre;
  });
  
  cleanArray(subjects).forEach((item, i) => {
    $('.select-subjects').append(`<option>${item}</option>`)
  });
  cleanArray(genres).forEach((item, i) => {
    $('.select-genre').append(`<option>${item}</option>`)
  });
  for (let i = 0; i < 11; i++) {
    $('.select-class').append(`<option>${i+1}</option>`)
  }  
}

// Фильтрация по предмету

function filterBySubject(subject, data) {
  var dataFiltered = [];
  
  if(subject != "Все предметы") {
    for(var i=0; i<data.length; i++) {
      if (data[i].subject === subject) {
        dataFiltered.push(data[i]);
      }
    }
  } else { dataFiltered = data; }
  
  return dataFiltered;
}

// Фильтрация по жанру

function filterByGenre(genre, data) {
  var dataFiltered = [];
  
  if(genre != "Все жанры") {
    for(var i=0; i<data.length; i++) {
      if (data[i].genre === genre) {
        dataFiltered.push(data[i]);
      }
    }
  } else { dataFiltered = data; }
  
  return dataFiltered;
}

// Фильтрация по классам

function filterByClass(grade, data) {
  var dataFiltered = [];
  
  if(grade != "Все классы") {
    for(var i=0; i<data.length; i++) {
      var grades = data[i].grade.split(';');
      for(var j=0; j<grades.length; j++) {
        if (grades[j] === grade) {
          dataFiltered.push(data[i]);
        }
      }
    }
  } else { dataFiltered = data; }
  
  return dataFiltered;
}

// Функция редактирует поля с диапазоном классов в карточке курса

function editGradeField (data) {
  for(let i=0; i<data.length; i++) {
    let grades = data[i].grade.split(';');
    if (grades.length == 1) {
      data[i].gradeEdited = data[i].grade;
    } else {
      data[i].gradeEdited = `${grades[0]} - ${grades[grades.length-1]}`;
    }
  }
  return data;
}

// Проверка по всем фильтрам и возврат отфильтрованного массива данных

function filterByAll (data) {
  var filteredData = filterBySubject($(".select-subjects option:selected").text(), data);
  filteredData = filterByGenre($(".select-genre option:selected").text(), filteredData);
  filteredData = filterByClass($(".select-class option:selected").text(), filteredData);
  return filteredData;
}

// Функция сброса фильтров

function restoreFilters() {
  $('.select-subjects option:first').prop('selected', true);
  $('.select-genre option:first').prop('selected', true);
  $('.select-class option:first').prop('selected', true);
}

// Функция отрисовки цены в рублях или в бонусах

function displayPrice() {
  $('.item__button').mouseover(function(){
    if($('.onoff').hasClass('onoff-on')) {
      $(this).text($(this).attr('data-price')+' руб.');
    } else {
      $(this).text($(this).attr('data-bonus')+' бон.');
    }
  });
  
  $('.item__button').mouseout(function(){
    $(this).text('Попробовать');
  });
}


$(document).ready( function () {
  
  const items = jsonData.items;
        
  // Создание страницы магазина при первом отображении
  
  createShop(editGradeField(items));
  
  fillSelects(items);
    
  // Обработка выбора фильтра и перерисовка магазина
    
  $('select').on('change', function (){
    createShop(filterByAll(items));
  })
    
  // Конфигурация плагина поиска
    
  $('.js-typeahead').typeahead({
    display: ["title", "genre", "description"],
    source: items,
    callback: {
      onResult: function (node, query, result, resultCount, resultCountPerGroup) {
        restoreFilters();
        if(query != '') {
          createShop(result);              
        } else {
          createShop(data.items);
        }
      },
    }
  });
    
  // Обработка кнопки отображения цены в рублях или бонусах

  $(document).on('click', '.onoff', function(){
    $(this).toggleClass('onoff-on');
    $(this).toggleClass('onoff-off');
  });        
});

 