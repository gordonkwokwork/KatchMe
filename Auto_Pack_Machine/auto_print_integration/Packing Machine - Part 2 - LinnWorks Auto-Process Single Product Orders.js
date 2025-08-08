// ==UserScript==
// @name         Packing Machine - Part 2 - LinnWorks Auto-Process Single Product Orders
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Processes exactly one order per scan with enhanced logging
// @author       You
// @match        https://www.linnworks.net/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let lastProcessedOrderId = null;
    let currentScanBarcode = null;
    let isProcessing = false;
    let scanProcessed = false;

    function getCurrentOrderId() {
        const selectedRow = document.querySelector('.ag-row-selected');
        if (!selectedRow) return null;
        const orderIdCell = selectedRow.querySelector('[col-id="NumOrderId"]');
        return orderIdCell ? orderIdCell.textContent.trim() : null;
    }

    function lockdownCheckbox(checkbox) {
        checkbox.disabled = true;
        checkbox.setAttribute('disabled', 'true');
        checkbox.style.pointerEvents = 'none';
        checkbox.style.opacity = '0.5';

        const row = checkbox.closest('.ag-row');
        if (row) {
            row.style.pointerEvents = 'none';
            row.style.opacity = '0.7';
            row.style.cursor = 'not-allowed';
        }
    }

    function clickProcessButton() {
        if (isProcessing || scanProcessed) return false;

        const currentOrderId = getCurrentOrderId();
        if (!currentOrderId) return false;

        const processButton = document.querySelector('.process-button.mat-primary');
        if (processButton && processButton.textContent.includes('Process selected')) {
            console.log('Processing order:', currentOrderId);
            isProcessing = true;
            lastProcessedOrderId = currentOrderId;
            scanProcessed = true;
            processButton.click();

            // Reset after processing complete
            setTimeout(() => {
                console.log('Processing complete');
                console.log('Current scan state - Barcode:', currentScanBarcode ? `"${currentScanBarcode}"` : 'null',
                            '| Processed:', scanProcessed);
                isProcessing = false;
            }, 3000);
            return true;
        }
        return false;
    }

    function processRows() {
        if (isProcessing || scanProcessed) {
            console.log('Skipping processing - isProcessing:', isProcessing, 'scanProcessed:', scanProcessed);
            return;
        }

        const rows = document.querySelectorAll('.ag-center-cols-container .ag-row');
        let targetRowFound = false;

        // Reset all rows first
        rows.forEach(row => {
            const checkbox = row.querySelector('.ag-checkbox-input');
            if (checkbox) {
                if (checkbox.checked) checkbox.click();
                checkbox.disabled = false;
                checkbox.removeAttribute('disabled');
                checkbox.style.pointerEvents = '';
                checkbox.style.opacity = '';

                const rowElement = checkbox.closest('.ag-row');
                if (rowElement) {
                    rowElement.style.pointerEvents = '';
                    rowElement.style.opacity = '';
                    rowElement.style.cursor = '';
                    rowElement.style.backgroundColor = '';
                }
            }
        });

        // Apply selection logic
        rows.forEach(row => {
            const numProductsCell = row.querySelector('[col-id="NumProducts"]');
            const checkbox = row.querySelector('.ag-checkbox-input');

            if (!numProductsCell || !checkbox) return;

            const productCount = numProductsCell.textContent.trim();

            if (productCount === '1' && !targetRowFound) {
                if (!checkbox.checked) {
                    checkbox.click();
                }
                targetRowFound = true;
                row.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
            } else {
                lockdownCheckbox(checkbox);
            }
        });

        if (targetRowFound) {
            console.log('Found 1-product order, preparing to process...');
            setTimeout(clickProcessButton, 1000);
        }
    }

    function setupBarcodeMonitoring() {
        const barcodeInput = document.querySelector('input[placeholder="Search by item barcode"]');
        if (!barcodeInput) {
            setTimeout(setupBarcodeMonitoring, 1000);
            return;
        }

        barcodeInput.addEventListener('change', function(e) {
            const newBarcode = e.target.value.trim();
            if (newBarcode) {
                console.log('New scan detected:', newBarcode,
                          '| Previous scan state - Barcode:', currentScanBarcode ? `"${currentScanBarcode}"` : 'null',
                          '| Processed:', scanProcessed);
                currentScanBarcode = newBarcode;
                scanProcessed = false;

                // Clear the input field
                setTimeout(() => {
                    e.target.value = '';
                }, 100);

                setTimeout(processRows, 1500);
            }
        });
    }

    // Prevent manual checkbox changes
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('ag-checkbox-input')) {
            const row = e.target.closest('.ag-row');
            if (row) {
                const numProducts = row.querySelector('[col-id="NumProducts"]')?.textContent.trim();
                if (numProducts !== '1') {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return false;
                }
            }
        }
    }, true);

    // Start monitoring
    setTimeout(setupBarcodeMonitoring, 2000);

    // Minimal fallback observer
    const observer = new MutationObserver(function() {
        if (!isProcessing && !scanProcessed) {
            setTimeout(processRows, 500);
        }
    });

    observer.observe(document.querySelector('.ag-center-cols-container') || document.body, {
        childList: true,
        subtree: true
    });
})();