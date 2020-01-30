import ExpandToggle from "./expandable";

const toggles = document.querySelectorAll("[data-expands]");

toggles.forEach(el => new ExpandToggle(el));
