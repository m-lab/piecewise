/*
*  A mirror of the expand toggle module by Threespot,
* with some changes for our needs
* https://github.com/Threespot/expand-toggle/blob/master/index.js
*/

"use strict";

import debounce from "lodash/debounce";
import EventEmitter from "ev-emitter";

/**
 * Wrap the last X words in an HTML tag to prevent them from wrapping (i.e. orphans)
 * @param {HTMLElement} el - Toggle button DOM node
 * @param {Object} opts - Options
 * @param {string} [opts.expandedClasses=""] - Class(es) to apply when expanded
 * @param {boolean} [opts.shouldToggleHeight=false] - Whether or not to animate height
 * @param {string} [opts.activeToggleText=""] - Expanded state toggle button text
 * @param {boolean} [opts.shouldStartExpanded=false] - Whether menu should start expanded
 * @param {function} [opts.onReady=""] - Ready callback function
 */
export default class ExpandToggle extends EventEmitter {
  constructor(el, opts) {
    // Have to call super() first before referencing “this” since we’re extending EventEmitter
    // https://stackoverflow.com/a/43591507/673457
    super();

    this.el = el;
    this.targetId = this.el.getAttribute("data-expands");
    this.targetEl = document.getElementById(this.targetId);

    // Ensure target element exist before initializing
    if (!this.targetEl) {
      console.warn(`Can’t find expandable target with id “${this.targetId}”`);
      return false;
    }

    // Use Object.assign() to merge “opts” object with default values in this.options
    this.options = Object.assign(
      {},
      {
        expandedClasses: "", // string, accepts multiple space-separated classes
        shouldToggleHeight: false, // should target element’s height be animated using max-height
        activeToggleText: "", // expanded state toggle button text
        shouldStartExpanded: false, // component starts expanded on init
        onReady: null // ready callback function
      },
      opts
    );

    // Check for custom expanded class(es)
    this.expandedClasses =
      this.el.getAttribute("data-expands-class") ||
      this.options.expandedClasses;

    if (this.expandedClasses.length) {
      // Check if active class string contains multiple classes
      if (this.expandedClasses.indexOf(" ") > -1) {
        // Convert to array and remove any empty string values
        // caused by having multiple spaces in a row.
        this.expandedClasses = this.expandedClasses
          .split(" ")
          .filter(n => n.length);
      } else {
        // We still need to convert a single active class to an array
        // so we can use the spread syntax later in classList.add()
        this.expandedClasses = [this.expandedClasses];
      }
    }

    // Check if height should be animated
    this.shouldToggleHeight =
      this.el.hasAttribute("data-expands-height") ||
      this.options.shouldToggleHeight;

    // Check if component should start expanded
    this.shouldStartExpanded =
      this.el.hasAttribute("data-expanded") || this.options.shouldStartExpanded;

    // Check for custom toggle button text to use when expanded
    this.hasActiveText = false;
    this.textEl = this.el.querySelector("[data-expands-text]");

    if (this.textEl) {
      this.defaultToggleText = this.textEl.textContent;
      this.activeToggleText =
        this.textEl.getAttribute("data-expands-text") ||
        this.options.activeToggleText;
      this.hasActiveText = !!this.activeToggleText.length;
    }

    this.init();
  }

  init() {
    // Store state to avoid calling resize handler after component has been destroyed
    this.hasInitialized = true;
    // Accessibility setup
    this.el.setAttribute("aria-haspopup", true);
    this.el.setAttribute("aria-expanded", this.shouldStartExpanded);
    // Omit “aria-controls” for now
    // See https://inclusive-components.design/menus-menu-buttons/#ariacontrols
    // this.el.setAttribute("aria-controls", this.targetId);
    this.targetEl.setAttribute("aria-hidden", !this.shouldStartExpanded);

    if (this.el.tagName.toLowerCase() === "a") {
      this.el.setAttribute("role", "button");
    }

    if (this.shouldToggleHeight) {
      this.heightToggleSetup();
    }

    // Click event listener on toggle button
    // Note: Callback needs to be assigned to a let so we can remove it since we’re using bind()
    // https://stackoverflow.com/a/22870717/673457
    this.clickHandler = this.toggle.bind(this);
    this.el.addEventListener("click", this.clickHandler);

    // Keyboard listeners on toggle button
    this.keydownHandler = this.keyboardEvents.bind(this);
    this.el.addEventListener("keydown", this.keydownHandler);

    // Check for onReady callback
    if (typeof this.options.onReady === "function") {
      this.options.onReady();
    }
  }

