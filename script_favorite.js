'use strict';

const favoriteList = document.querySelector('#favorite-list');
const avatar = document.querySelector('.modal-avatar');
const btnDelFav = document.querySelector('.btn-delete-favorite');
const pagination = document.querySelector('.pagination');
const USER_PER_PAGE = 42;

let favUsersHtml = '';

// Get session storeage
const favUsersArr = JSON.parse(sessionStorage.getItem('favUsersArr')) || [];

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
  const start = (page - 1) * USER_PER_PAGE;
  favoriteList.innerHTML = favUsersArr
    .slice(start, start + USER_PER_PAGE)
    .reduce((accumulate, userStr) => (accumulate += userStr));
};

// Render favorite list
renderUsersByPage(1);
renderPaginator(favUsersArr);

// Function : Show modal
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
  btnDelFav.dataset.modalId = user.id;
};

// Show modal
favoriteList.addEventListener('click', event => {
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

// Delete user from favorite
btnDelFav.addEventListener('click', event => {
  const eTarget = event.target;
  const userId = eTarget.dataset.modalId;

  if (!favUsersArr) return;

  const newFavUsersArr = favUsersArr.filter(
    user => !user.includes(`${userId}`)
  );

  sessionStorage.setItem('favUsersArr', JSON.stringify(newFavUsersArr));

  document.querySelector(`[data-id='${userId}']`).closest('.card').remove();

  btnDelFav.classList.add('hidden');
  alert('This user is deleted.');
});

// Paginator
pagination.addEventListener('click', function (event) {
  const eTarget = event.target;
  if (eTarget.tagName === 'A') renderUsersByPage(+eTarget.dataset.page);
});
