// ==UserScript==
// @name         Packing Machine - Part 1 - Uncheck Angular Material Checkbox Correctly
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Simulate user uncheck and disable mat-checkbox-1-input in Angular Material apps properly (like Linnworks UI)
// @author       You
// @match        https://www.linnworks.net/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // console.log('Tampermonkey: Watching for Angular checkbox');

    const checkboxId = 'mat-checkbox-1-input';

    const interval = setInterval(() => {
        const checkbox = document.getElementById(checkboxId);

        if (checkbox) {
            const matCheckbox = checkbox.closest('mat-checkbox');

            // Only if it's currently checked visually
            if (matCheckbox && matCheckbox.classList.contains('mat-checkbox-checked')) {
                // console.log('Tampermonkey: Simulating uncheck');

                // Simulate a real click to toggle it OFF via Angular binding
                checkbox.click();
            }

            // Disable it (optional)
            checkbox.disabled = true;
            checkbox.setAttribute('disabled', 'true');

            // Optionally prevent label interaction too
            const label = checkbox.closest('label');
            if (label) {
                label.style.pointerEvents = 'none';
            }

            clearInterval(interval);
            // console.log('Tampermonkey: Done ✅');
        } else {
            // console.log('Tampermonkey: Checkbox not found ⏳');
        }
    }, 300);
})();