  destroy() {
    this.hasInitialized = false;

    // Remove event listeners
    this.el.removeEventListener("click", this.clickHandler);
    this.el.removeEventListener("keydown", this.keydownHandler);
    window.removeEventListener("resize", this.resizeHandler);

    // Remove aria attributes
    this.el.removeAttribute("aria-haspopup");
    this.el.removeAttribute("aria-expanded");
    this.targetEl.removeAttribute("aria-hidden");
    this.targetEl.style.removeProperty("max-height");

    if (this.el.tagName.toLowerCase() === "a") {
      this.el.removeAttribute("role");
    }

    // Reset toggle text
    if (this.hasActiveText) {
      this.textEl.textContent = this.defaultToggleText;
    }

    // Remove custom classes
    if (this.expandedClasses.length) {
      this.el.classList.remove(...this.expandedClasses);
      this.targetEl.classList.remove(...this.expandedClasses);
    }

    this.emitEvent("destroy");
  }

  keyboardEvents(event) {
    // Expand with down arrow
    if (event.keyCode == 40) {
      this.expand();
    } else if (event.keyCode == 38 || event.keyCode == 27) {
      // Close with up arrow or escape key
      this.collapse();
    }
  }

  heightToggleSetup() {
    this.targetParentEl = this.targetEl.parentNode;

    // Set max-height to the expanded height so we can animate it.
    window.requestAnimationFrame(this.updateExpandedHeight.bind(this));

    this.resizeHandler = debounce(event => {
      // Due to debounce() it’s possible for this to run after destroy() has been called.
      // To avoid this edge case, check “this.hasInitialized” first.
      if (this.hasInitialized) {
        window.requestAnimationFrame(this.updateExpandedHeight.bind(this));
      }
    }, 100).bind(this);

    // Update target element’s max-height on resize
    window.addEventListener("resize", this.resizeHandler);
  }

  // Set max-height of target element to its expanded height without triggering relayout.
  //
  // This technique works by creating an absolutely-positioned invisible clone of the target
  // element and calculating its height. This avoids any relayout that would otherwise occur
  // if the element was briefly expanded so we could measure it.
  //
  // Note: We’re using CSS to transition max-height instead jQuery’s slideToggle(),
  //       or another 3rd-party lib like Velocity.js, to avoid loading a large lib.
  updateExpandedHeight() {
    // Get width of original element so we can apply it to the clone
    let nodeWidth = Math.round(parseFloat(this.targetEl.offsetWidth));

    // Create clone of node
    let cloneEl = this.targetEl.cloneNode(true); // 'true' includes child nodes

    // Inline styles added to prevent reflow, ensure clone is same size as expanded element
    cloneEl.style.cssText = `max-height: none !important; position: absolute !important; right: 100% !important; visibility: hidden !important; width: ${nodeWidth}px !important; -webkit-transition: none !important; -moz-transition: none !important; transition: none !important`;

    // Update “aria-hidden” attribute
    cloneEl.setAttribute("aria-hidden", false);

    // Remove id just to be safe
    cloneEl.removeAttribute("id");

    // Remove “name” attributes to prevent resetting checkbox or radio elements
    let childElsWithId = cloneEl.querySelectorAll("[name]");

    // IE-friendly way of iterating over a NodeList
    Array.prototype.forEach.call(childElsWithId, el => {
      el.removeAttribute("name");
    });

    // Append clone to document, save as new let so we can remove it later
    let newEl = this.targetParentEl.insertBefore(cloneEl, this.targetEl);

    // Calculate height
    let expandedHeight = Math.round(parseFloat(newEl.offsetHeight));

    // Remove cloned node to clean up after ourselves
    this.targetParentEl.removeChild(newEl);

    // Apply inline max-height to collapsed element
    // Note: CSS is overriding this when aria-hidden="true"
    this.targetEl.style.maxHeight = expandedHeight + "px";
  }

  expand(event) {
    // Update toggle text
    if (this.hasActiveText) {
      if (!this.shouldStartExpanded) {
        this.textEl.textContent = this.activeToggleText;
      } else {
        this.textEl.textContent = this.defaultToggleText;

      }
    }

    // Add classes
    if (this.expandedClasses.length) {
      this.el.classList.add(...this.expandedClasses);
      this.targetEl.classList.add(...this.expandedClasses);
    }

    // Update aria attributes
    this.el.setAttribute("aria-expanded", true);
    this.targetEl.setAttribute("aria-hidden", false);

    // Emit event and include original event as an argument
    this.emitEvent("expand", event);
  }

  collapse(event) {
    // Update toggle text
    if (this.hasActiveText) {
      if (!this.shouldStartExpanded) {
        this.textEl.textContent = this.defaultToggleText;
      } else {
        this.textEl.textContent = this.activeToggleText;
      }
    }

    // Remove classes
    if (this.expandedClasses.length) {
      this.el.classList.remove(...this.expandedClasses);
      this.targetEl.classList.remove(...this.expandedClasses);
    }

    // Update aria attributes
    this.el.setAttribute("aria-expanded", false);
    this.targetEl.setAttribute("aria-hidden", true);

    // Emit event and include original event as an argument
    this.emitEvent("collapse", event);
  }

  toggle(event) {
    // Prevent default in case toggle element is a link instead of a button
    event.preventDefault();

    if (this.el.getAttribute("aria-expanded") === "true") {
      this.collapse(event);
    } else {
      this.expand(event);
    }
  }
}
