const views = {
  mine: {
    section: document.getElementById("view-mine"),
    avatar: document.getElementById("mineAvatar"),
    initials: document.getElementById("mineInitials"),
    name: document.getElementById("mineName"),
    role: document.getElementById("mineRole"),
    posts: document.getElementById("minePosts"),
    followers: document.getElementById("mineFollowers"),
    following: document.getElementById("mineFollowing"),
    grid: document.getElementById("minePostsGrid")
  },
  public: {
    section: document.getElementById("view-public"),
    avatar: document.getElementById("publicAvatar"),
    initials: document.getElementById("publicInitials"),
    nameHeading: document.getElementById("publicNameHeading"),
    location: document.getElementById("publicLocation"),
    posts: document.getElementById("publicPosts"),
    followers: document.getElementById("publicFollowers"),
    following: document.getElementById("publicFollowing"),
    bio: document.getElementById("publicBio"),
    followBtn: document.getElementById("publicFollowBtn"),
    grid: document.getElementById("publicPostsGrid")
  }
};

const profileData = {
  mine: {
    name: "Menyra User",
    roleLabel: "Explorer",
    location: "Prishtina",
    avatar: "",
    followers: 1200,
    following: 320,
    posts: [
      { url: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==", likes: 240, comments: 12 },
      { url: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==", likes: 512, comments: 38 },
      { url: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==", likes: 98, comments: 6 },
      { url: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==", likes: 180, comments: 20, wide: true }
    ]
  },
  public: {
    name: "Menyra Bistro",
    location: "Prishtina",
    avatar: "",
    bio: "Fresh plates, late-night bites, and a clean feed.",
    followers: 8450,
    following: 64,
    posts: [
      { url: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==", likes: 320, comments: 26 },
      { url: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==", likes: 210, comments: 14 },
      { url: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==", likes: 430, comments: 40 },
      { url: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==", likes: 112, comments: 9, wide: true }
    ]
  }
};

let isFollowing = false;

function initialsFrom(name) {
  const safe = String(name || "").trim();
  if (!safe) return "MU";
  return safe.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function setAvatar(imgEl, fallbackEl, url, name) {
  if (url) {
    imgEl.src = url;
    imgEl.style.display = "block";
    fallbackEl.style.display = "none";
  } else {
    imgEl.removeAttribute("src");
    imgEl.style.display = "none";
    fallbackEl.style.display = "grid";
    fallbackEl.textContent = initialsFrom(name);
  }
}

function renderPosts(container, posts, includeAddTile) {
  container.innerHTML = "";
  posts.forEach((post) => {
    const card = document.createElement("div");
    card.className = `post-card${post.wide ? " wide" : ""}`;
    const img = document.createElement("img");
    img.src = post.url;
    img.alt = "Post";
    const meta = document.createElement("div");
    meta.className = "post-meta";
    meta.innerHTML = `<span>❤ ${post.likes}</span><span>💬 ${post.comments}</span>`;
    card.appendChild(img);
    card.appendChild(meta);
    container.appendChild(card);
  });

  if (includeAddTile) {
    const add = document.createElement("div");
    add.className = "post-add";
    add.textContent = "Neu";
    container.appendChild(add);
  }
}

function renderMine() {
  const data = profileData.mine;
  views.mine.name.textContent = data.name;
  views.mine.role.textContent = `${data.roleLabel} / ${data.location}`;
  views.mine.posts.textContent = String(data.posts.length);
  views.mine.followers.textContent = String(data.followers);
  views.mine.following.textContent = String(data.following);
  setAvatar(views.mine.avatar, views.mine.initials, data.avatar, data.name);
  renderPosts(views.mine.grid, data.posts, true);
}

function renderPublic() {
  const data = profileData.public;
  views.public.nameHeading.textContent = data.name;
  views.public.location.textContent = `${data.location} / Business`;
  views.public.posts.textContent = String(data.posts.length);
  views.public.followers.textContent = String(data.followers);
  views.public.following.textContent = String(data.following);
  views.public.bio.textContent = data.bio;
  setAvatar(views.public.avatar, views.public.initials, data.avatar, data.name);
  renderPosts(views.public.grid, data.posts, false);
}

function setActiveView(view) {
  document.querySelectorAll(".tab").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.view === view);
  });
  Object.entries(views).forEach(([key, item]) => {
    item.section.classList.toggle("is-hidden", key !== view);
  });
}

document.querySelectorAll(".tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    setActiveView(btn.dataset.view);
  });
});

views.public.followBtn.addEventListener("click", () => {
  isFollowing = !isFollowing;
  views.public.followBtn.textContent = isFollowing ? "Following" : "Follow";
  views.public.followBtn.classList.toggle("is-active", isFollowing);
});

renderMine();
renderPublic();
