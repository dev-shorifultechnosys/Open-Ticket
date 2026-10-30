/* ======================================================================
  SECTION 04 — THE LIVE EXPERIENCE / FIVE-VIDEO SELECTOR (V13)
  Desktop: one player on the left; five thumbnail buttons on the right.
  Scroll-to-play: muted when visible, paused when out of view.
  User click: replace the main player source and play the chosen clip.
  No dependency on jQuery or third-party player frameworks.
====================================================================== */
(() => {
  'use strict';

  const section = document.getElementById('liveExperience');
  const player = document.getElementById('liveMainVideo');
  const cards = [...document.querySelectorAll('#liveExperience .ot-live__playlist-item')];
  const title = document.getElementById('liveVideoTitle');
  const category = document.getElementById('liveVideoCategory');
  const duration = document.getElementById('liveVideoDuration');
  const soundToggle = document.getElementById('liveSoundToggle');
  const soundLabel = document.getElementById('liveSoundLabel');
  const soundHint = document.getElementById('liveSoundHint');
  if (!section || !player || !cards.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let inView = false;
  let loadedIndex = -1;
  let soundEnabled = false; // Every new video starts muted; never surprise visitors with sound.
  // The first playlist card is Live Music. Keep it selected on the first load.
  const initialMusicIndex = cards.findIndex(card => card.dataset.videoCategory === 'Live Music');
  const defaultIndex = initialMusicIndex >= 0 ? initialMusicIndex : 0;

  function updateSoundControl() {
    if (!soundToggle) return;
    const canPlaySound = cards[loadedIndex < 0 ? 0 : loadedIndex]?.dataset.hasAudio === 'true';
    soundToggle.disabled = !canPlaySound;
    soundToggle.setAttribute('aria-pressed', String(soundEnabled && canPlaySound));
    soundToggle.setAttribute('aria-label', soundEnabled && canPlaySound ? 'Mute video sound' : 'Turn on video sound');
    if (soundLabel) soundLabel.textContent = !canPlaySound ? 'No audio' : soundEnabled ? 'Sound on' : 'Sound off';
    if (soundHint) soundHint.textContent = !canPlaySound ? 'This visual clip has no audio track.' : soundEnabled ? 'Audio is playing. Click to mute.' : 'Sound is off by default.';
  }

  soundToggle?.addEventListener('click', () => {
    if (soundToggle.disabled) return;
    soundEnabled = !soundEnabled;
    player.muted = !soundEnabled;
    player.volume = 0.8;
    updateSoundControl();
    if (soundEnabled) player.play().catch(() => {});
  });

  function playSilently() {
    if (document.hidden || !inView || reducedMotion.matches) return;
    player.muted = !soundEnabled;            // Initial autoplay is silent; user can explicitly unmute.
    player.play().catch(() => {
      // Autoplay can be blocked. Poster/native play control remain available.
    });
  }

  /** Load only the selected clip. Other clips do not download in the background. */
  function selectClip(index, fromClick = false) {
    const card = cards[index];
    if (!card) return;

    cards.forEach((other, i) => {
      const selected = i === index;
      other.classList.toggle('is-active', selected);
      other.setAttribute('aria-pressed', String(selected));
      other.setAttribute('aria-label', `${selected ? 'Playing' : 'Play'}: ${other.dataset.videoTitle || 'Video'}`);
    });

    if (title) title.textContent = card.dataset.videoTitle || 'Live Experience';
    if (category) category.textContent = card.dataset.videoCategory || 'Live Events';
    if (duration) duration.textContent = card.dataset.videoDuration || '';

    if (loadedIndex !== index) {
      soundEnabled = false;
      player.muted = true;
      player.pause();
      player.replaceChildren();
      player.poster = card.dataset.videoPoster || '';
      const source = document.createElement('source');
      source.src = card.dataset.videoSrc;
      source.type = 'video/mp4';
      player.append(source);
      player.load();
      loadedIndex = index;
    }
    updateSoundControl();

    if (fromClick) {
      // Direct user interaction is allowed even with reduced-motion preference.
      // Keep the initial playback muted; native video controls can unmute.
      player.muted = !soundEnabled;
      player.play().catch(() => {});
    } else {
      playSilently();
    }
  }

  cards.forEach((card, index) => {
    card.addEventListener('click', () => selectClip(index, true));
  });

  // Observe the VIDEO rather than the entire tall section. A threshold based
  // on the section fails on short laptop/mobile viewports.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        inView = entry.isIntersecting && entry.intersectionRatio >= .22;
        if (inView) {
          if (loadedIndex === -1) selectClip(defaultIndex, false);
          else playSilently();
        } else player.pause();
      }
    }, {threshold:[0,.22,.45]});
    observer.observe(player);
  } else {
    // Legacy fallback: no automatic downloads until the first user interaction.
    selectClip(defaultIndex, false);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) player.pause();
    else if (inView) playSilently();
  });
  reducedMotion.addEventListener?.('change', event => {
    if (event.matches) player.pause();
    else playSilently();
  });

  // Initial state: poster visible. The first source loads only once in view.
  cards.forEach((card, index) => {
    const selected = index === defaultIndex;
    card.classList.toggle('is-active', selected);
    card.setAttribute('aria-pressed', String(selected));
  });
  cards[defaultIndex].setAttribute('aria-label', `Playing: ${cards[defaultIndex].dataset.videoTitle || 'Live Music'}`);
})();
