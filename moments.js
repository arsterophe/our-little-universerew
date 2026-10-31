/**
 * OUR LITTLE MOMENTS — SHARED SCRAPBOOK & STORIES STORE
 * 
 * Manages daily stories (24h lifespan), scrapbook memories feed,
 * reactions, archive collection, and character perspectives for Nyanya, Lala, and Lele.
 * 
 * Note: Data in this phase is maintained in a local reactive store,
 * architected cleanly for future Firebase Firestore & Storage integration.
 */

// Initial Mock Stories (Simulated 24-hour expiration)
export const INITIAL_STORIES = [
  {
    id: 'story-nyanya-1',
    author: 'nyanya',
    authorName: 'Nyanya',
    authorRole: 'The Moonlit Shadow Witch',
    avatar: '/assets/avatar_nyanya_hd.png',
    photoUrl: '/assets/moment_coffee_study.jpg',
    caption: 'Seduh latte hangat bertabur bintang sambil nulis jurnal & mantra malam ⭐✨ Menemani revisi portofolio bab 3!',
    timestamp: Date.now() - 2.5 * 3600 * 1000, // 2.5 hours ago
    timeAgo: '2 jam lalu',
    viewed: false,
    isArchived: false,
    likes: 5
  },
  {
    id: 'story-lala-1',
    author: 'lala',
    authorName: 'Lala',
    authorRole: 'The Everglow Fairy',
    avatar: '/assets/avatar_lala_hd.png',
    photoUrl: '/assets/moment_fairy_tea.jpg',
    caption: 'Pesta teh mungil di taman mawar bareng macarons lavender buatan sendiri 🌸🍰 Manisnya pas banget!',
    timestamp: Date.now() - 6 * 3600 * 1000, // 6 hours ago
    timeAgo: '6 jam lalu',
    viewed: false,
    isArchived: false,
    likes: 8
  }
  // Note: Lele intentionally has no active story in the last 24h to demonstrate
  // the visual indicator requirement: "Sediakan indikator visual untuk karakter yang belum mengunggah momen hari ini."
];

// Initial Mock Moments (Scrapbook Feed)
export const INITIAL_MOMENTS = [
  {
    id: 'moment-1',
    author: 'nyanya',
    authorName: 'Nyanya (Alenda)',
    authorRole: 'The Moonlit Shadow Witch',
    authorAvatar: '/assets/avatar_nyanya_hd.png',
    photoUrl: '/assets/moment_coffee_study.jpg',
    timestamp: 'Hari ini, 16:40 WIB',
    createdAt: Date.now() - 2 * 3600 * 1000,
    caption: 'Malam ini langit cerah banget dari jendela kamarku. Kopi hangat bertabur bintang untuk menemani bab 3 tugas kita 💜✨ Jangan lupa istirahat ya sahabatku!',
    likes: 14,
    likedByMe: false,
    isArchived: true,
    location: 'Universe KIDULT Studio'
  },
  {
    id: 'moment-2',
    author: 'lala',
    authorName: 'Lala (Bella)',
    authorRole: 'The Everglow Fairy',
    authorAvatar: '/assets/avatar_lala_hd.png',
    photoUrl: '/assets/moment_fairy_tea.jpg',
    timestamp: 'Hari ini, 12:15 WIB',
    createdAt: Date.now() - 6 * 3600 * 1000,
    caption: 'Pagi tadi nyoba resep macaron lavender baru! Rasanya manis dan wangi bunga mawar 🌸 Buat meeting Jumat nanti aku bawain ke ruang santai yaa~',
    likes: 21,
    likedByMe: true,
    isArchived: false,
    location: 'Universe TO YOU Teahouse'
  },
  {
    id: 'moment-3',
    author: 'lele',
    authorName: 'Lele (Vanya)',
    authorRole: 'The Eclipse Guardian',
    authorAvatar: '/assets/avatar_lele_hd.png',
    photoUrl: '/assets/moment_stargazing.jpg',
    timestamp: 'Kemarin, 21:00 WIB',
    createdAt: Date.now() - 24 * 3600 * 1000,
    caption: 'Menemukan konstelasi baru di balkon barat. Udaranya sejuk dan damai banget. Mengirimkan pelukan kosmik dari Universe SHADOW untuk Nyanya & Lala 🌙🖤',
    likes: 27,
    likedByMe: true,
    isArchived: true,
    location: 'Observatorium Langit Shadow'
  }
];

// Character definitions for Moments
export const CHARACTERS_MOMENTS = {
  nyanya: {
    id: 'nyanya',
    name: 'Nyanya',
    fullName: 'Nyanya (Alenda)',
    role: 'The Moonlit Shadow Witch',
    avatar: '/assets/avatar_nyanya_hd.png',
    accentColor: '#c084fc',
    symbol: '★'
  },
  lala: {
    id: 'lala',
    name: 'Lala',
    fullName: 'Lala (Bella)',
    role: 'The Everglow Fairy',
    avatar: '/assets/avatar_lala_hd.png',
    accentColor: '#f472b6',
    symbol: '☼'
  },
  lele: {
    id: 'lele',
    name: 'Lele',
    fullName: 'Lele (Vanya)',
    role: 'The Eclipse Guardian',
    avatar: '/assets/avatar_lele_hd.png',
    accentColor: '#818cf8',
    symbol: '☾'
  }
};

