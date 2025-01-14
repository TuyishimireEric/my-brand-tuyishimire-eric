import { regExPatterns, formatedDate } from '../utils.js';
import checkInput from '../formValidation.js';
import {
  getABlog,
  getBlogLikes,
  getBlogComments,
  addBlogComment,
  likeABlog,
  validateToken,
} from '../api/index.js';

const humberger = document.getElementById('humberger');
const extraMenu = document.querySelector('.extra-menu');
const navigation = document.querySelector('.navigation');
const loader = document.querySelector('.loader');
const userContainer = document.querySelector('#currentUser');
const userIcon = document.querySelector('#user');
const changeMode = document.querySelector('#changeMode');

userIcon.addEventListener('click', (e) => {
  e.preventDefault();
  const user = JSON.parse(localStorage.getItem('user')) || '';
  if (user) {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '../index.html';
  } else {
    window.location.href = './login.html';
  }
});

let blogId = '';
humberger.addEventListener('click', () => {
  extraMenu.classList.toggle('active');
  navigation.classList.toggle('active');
});

extraMenu.addEventListener('click', () => {
  extraMenu.classList.remove('active');
  navigation.classList.remove('active');
});

const addRatings = document.querySelector('.addRatings');

const blogContainer = document.getElementById('Blogs');

let ratingsHTML = '';

const generateStars = (rating) => {
  ratingsHTML = '';
  const fullStars = Math.floor(rating);

  for (let i = 0; i < 5; i += 1) {
    if (i < fullStars) {
      ratingsHTML += '<img src="../images/fullStar.svg" alt="star" class="star">';
    } else {
      ratingsHTML += '<img src="../images/emptyStar.svg" alt="star" class="star">';
    }
  }
};

const showBlog = (blog) => {
  blog.description = JSON.parse(blog.description) || blog.description;
  blogContainer.innerHTML = `
    <div class="blogDetails" data-aos="zoom-out">
        <img src="${blog.image}" alt="${blog.title}" class="mainImage" onerror="this.onerror=null; this.src='https://www.signfix.com.au/wp-content/uploads/2017/09/placeholder-600x400.png';"/>
        <div class="comment_head">
            <img src="../images/myProfile.png" alt="user" class="profilePicture" onerror="this.onerror=null; this.src='https://www.signfix.com.au/wp-content/uploads/2017/09/placeholder-600x400.png';"/>
            <div class="comment_details">
                <h3 class="userName">${blog.createdBy}</h3>
                <p class="date">${formatedDate(blog.createdAt)}</p>
            </div>
        </div>
        <div class="blogDetails_content">
            <h1 class="title">${blog.title}</h1>
            <article class="text">${blog.description}</article>
        </div>
    </div>
    `;

  generateStars(4.4);
  addRatings.innerHTML = `
  <div class="ratings">
  ${ratingsHTML}
  </div>
  `;
};

const like = document.querySelector('#likeButton');
const liked = document.querySelector('#liked');
const commented = document.querySelector('.blogComments');
const leaveAComment = document.querySelector('#leaveAComment');
const messageInput = document.querySelector('#messageInput');
const emailInput = document.querySelector('#emailInput');
const fullNameInput = document.querySelector('#fullNameInput');
const form = document.querySelector('form');

const showLikes = (likes) => {
  liked.innerHTML = `${likes}
  `;
};

const showComments = (comments) => {
  let commentsHTML = '';

  commentsHTML += `${comments
    .map((comment) => `
            <div class="comment" data-aos="fade-up"  data-aos-duration="1000">
                <div class="comment_head">
                    <img src="../images/user.png" alt="user" class="profilePicture" onerror="this.onerror=null; this.src='https://www.signfix.com.au/wp-content/uploads/2017/09/placeholder-600x400.png';"/>
                    <div class="comment_details">
                        <h3 class="userName">${comment.commentedBy}</h3>
                        <p class="date">${formatedDate(comment.updatedAt)}</p>
                    </div>
                </div>
                <p class="text-small">${comment.description}</p>
            </div>
        `)
    .join('')}`;
  commented.innerHTML = commentsHTML;
};

if (fullNameInput) {
  fullNameInput.addEventListener('input', (e) => {
    checkInput(regExPatterns.fullName, e.target);
  });
}

if (emailInput) {
  emailInput.addEventListener('input', (e) => {
    checkInput(regExPatterns.email, e.target);
  });
}

