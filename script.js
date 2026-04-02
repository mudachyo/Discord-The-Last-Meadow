/*
  Discord games unified bot (browser console/userscript style).

  Includes:
  - Adventure autoclicker
  - Triplet 3x3 bot
  - Arrow sequence bot
  - Target click bot

  Main commands:
  - window.discordGameBots.adventure.start()
  - window.discordGameBots.triplet.start()
  - window.discordGameBots.arrow.start()
  - window.discordGameBots.target.start()
  - window.discordGameBots.startAll()
  - window.discordGameBots.stopAll()
  - window.discordGameBots.status()
  - window.discordGameBots.unload()
*/

(function () {
  "use strict";

  if (window.discordGameBots && typeof window.discordGameBots.unload === "function") {
    window.discordGameBots.unload();
  }

  function sleep(ms) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, ms);
    });
  }

  function clickElement(el) {
    el.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, cancelable: true }));
    el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
    el.dispatchEvent(new MouseEvent("pointerup", { bubbles: true, cancelable: true }));
    el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true }));
    el.click();
  }

  function isDisabledButton(button) {
    if (!button) return true;
    if (button.classList.contains("disabled__65fca")) return true;
    var container = button.querySelector(".container__65fca");
    if (container && container.classList.contains("containerDisabled__65fca")) return true;
    if (button.getAttribute("aria-disabled") === "true") return true;
    return false;
  }

  function extractAssetHashFromSrc(src) {
    if (!src) return "";
    var match = src.match(/\/([a-f0-9]{64})\.svg(?:\?|$)/i);
    return match ? String(match[1]).toLowerCase() : "";
  }

  function getActivityButtonsWithAssetHash() {
    var candidates = document.querySelectorAll(
      ".activityButton__8af73 .button__65fca.buttonWhite__65fca.clickable__5c90e[role='button']"
    );
    var result = [];

    for (var i = 0; i < candidates.length; i += 1) {
      var btn = candidates[i];
      var icon = btn.querySelector("img.activityButtonAsset__8af73");
      if (!icon) continue;

      var src = icon.getAttribute("src") || "";
      result.push({
        button: btn,
        hash: extractAssetHashFromSrc(src),
      });
    }

    return result;
  }

  function makeAdventureBot() {
    var state = {
      timerId: null,
      intervalMs: 60,
      clicks: 0,
      active: false,
    };

    function findAdventureButton() {
      var selectors = [
        ".game__5c62c .activityButton__8af73 [role='button']",
        ".activityButton__8af73 .button__65fca.clickable__5c90e[role='button']",
        ".activityButton__8af73 .clickable__5c90e[role='button']",
        ".activityButton__8af73 [role='button']",
      ];

      for (var i = 0; i < selectors.length; i += 1) {
        var button = document.querySelector(selectors[i]);
        if (button) return button;
      }

      return null;
    }

    function tick() {
      var button = findAdventureButton();
      if (!button) return;
      button.click();
      state.clicks += 1;
    }

    function start() {
      if (state.active) return;
      state.timerId = window.setInterval(tick, state.intervalMs);
      state.active = true;
      console.log("[unified.adventure] Started");
    }

    function stop() {
      if (!state.active) return;
      window.clearInterval(state.timerId);
      state.timerId = null;
      state.active = false;
      console.log("[unified.adventure] Stopped");
    }

    function status() {
      return {
        active: state.active,
        intervalMs: state.intervalMs,
        clicks: state.clicks,
        buttonFound: Boolean(findAdventureButton()),
      };
    }

    function unload() {
      stop();
    }

    return {
      start: start,
      stop: stop,
      status: status,
      unload: unload,
    };
  }

  function makeTripletBot() {
    var state = {
      running: false,
      workerToken: 0,
      rounds: 0,
      tripletsClicked: 0,
      clickDelayMs: 120,
      roundDelayMs: 450,
      actionDelayMs: 700,
      lastActionAt: 0,
      continueClicks: 0,
      restartClicks: 0,
    };

    function canDoActionNow() {
      return Date.now() - state.lastActionAt >= state.actionDelayMs;
    }

    function markAction() {
      state.lastActionAt = Date.now();
    }

    function getGridItems() {
      var items = document.querySelectorAll(".grid__0dcd3 .gridItem__0dcd3[role='button']");
      if (items.length > 0) return Array.prototype.slice.call(items);

      var fallback = document.querySelectorAll(".grid__0dcd3 [role='button']");
      return Array.prototype.slice.call(fallback);
    }

    function getGlyphSignature(item) {
      var svg =
        item.querySelector("svg.gridAssetGlyph__0dcd3") ||
        item.querySelector(".gridAssetFront__0dcd3 svg") ||
        item.querySelector("svg");

      if (!svg) return null;

      var viewBox = svg.getAttribute("viewBox") || "";
      var width = svg.getAttribute("width") || "";
      var height = svg.getAttribute("height") || "";
      var paths = svg.querySelectorAll("path");
      var parts = [viewBox, width, height, String(paths.length)];

      for (var i = 0; i < paths.length; i += 1) {
        var d = paths[i].getAttribute("d") || "";
        parts.push(d);
      }

      return parts.join("|");
    }

    function isMatched(item) {
      return item && item.classList && item.classList.contains("matched__0dcd3");
    }

    function isClickable(item) {
      if (!item || !item.isConnected) return false;
      if (isMatched(item)) return false;
      if (item.getAttribute("aria-disabled") === "true") return false;
      if (item.hasAttribute("disabled")) return false;

      var style = window.getComputedStyle(item);
      if (style.pointerEvents === "none") return false;
      if (style.visibility === "hidden") return false;
      if (style.display === "none") return false;

      return true;
    }

    function findContinueButton() {
      var buttons = document.querySelectorAll(".button__65fca.buttonWhite__65fca.clickable__5c90e[role='button']");

      for (var i = 0; i < buttons.length; i += 1) {
        var btn = buttons[i];
        if (isDisabledButton(btn)) continue;

        var inActivityCard = !!btn.closest(".activityButton__8af73");
        var hasActivityAsset = !!btn.querySelector(".activityButtonAsset__8af73");
        if (!inActivityCard && !hasActivityAsset) return btn;
      }

      return null;
    }

    function findBattleStartButton() {
      var knownBattleHashes = {
        "0492e3943e17e3e6ef69e8bf91b165658f9ed36c96fe3b3d78e354e99e5cbcc4": true,
        "16fb25536f00a7996cbdf5bfff2ef0d09459f580af9e67d380263f5ead43055e": true,
      };
      var buttons = getActivityButtonsWithAssetHash();

      for (var i = 0; i < buttons.length; i += 1) {
        if (knownBattleHashes[buttons[i].hash]) return buttons[i].button;
      }

      // Fallback: in reported layouts battle is usually the second activity button.
      if (buttons.length >= 2) return buttons[1].button;
      if (buttons.length >= 1) return buttons[0].button;

      return null;
    }

    function pickTriplet(items) {
      var groups = Object.create(null);

      for (var i = 0; i < items.length; i += 1) {
        var item = items[i];
        if (!isClickable(item)) continue;

        var key = getGlyphSignature(item);
        if (!key) continue;

        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
      }

      var keys = Object.keys(groups);
      for (var j = 0; j < keys.length; j += 1) {
        var list = groups[keys[j]];
        if (list.length >= 3) return list.slice(0, 3);
      }

      return null;
    }

    function countUnmatched(items) {
      var count = 0;
      for (var i = 0; i < items.length; i += 1) {
        if (!isMatched(items[i])) count += 1;
      }
      return count;
    }

    async function workerLoop(token) {
      while (state.running && token === state.workerToken) {
        var items = getGridItems();
        var unmatched = countUnmatched(items);

        if (unmatched === 0 && items.length > 0) {
          if (canDoActionNow()) {
            var continueButton = findContinueButton();
            if (continueButton) {
              clickElement(continueButton);
              state.continueClicks += 1;
              markAction();
            }
          }

          await sleep(state.roundDelayMs);
          continue;
        }

        if (items.length === 0) {
          if (canDoActionNow()) {
            var battleButton = findBattleStartButton();
            if (battleButton && !isDisabledButton(battleButton)) {
              clickElement(battleButton);
              state.restartClicks += 1;
              markAction();
            }
          }

          await sleep(state.roundDelayMs);
          continue;
        }

        var triplet = pickTriplet(items);
        if (!triplet) {
          await sleep(state.roundDelayMs);
          continue;
        }

        for (var i = 0; i < triplet.length; i += 1) {
          if (!state.running || token !== state.workerToken) return;
          if (isClickable(triplet[i])) {
            clickElement(triplet[i]);
            await sleep(state.clickDelayMs);
          }
        }

        state.tripletsClicked += 1;
        state.rounds += 1;
        await sleep(state.roundDelayMs);
      }
    }

    function start() {
      if (state.running) return;
      state.running = true;
      state.workerToken += 1;
      workerLoop(state.workerToken);
      console.log("[unified.triplet] Started");
    }

    function stop() {
      if (!state.running) return;
      state.running = false;
      state.workerToken += 1;
      console.log("[unified.triplet] Stopped");
    }

    function status() {
      var items = getGridItems();
      var unmatched = countUnmatched(items);
      var battleButton = findBattleStartButton();
      return {
        running: state.running,
        gridItems: items.length,
        unmatchedItems: unmatched,
        allMatchedNow: items.length > 0 && unmatched === 0,
        rounds: state.rounds,
        tripletsClicked: state.tripletsClicked,
        continueClicks: state.continueClicks,
        restartClicks: state.restartClicks,
        clickDelayMs: state.clickDelayMs,
        roundDelayMs: state.roundDelayMs,
        actionDelayMs: state.actionDelayMs,
        battleButtonReadyNow: Boolean(battleButton && !isDisabledButton(battleButton)),
        tripletFoundNow: Boolean(pickTriplet(items)),
      };
    }

    function unload() {
      stop();
    }

    return {
      start: start,
      stop: stop,
      status: status,
      unload: unload,
    };
  }

  function makeArrowBot() {
    var state = {
      running: false,
      workerToken: 0,
      roundDelayMs: 350,
      keyDelayMs: 80,
      actionDelayMs: 700,
      lastActionAt: 0,
      roundsSolved: 0,
      keysPressed: 0,
      continueSeen: false,
      continueClicked: false,
      continueClicks: 0,
      startClicks: 0,
    };

    function canDoActionNow() {
      return Date.now() - state.lastActionAt >= state.actionDelayMs;
    }

    function markAction() {
      state.lastActionAt = Date.now();
    }

    function findContinueButton() {
      var buttons = document.querySelectorAll(".button__65fca.buttonWhite__65fca.clickable__5c90e[role='button']");

      for (var i = 0; i < buttons.length; i += 1) {
        var btn = buttons[i];
        if (isDisabledButton(btn)) continue;

        if (btn.closest(".activityButton__8af73")) continue;
        if (btn.querySelector(".activityButtonAsset__8af73")) continue;

        return btn;
      }

      return null;
    }

    function findCraftStartButton() {
      var knownCraftHashes = {
        "b7febb5be9c15a67c50fc5978c3ecd1d258d0c424a0dc3ce41b2c8ac65c9e339": true,
        "23aba2aedfd9bbaf53e3c3e64ca29c3671fd8c6d31439e4a37452ea501704e18": true,
        "b6038208c7b31006aba89db1e1454425919275f8ac3a6afbff8b36db9946e710": true,
      };
      var buttons = getActivityButtonsWithAssetHash();

      for (var i = 0; i < buttons.length; i += 1) {
        if (knownCraftHashes[buttons[i].hash]) return buttons[i].button;
      }

      // Fallback: in reported layouts craft is usually the first activity button.
      if (buttons.length >= 1) return buttons[0].button;

      return null;
    }

    function getSequenceNodes() {
      return Array.prototype.slice.call(
        document.querySelectorAll(".sequences__34527 .character__34527 img")
      );
    }

    function mapAltToKey(altText) {
      if (altText === "ArrowUp") return "ArrowUp";
      if (altText === "ArrowDown") return "ArrowDown";
      if (altText === "ArrowLeft") return "ArrowLeft";
      if (altText === "ArrowRight") return "ArrowRight";
      return null;
    }

    function readSequence() {
      var nodes = getSequenceNodes();
      if (nodes.length === 0) return [];

      var keys = [];
      for (var i = 0; i < nodes.length; i += 1) {
        var altText = nodes[i].getAttribute("alt") || "";
        var key = mapAltToKey(altText);
        if (!key) return [];
        keys.push(key);
      }

      return keys;
    }

    function dispatchArrowKey(key) {
      var target = document.activeElement || document.body || document.documentElement;
      var eventInit = {
        key: key,
        code: key,
        bubbles: true,
        cancelable: true,
      };

      target.dispatchEvent(new KeyboardEvent("keydown", eventInit));
      target.dispatchEvent(new KeyboardEvent("keyup", eventInit));
    }

    async function playOneRound() {
      var sequence = readSequence();
      if (sequence.length === 0) return false;

      for (var i = 0; i < sequence.length; i += 1) {
        dispatchArrowKey(sequence[i]);
        state.keysPressed += 1;
        await sleep(state.keyDelayMs);
      }

      state.roundsSolved += 1;
      return true;
    }

    async function workerLoop(token) {
      while (state.running && token === state.workerToken) {
        var continueButton = findContinueButton();
        if (continueButton) {
          state.continueSeen = true;

          if (canDoActionNow()) {
            clickElement(continueButton);
            state.continueClicked = true;
            state.continueClicks += 1;
            markAction();
          }

          await sleep(state.roundDelayMs);
          continue;
        }

        var sequenceNodes = getSequenceNodes();
        if (sequenceNodes.length > 0) {
          await playOneRound();
          await sleep(state.roundDelayMs);
          continue;
        }

        if (canDoActionNow()) {
          var startButton = findCraftStartButton();
          if (startButton && !isDisabledButton(startButton)) {
            clickElement(startButton);
            state.startClicks += 1;
            markAction();
          }
        }

        await sleep(state.roundDelayMs);
      }
    }

    function start() {
      if (state.running) return;
      state.running = true;
      state.workerToken += 1;
      workerLoop(state.workerToken);
      console.log("[unified.arrow] Started");
    }

    function stop() {
      if (!state.running) return;
      state.running = false;
      state.workerToken += 1;
      console.log("[unified.arrow] Stopped");
    }

    function status() {
      var startButton = findCraftStartButton();
      return {
        running: state.running,
        sequenceVisibleNow: getSequenceNodes().length > 0,
        continueVisibleNow: Boolean(findContinueButton()),
        startButtonVisibleNow: Boolean(startButton),
        startButtonReadyNow: Boolean(startButton && !isDisabledButton(startButton)),
        roundsSolved: state.roundsSolved,
        keysPressed: state.keysPressed,
        continueSeen: state.continueSeen,
        continueClicked: state.continueClicked,
        continueClicks: state.continueClicks,
        startClicks: state.startClicks,
        keyDelayMs: state.keyDelayMs,
        roundDelayMs: state.roundDelayMs,
        actionDelayMs: state.actionDelayMs,
      };
    }

    function unload() {
      stop();
    }

    return {
      start: start,
      stop: stop,
      status: status,
      unload: unload,
    };
  }

  function makeTargetBot() {
    var state = {
      running: false,
      workerToken: 0,
      scanDelayMs: 45,
      clicks: 0,
    };

    function isVisible(el) {
      if (!el || !el.isConnected) return false;
      var style = window.getComputedStyle(el);
      if (style.display === "none") return false;
      if (style.visibility === "hidden") return false;
      if (style.pointerEvents === "none") return false;
      return true;
    }

    function getTargetButtons() {
      var buttons = document.querySelectorAll(
        ".targetContainer_b6b008 .clickable__5c90e[role='button']"
      );
      if (buttons.length > 0) return Array.prototype.slice.call(buttons);

      var imgs = document.querySelectorAll("img.target_b6b008[alt='target'], img[alt='target']");
      var fallback = [];

      for (var i = 0; i < imgs.length; i += 1) {
        var btn = imgs[i].closest("[role='button']");
        if (!btn) continue;
        fallback.push(btn);
      }

      return fallback;
    }

    async function workerLoop(token) {
      while (state.running && token === state.workerToken) {
        var targetButtons = getTargetButtons();

        for (var i = 0; i < targetButtons.length; i += 1) {
          if (!state.running || token !== state.workerToken) return;

          var btn = targetButtons[i];
          if (!isVisible(btn)) continue;
          clickElement(btn);
          state.clicks += 1;
        }

        await sleep(state.scanDelayMs);
      }
    }

    function start() {
      if (state.running) return;
      state.running = true;
      state.workerToken += 1;
      workerLoop(state.workerToken);
      console.log("[unified.target] Started");
    }

    function stop() {
      if (!state.running) return;
      state.running = false;
      state.workerToken += 1;
      console.log("[unified.target] Stopped");
    }

    function status() {
      return {
        running: state.running,
        targetsVisibleNow: getTargetButtons().length,
        clicks: state.clicks,
        scanDelayMs: state.scanDelayMs,
      };
    }

    function unload() {
      stop();
    }

    return {
      start: start,
      stop: stop,
      status: status,
      unload: unload,
    };
  }

  var bots = {
    adventure: makeAdventureBot(),
    triplet: makeTripletBot(),
    arrow: makeArrowBot(),
    target: makeTargetBot(),
    startAll: function () {
      bots.adventure.start();
      bots.triplet.start();
      bots.arrow.start();
      bots.target.start();
    },
    stopAll: function () {
      bots.adventure.stop();
      bots.triplet.stop();
      bots.arrow.stop();
      bots.target.stop();
    },
    status: function () {
      var info = {
        adventure: bots.adventure.status(),
        triplet: bots.triplet.status(),
        arrow: bots.arrow.status(),
        target: bots.target.status(),
      };
      console.log("[discordGameBots] Status:", info);
      return info;
    },
    unload: function () {
      bots.stopAll();

      // Compatibility aliases cleanup.
      try {
        delete window.adventureClicker;
      } catch (err1) {
        window.adventureClicker = undefined;
      }

      try {
        delete window.tripletGridBot;
      } catch (err2) {
        window.tripletGridBot = undefined;
      }

      try {
        delete window.arrowSequenceBot;
      } catch (err3) {
        window.arrowSequenceBot = undefined;
      }

      try {
        delete window.targetShooterBot;
      } catch (err4) {
        window.targetShooterBot = undefined;
      }

      try {
        delete window.discordGameBots;
      } catch (err5) {
        window.discordGameBots = undefined;
      }

      console.log("[discordGameBots] Unloaded completely.");
    },
  };

  // Compatibility aliases for old command names.
  window.adventureClicker = bots.adventure;
  window.tripletGridBot = bots.triplet;
  window.arrowSequenceBot = bots.arrow;
  window.targetShooterBot = bots.target;
  window.discordGameBots = bots;

  bots.startAll();
  console.log("[discordGameBots] Loaded and started all bots. Use window.discordGameBots.status() to inspect.");
})();
