import { videoToScreen } from './utils.js';

export function initHandTracking(state, videoEl, handDot, uiEl) {
  function initMediaPipe() {
    const hands = new Hands({
      locateFile: file =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}`
    });

    hands.setOptions({
      maxNumHands:            1,
      modelComplexity:        0,    // 0 = Lite, fastest
      minDetectionConfidence: 0.55,
      minTrackingConfidence:  0.5,
    });

    hands.onResults(results => {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const lm = results.multiHandLandmarks[0];
        state.debugLandmarks = lm;

        // Landmark 9 = middle-finger MCP, sits dead centre of palm
        const palm = lm[9];
        state.prevHX = state.handX;
        state.prevHY = state.handY;
        const sp = videoToScreen(palm.x, palm.y, state.W, state.H);
        state.handX    = sp.x;
        state.handY    = sp.y;
        state.handSeen = true;

        handDot.style.display = 'block';
        handDot.style.left    = state.handX + 'px';
        handDot.style.top     = state.handY + 'px';
        uiEl.textContent      = '🐠 Move your hand to scare the fish!';
      } else {
        state.debugLandmarks = null;
        state.handSeen       = false;
        state.handVX         = 0;
        state.handVY         = 0;
        handDot.style.display = 'none';
        uiEl.textContent      = 'Show your hand to interact';
      }
    });

    // Start camera at 640×480 — enough for tracking, won't murder performance
    navigator.mediaDevices.getUserMedia({
      video: {
        width:     { ideal: 640 },
        height:    { ideal: 480 },
        facingMode: 'user',
        frameRate: { ideal: 30, max: 30 }
      }
    }).then(stream => {
      videoEl.srcObject = stream;
      videoEl.play();
      uiEl.textContent = 'Loading hand model…';

      // Send every frame — no throttle. The busy flag just prevents stacking
      // if a frame takes longer than 16ms to process.
      let busy = false;

      function detect() {
        requestAnimationFrame(detect);
        if (!busy && videoEl.readyState >= 2) {
          busy = true;
          hands.send({ image: videoEl })
            .then(()  => { busy = false; })
            .catch(()  => { busy = false; });
        }
      }
      requestAnimationFrame(detect);

    }).catch(err => {
      uiEl.textContent = '❌ Camera denied — allow camera access then reload';
      console.error(err);
    });
  }

  // Load MediaPipe script dynamically then init
  const mpScript       = document.createElement('script');
  mpScript.src         = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/hands.js';
  mpScript.crossOrigin = 'anonymous';
  mpScript.onload      = initMediaPipe;
  mpScript.onerror     = () => { uiEl.textContent = '❌ Failed to load MediaPipe — check connection'; };
  document.head.appendChild(mpScript);
}
