'use strict';

const searchInp = document.querySelector('.search-input');
const searchForm = document.querySelector('#search-form');
const userList = document.querySelector('#user-list');
const userModal = document.querySelector('#userModal');
const avatar = document.querySelector('.modal-avatar');
const btnAddFav = document.querySelector('.btn-add-favorite');
const pagination = document.querySelector('.pagination');
const USER_PER_PAGE = 42;
let users = [];
let usersResult = [];

// Function : create card
const createCard = function (user) {
  return `<div class="card m-2" data-toggle="modal" data-target="#userModal">
          <img
            class="card-img-top"
            src="${user.avatar}"
            alt="Card image cap"
          />
          <div class="card-body">
            <a href="#" >
              <p class="card-text text-center stretched-link" data-id="${user.id}">${user.name}</p>
            </a>
          </div>
        </div>`;
};

// Function : Rewrite modal
const showModalInfo = function (user) {
  const fullName = document.querySelector('.modal-full-name');
  const gender = document.querySelector('.modal-gender');
  const birthday = document.querySelector('.modal-birthday');
  const age = document.querySelector('.modal-age');
  const region = document.querySelector('.modal-region');
  const email = document.querySelector('.modal-email');
  const update = document.querySelector('.modal-update');

  fullName.innerHTML = user.name + ' ' + user.surname;
  avatar.src = user.avatar;
  gender.innerHTML = user.gender.charAt(0).toUpperCase() + user.gender.slice(1);
  birthday.innerHTML = user.birthday;
  age.innerHTML = user.age;
  region.innerHTML = user.region;
  email.innerHTML = user.email;
  update.innerHTML = user.updated_at.slice(0, 10);
  btnAddFav.dataset.modalId = user.id;
};

// Function : render paginator
const renderPaginator = function (userArr) {
  const totalPages = Math.ceil(userArr.length / USER_PER_PAGE);

  let pageBtnHtml = '';
  for (let i = 1; i <= totalPages; i++) {
    pageBtnHtml += `<li class="page-item"><a class="page-link" data-page="${i}" href="#">${i}</a></li>`;
  }
  pagination.innerHTML = pageBtnHtml;
};

// Function : Render users by page
const renderUsersByPage = function (page) {
  const data = usersResult.length ? usersResult : users;
  let listHtml = '';
  const start = (page - 1) * USER_PER_PAGE;
  data.slice(start, start + USER_PER_PAGE).forEach(user => {
    listHtml += createCard(user);
  });
  userList.innerHTML = listHtml;
};

// Render first page user list
axios
  .get('https://lighthouse-user-api.herokuapp.com/api/v1/users')
  .then(res => {
    users = res.data.results;
    renderUsersByPage(1);
    renderPaginator(users);
  })
  .catch(err => console.log(err));

// Show modal
userList.addEventListener('click', event => {
  const eTarget = event.target;

  if (eTarget.matches('.card-text')) {
    axios
      .get(
        `https://lighthouse-user-api.herokuapp.com/api/v1/users/${eTarget.dataset.id}`
      )
      .then(res => {
        showModalInfo(res.data);
      })
      .catch(err => console.log(err));
  }
});

// Modal close
$('#userModal').on('hidden.bs.modal', function () {
  avatar.src = '';
});

// Add to favorite
btnAddFav.addEventListener('click', event => {
  const eTarget = event.target;
  const userId = eTarget.dataset.modalId;

  // Get session storeage
  const favUsersArr = JSON.parse(sessionStorage.getItem('favUsersArr')) || [];

  if (favUsersArr.some(user => user.includes(userId))) {
    alert('This user has been added.');
  } else {
    const favUserElement = document
      .querySelector(`[data-id='${userId}']`)
      .closest('.card')
      .cloneNode(true);

    favUsersArr.push(favUserElement.outerHTML);

    sessionStorage.setItem('favUsersArr', JSON.stringify(favUsersArr));

    alert('Add successfully.');
  }
});

// Search
searchForm.addEventListener('submit', event => {
  event.preventDefault();
  usersResult = [];
  let inputValue = searchInp.value;
  const fixedValue = inputValue.trim().toLowerCase();

  axios
    .get('https://lighthouse-user-api.herokuapp.com/api/v1/users')
    .then(res => {
      const users = res.data.results;

      if (!fixedValue) {
        alert("Input can't be empity.");
        inputValue = '';
        return;
      } else {
        users.forEach(user => {
          if (user.name.toLowerCase().includes(fixedValue)) {
            usersResult.push(user);
          }
        });
      }

      if (usersResult.length === 0) {
        userList.innerHTML = `<h4 class='text-white'>No result.</h4>`;
      } else {
        renderUsersByPage(1);
      }
      renderPaginator(usersResult);
    })
    .catch(err => console.log(err));
});

// Paginator
pagination.addEventListener('click', function (event) {
  const eTarget = event.target;
  if (eTarget.tagName === 'A') renderUsersByPage(+eTarget.dataset.page);
});