// Reactive State
let stories = [...INITIAL_STORIES];
let moments = [...INITIAL_MOMENTS];
let activeFilter = 'all'; // 'all', 'nyanya', 'lala', 'lele', 'archive'
let activeUserCharacter = 'nyanya'; // Default viewing perspective

// Subscriptions
const listeners = [];
function notifyListeners() {
  listeners.forEach(fn => fn());
}

export function subscribeMoments(fn) {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx > -1) listeners.splice(idx, 1);
  };
}

// Getters
export function getStories() {
  // Filter stories younger than 24 hours (86,400,000 ms)
  const now = Date.now();
  const maxAge = 24 * 3600 * 1000;
  return stories.filter(s => now - s.timestamp <= maxAge);
}

export function getStoriesByCharacter(charKey) {
  return getStories().filter(s => s.author === charKey);
}

export function hasActiveStories(charKey) {
  return getStoriesByCharacter(charKey).length > 0;
}

export function hasUnseenStories(charKey) {
  const charStories = getStoriesByCharacter(charKey);
  return charStories.some(s => !s.viewed);
}

export function getActiveFilter() {
  return activeFilter;
}

export function setActiveFilter(filter) {
  activeFilter = filter;
  notifyListeners();
}

export function getActiveUserCharacter() {
  return activeUserCharacter;
}

export function setActiveUserCharacter(charKey) {
  activeUserCharacter = charKey;
  notifyListeners();
}

// Moments Feed Filter
export function getMomentsFeed(filter = null) {
  const currentFilter = filter !== null ? filter : activeFilter;

  if (currentFilter === 'archive') {
    return moments.filter(m => m.isArchived);
  }
  if (currentFilter === 'all') {
    return moments;
  }
  return moments.filter(m => m.author === currentFilter);
}

export function getArchiveMoments() {
  return moments.filter(m => m.isArchived);
}

// Stories Actions
export function markStoryAsViewed(storyId) {
  const story = stories.find(s => s.id === storyId);
  if (story) {
    story.viewed = true;
    notifyListeners();
  }
}

export function saveStoryToArchive(storyId) {
  const story = stories.find(s => s.id === storyId);
  if (!story) return false;

  story.isArchived = true;

  // Also add or mark as archived in moments feed
  const existing = moments.find(m => m.photoUrl === story.photoUrl);
  if (existing) {
    existing.isArchived = true;
  } else {
    moments.unshift({
      id: 'moment-arc-' + Date.now(),
      author: story.author,
      authorName: story.authorName,
      authorRole: story.authorRole,
      authorAvatar: story.avatar,
      photoUrl: story.photoUrl,
      timestamp: 'Disimpan dari Story ✦',
      createdAt: Date.now(),
      caption: story.caption,
      likes: story.likes || 1,
      likedByMe: true,
      isArchived: true,
      location: 'Arsip Story 24 Jam'
    });
  }

  notifyListeners();
  return true;
}

// Feed Actions
export function toggleLikeMoment(momentId) {
  const moment = moments.find(m => m.id === momentId);
  if (!moment) return false;

  if (moment.likedByMe) {
    moment.likes = Math.max(0, moment.likes - 1);
    moment.likedByMe = false;
  } else {
    moment.likes += 1;
    moment.likedByMe = true;
  }

  notifyListeners();
  return moment;
}

export function toggleArchiveMoment(momentId) {
  const moment = moments.find(m => m.id === momentId);
  if (!moment) return false;

  moment.isArchived = !moment.isArchived;
  notifyListeners();
  return moment.isArchived;
}

// Add New Moment / Story
export function addMoment({
  photoUrl,
  caption = '',
  type = 'feed', // 'story', 'feed', or 'both'
  author = 'nyanya',
  location = 'Our Little Universe'
}) {
  const char = CHARACTERS_MOMENTS[author] || CHARACTERS_MOMENTS.nyanya;
  const now = Date.now();
  const newId = 'moment-' + now;

  // 1. If shared to Stories (24h lifespan)
  if (type === 'story' || type === 'both') {
    const newStory = {
      id: 'story-' + now,
      author: char.id,
      authorName: char.name,
      authorRole: char.role,
      avatar: char.avatar,
      photoUrl,
      caption: caption.trim(),
      timestamp: now,
      timeAgo: 'Baru saja',
      viewed: false,
      isArchived: false,
      likes: 0
    };
    stories.unshift(newStory);
  }

  // 2. If shared to Scrapbook Feed
  if (type === 'feed' || type === 'both') {
    const newFeedItem = {
      id: newId,
      author: char.id,
      authorName: char.fullName,
      authorRole: char.role,
      authorAvatar: char.avatar,
      photoUrl,
      timestamp: 'Hari ini, Baru saja',
      createdAt: now,
      caption: caption.trim(),
      likes: 0,
      likedByMe: false,
      isArchived: false,
      location
    };
    moments.unshift(newFeedItem);
  }

  notifyListeners();
  return true;
}