if (messageInput) {
  messageInput.addEventListener('input', (e) => {
    checkInput(regExPatterns.blogContent, e.target);
  });
}

leaveAComment.addEventListener('submit', async (e) => {
  e.preventDefault();
  form.classList.add('submitted');
  const allInputs = form.querySelectorAll('.input-text');
  const allValid = Array.from(allInputs).every((input) => input.classList.contains('correct'));

  if (allValid) {
    loader.classList.add('show');
    form.classList.remove('submitted');

    const formData = {
      commentedBy: fullNameInput.value,
      description: messageInput.value,
    };

    const result = await addBlogComment(blogId, formData);
    if (result.ok) {
      loader.classList.remove('show');
      // eslint-disable-next-line no-undef
      Toastify({
        text: result.data.message,
        duration: 3000,
        close: true,
        gravity: 'top',
        position: 'right',
        backgroundColor: 'linear-gradient(to right, #00b09b, #96c93d)',
        stopOnFocus: true,
      }).showToast();

      loader.classList.remove('show');
      const comments = await getBlogComments(blogId);
      if (comments.data) showComments(comments.data.data);
      messageInput.value = '';
      fullNameInput.value = '';
      emailInput.value = '';
      form.classList.remove('submitted');
      allInputs.forEach((input) => {
        input.classList.remove('correct');

        const user = JSON.parse(localStorage.getItem('user')) || '';
        if (user) {
          userContainer.innerHTML = 'Logout';
          emailInput.value = user.email;
          const email = document.querySelector('#email');
          email.classList.add('correct');
          email.style.display = 'none';
        }
      });
    } else {
      loader.classList.remove('show');
      // eslint-disable-next-line no-undef
      Toastify({
        text: result.data.message || result.error,
        duration: 3000,
        close: true,
        gravity: 'top',
        position: 'right',
        backgroundColor: 'linear-gradient(to right, #ff5f6d, #ffc371)',
        stopOnFocus: true,
      }).showToast();
    }
  }
});

like.addEventListener('click', async (e) => {
  e.preventDefault();
  if (!localStorage.getItem('user')) {
    // eslint-disable-next-line no-undef
    Toastify({
      text: 'Please sign in',
      duration: 3000,
      close: true,
      gravity: 'top',
      position: 'right',
      backgroundColor: 'linear-gradient(to right, #ff5f6d, #ffc371)',
      stopOnFocus: true,
    }).showToast();
    return;
  }

  const liked = await likeABlog(blogId);
  if (!liked.error) {
    // eslint-disable-next-line no-undef
    Toastify({
      text: liked.message,
      duration: 3000,
      close: true,
      gravity: 'top',
      position: 'right',
      backgroundColor: 'linear-gradient(to right, #00b09b, #96c93d)',
      stopOnFocus: true,
    }).showToast();
    showLikes(liked.data);
  } else {
    // eslint-disable-next-line no-undef
    Toastify({
      text: liked.message || liked.error,
      duration: 3000,
      close: true,
      gravity: 'top',
      position: 'right',
      backgroundColor: 'linear-gradient(to right, #ff5f6d, #ffc371)',
      stopOnFocus: true,
    }).showToast();
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
});

window.onload = async () => {
  document.getElementById('preLoader').style.display = 'none';
  const currentUrl = new URL(window.location.href);
  const searchParams = new URLSearchParams(currentUrl.search);
  blogId = searchParams.get('id');

  const token = JSON.parse(localStorage.getItem('token')) || '';
  if (token) {
    const validated = await validateToken();
    if (!validated.data) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } else {
      const user = {
        userName: validated.data.userName,
        email: validated.data.email,
      };
      userContainer.innerHTML = 'Logout';
      emailInput.value = user.email;
      const email = document.querySelector('#email');
      email.classList.add('correct');
      email.style.display = 'none';
      localStorage.setItem('user', JSON.stringify(user));
      if (validated.data.role === 'admin') {
        changeMode.innerHTML = '<a href="./admin/dashboard.html" target="_blank">Dashboard</a>';
      }
    }
  }

  const selectedBlog = await getABlog(blogId);

  if (selectedBlog.data) {
    showBlog(selectedBlog.data.data);
  } else {
    window.location.href = '../index.html';
  }

  const likes = await getBlogLikes(blogId);

  if (likes.data) showLikes(likes.data);

  const comments = await getBlogComments(blogId);

  if (comments.data) showComments(comments.data.data);
};
