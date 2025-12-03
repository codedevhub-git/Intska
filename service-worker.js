/**
 * Service Worker for Brain Challenge Engine
 * Enables offline functionality and PWA installation
 * * UPDATE HISTORY:
 * v2 - Updated CSS and HTML structure
 */

// CHANGE THIS VERSION NUMBER whenever you update CSS/JS/HTML
const CACHE_NAME = 'brain-challenge-v4'; 

const urlsToCache = [
  './',
  './index.html',
  './game.html',
  './css/global.css',
  './css/landing.css',
  './css/game.css',
  './css/challenges.css',
  './js/app.js',
  './js/storage.js',
  './js/core/engine.js',
  './js/core/ui.js',
  './js/core/timer.js',
  './js/core/difficulty.js',
  './js/challenges/registry.js',
  './js/challenges/math.js',
  './js/challenges/logic.js',
  './js/challenges/memory.js',
  './js/challenges/puzzles.js',
  './js/utils/random.js',
  './js/utils/validators.js',
  './js/utils/animations.js',
  './manifest.json'
];

// Install event - cache files
self.addEventListener('install', (event) => {
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache: ' + CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  
  // Claim clients immediately so the user doesn't have to reload twice
  event.waitUntil(clients.claim());

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});