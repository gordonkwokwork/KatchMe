// ==UserScript==
// @name         TikTok RMA Tracker - Employee Name Dropdown and Data Logger
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Adds employee name dropdown and logs confirmations to Google Sheets with improved navigation handling
// @author       Your Name
// @match        https://seller-uk.tiktok.com/*
// @match        https://seller.eu.tiktokshopglobalselling.com/*
// @grant        GM_xmlhttpRequest
// @connect      docs.google.com
// @connect      script.google.com
// @run-at       document-start
// ==/UserScript==

console.log("🎯 TikTok RMA Script attempting to load on:", window.location.href);

(function() {
    'use strict';

    // Configuration
    const SHEET_ID = 'PLACE GOOGLE SHEET ID';
    const EMPLOYEE_SHEET_NAME = 'employee_name';
    const LOG_SHEET_NAME = 'rma';
    const EMPLOYEE_RANGE = 'A1:A1000';
    const SCRIPT_URL = 'PLACE GOOGLE APP SCRIPT URL';

    // Store reference to the clicked respond button
    let clickedRespondButton = null;
    let isScriptInitialized = false;

    // Function to check if we're on the return order page
    function isReturnOrderPage() {
        return window.location.href.includes('/order/return') ||
               window.location.pathname.includes('/order/return');
    }

    // Function to initialize the script
    function initializeScript() {
        if (isScriptInitialized) {
            console.log('🔄 Script already initialized, skipping...');
            return;
        }

        if (!isReturnOrderPage()) {
            console.log('📍 Not on return order page, waiting...');
            return;
        }

        console.log('🚀 Initializing TikTok RMA Script...');
        isScriptInitialized = true;

        // Add click event listener
        setupEventListeners();

        console.log('✅ TikTok RMA Script initialized successfully!');
    }

    // Function to setup event listeners
    function setupEventListeners() {
        // Remove existing listeners to prevent duplicates
        document.removeEventListener('click', handleClick);

        // Add the click event listener
        document.addEventListener('click', handleClick);
        console.log('🎯 Event listeners set up');
    }

    // Main click handler function
    function handleClick(event) {
        const respondButton = event.target.closest('[data-tid="m4b_button"]');
        if (respondButton) {
            const row = respondButton.closest('tr');

            // Store reference if this is a table row button (not form submit button)
            if (row && !respondButton.closest('form')) {
                clickedRespondButton = respondButton;
                console.log('🎯 Stored reference to clicked respond button');

                // Wait for form to appear
                const waitForForm = setInterval(function() {
                    const form = document.querySelector('[data-tid="m4b_form"]');
                    if (form && !form.querySelector('#employeeName')) {
                        clearInterval(waitForForm);
                        addEmployeeDropdown(form);
                    }
                }, 500);
            }

            // Handle form submit respond button (with data-log_click_for="confirm")
            if (respondButton.closest('form') && respondButton.dataset.log_click_for === 'confirm') {
                handleRespondSubmit();
            }
        }
    }

    // Function to monitor URL changes (for SPA navigation)
    function monitorUrlChanges() {
        let currentUrl = window.location.href;

        const checkUrlChange = () => {
            if (window.location.href !== currentUrl) {
                console.log('🔄 URL changed from', currentUrl, 'to', window.location.href);
                currentUrl = window.location.href;

                // Reset initialization flag when URL changes
                isScriptInitialized = false;

                // Wait a bit for the page to load, then try to initialize
                setTimeout(() => {
                    initializeScript();
                }, 1000);
            }
        };

        // Check for URL changes every 500ms
        setInterval(checkUrlChange, 500);
    }

    // Function to wait for DOM to be ready
    function waitForDom() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(initializeScript, 1000);
            });
        } else {
            setTimeout(initializeScript, 1000);
        }
    }

    // Override history methods to catch programmatic navigation
    function interceptNavigation() {
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function() {
            originalPushState.apply(history, arguments);
            console.log('🔄 pushState detected');
            setTimeout(() => {
                isScriptInitialized = false;
                initializeScript();
            }, 1000);
        };

        history.replaceState = function() {
            originalReplaceState.apply(history, arguments);
            console.log('🔄 replaceState detected');
            setTimeout(() => {
                isScriptInitialized = false;
                initializeScript();
            }, 1000);
        };

        // Listen for popstate events (back/forward buttons)
        window.addEventListener('popstate', () => {
            console.log('🔄 popstate detected');
            setTimeout(() => {
                isScriptInitialized = false;
                initializeScript();
            }, 1000);
        });
    }

    function formatTimestampUK() {
        const now = new Date();
        const ukTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/London"}));

        const day = String(ukTime.getDate()).padStart(2, '0');
        const month = String(ukTime.getMonth() + 1).padStart(2, '0');
        const year = ukTime.getFullYear();
        const hours = String(ukTime.getHours()).padStart(2, '0');
        const minutes = String(ukTime.getMinutes()).padStart(2, '0');
        const seconds = String(ukTime.getSeconds()).padStart(2, '0');

        const date = `${day}/${month}/${year}`;
        const time = `${hours}:${minutes}:${seconds}`;

        return { date, time, timestamp: `${date} ${time}` };
    }

    function addEmployeeDropdown(form) {
        const dropdownContainer = document.createElement('div');
        dropdownContainer.className = 'theme-arco-row-align-start theme-arco-row-justify-start theme-arco-form-item theme-m4b-form-item theme-arco-form-layout-vertical';
        dropdownContainer.style.marginBottom = '16px';
        dropdownContainer.setAttribute('data-tid', 'm4b_form_item');

        const labelDiv = document.createElement('div');
        labelDiv.className = 'theme-arco-form-label-item';

        const label = document.createElement('label');
        label.className = 'theme-arco-form-label-symbol-before theme-arco-form-label-item-no-subTitle';
        label.textContent = 'Select a name';
        label.htmlFor = 'employeeName';
        labelDiv.appendChild(label);

        const wrapperDiv = document.createElement('div');
        wrapperDiv.className = 'theme-arco-form-item-wrapper';

        const controlWrapper = document.createElement('div');
        controlWrapper.className = 'theme-arco-form-item-control-wrapper';
        controlWrapper.setAttribute('data-tid', 'm4b_form_item_control');

        const controlDiv = document.createElement('div');
        controlDiv.className = 'theme-arco-form-item-control';
        controlDiv.id = 'employeeName';

        const childrenDiv = document.createElement('div');
        childrenDiv.className = 'theme-arco-form-item-control-children';

        const select = document.createElement('select');
        select.className = 'theme-arco-select theme-arco-select-size-default theme-m4b-select theme-m4b-select-size-default';
        select.style.width = '100%';
        select.id = 'employeeNameSelect';

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- Select an employee --';
        defaultOption.selected = true;
        defaultOption.disabled = true;
        select.appendChild(defaultOption);

        // Fetch and populate employee names
        fetchEmployeeNames()
            .then(names => {
                names.forEach(name => {
                    const option = document.createElement('option');
                    option.value = name;
                    option.textContent = name;
                    select.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error fetching employee names:', error);
                const errorOption = document.createElement('option');
                errorOption.value = 'error';
                errorOption.textContent = 'Error loading names';
                select.appendChild(errorOption);
            });

        // Build DOM structure
        childrenDiv.appendChild(select);
        controlDiv.appendChild(childrenDiv);
        controlWrapper.appendChild(controlDiv);
        wrapperDiv.appendChild(controlWrapper);
        dropdownContainer.appendChild(labelDiv);
        dropdownContainer.appendChild(wrapperDiv);

        // Insert into form
        const formItems = form.querySelectorAll('[data-tid="m4b_form_item"]');
        if (formItems.length > 0) {
            form.insertBefore(dropdownContainer, formItems[formItems.length - 1]);
        } else {
            form.appendChild(dropdownContainer);
        }
    }

    // Simplified order ID finder - combines all methods into one clean function
    function findOrderIds() {
        console.log('🔍 Searching for Order ID and Return ID...');

        if (!clickedRespondButton) {
            console.log('❌ No stored button reference');
            return { orderId: 'UNKNOWN_ORDER', returnId: 'UNKNOWN_RETURN' };
        }

        const contentRow = clickedRespondButton.closest('tr');
        if (!contentRow) {
            console.log('❌ No content row found');
            return { orderId: 'UNKNOWN_ORDER', returnId: 'UNKNOWN_RETURN' };
        }

        // Helper function to extract order IDs from any data attribute containing JSON
        function extractOrderIdsFromElement(element) {
            if (!element) return null;

            // Check multiple possible data attribute names
            const possibleAttributes = ['data-log-json', 'data-log_json', 'data-json', 'data-order'];

            for (const attr of possibleAttributes) {
                const jsonData = element.getAttribute(attr);
                if (jsonData) {
                    console.log(`   📋 Found ${attr}:`, jsonData);
                    try {
                        const logData = JSON.parse(jsonData);
                        console.log('   📋 Parsed JSON data:', logData);
                        const orderId = logData.main_order_id || logData.order_id || logData.id || null;
                        const returnId = logData.reverse_main_order_id || null;

                        if (orderId || returnId) {
                            return { orderId, returnId };
                        }
                    } catch (e) {
                        console.log(`   ❌ Error parsing ${attr}:`, e);
                    }
                }
            }

            // Also check all data-* attributes for JSON-like content
            for (const attr of element.attributes) {
                if (attr.name.startsWith('data-') && attr.value.includes('{')) {
                    console.log(`   🔍 Checking ${attr.name}:`, attr.value.substring(0, 100) + '...');
                    try {
                        const logData = JSON.parse(attr.value);
                        const orderId = logData.main_order_id || logData.order_id || logData.id || null;
                        const returnId = logData.reverse_main_order_id || null;

                        if (orderId || returnId) {
                            console.log(`   ✅ Found data in ${attr.name}:`, { orderId, returnId });
                            return { orderId, returnId };
                        }
                    } catch (e) {
                        // Silent fail for non-JSON data attributes
                    }
                }
            }

            return null;
        }

        // Helper function to extract order ID from text content (fallback for orderId only)
        function extractOrderIdFromText(text) {
            const orderPatterns = [
                /Order ID[:\s]*(\d{18})/i,
                /Order ID[:\s]*([A-Z0-9]{15,})/i,
                /\b(\d{18})\b/,
                /\b(\d{15,})\b/
            ];

            for (const pattern of orderPatterns) {
                const match = text.match(pattern);
                if (match && match[1]) {
                    return match[1];
                }
            }
            return null;
        }

        // 1. Check content row itself
        console.log('   🔍 Checking content row for JSON data...');
        let result = extractOrderIdsFromElement(contentRow);
        if (result && result.orderId) {
            console.log('✅ Found Order ID and Return ID from content row:', result);
            return {
                orderId: result.orderId,
                returnId: result.returnId || 'UNKNOWN_RETURN'
            };
        }

        // 2. Search ALL nearby rows more extensively (both directions)
        const allRows = Array.from(document.querySelectorAll('tbody tr'));
        const contentRowIndex = allRows.indexOf(contentRow);
        console.log(`   🔍 Content row is at index ${contentRowIndex} of ${allRows.length} total rows`);

        // Search backwards more extensively (up to 10 rows)
        console.log('   🔍 Searching backwards for JSON data...');
        for (let i = Math.max(0, contentRowIndex - 10); i < contentRowIndex; i++) {
            const row = allRows[i];
            console.log(`   🔍 Checking row ${i} (${contentRowIndex - i} steps back)`);

            // Skip divider rows
            if (row.classList.contains('TBodyRowDivider-N2zICU')) {
                console.log('   ⏭️ Skipping divider row');
                continue;
            }

            result = extractOrderIdsFromElement(row);
            if (result && result.orderId) {
                console.log('✅ Found Order ID and Return ID from backward search:', result);
                return {
                    orderId: result.orderId,
                    returnId: result.returnId || 'UNKNOWN_RETURN'
                };
            }
        }

        // Search forwards more extensively
        console.log('   🔍 Searching forwards for JSON data...');
        for (let i = contentRowIndex + 1; i < Math.min(allRows.length, contentRowIndex + 6); i++) {
            const row = allRows[i];
            console.log(`   🔍 Checking row ${i} (${i - contentRowIndex} steps forward)`);

            result = extractOrderIdsFromElement(row);
            if (result && result.orderId) {
                console.log('✅ Found Order ID and Return ID from forward search:', result);
                return {
                    orderId: result.orderId,
                    returnId: result.returnId || 'UNKNOWN_RETURN'
                };
            }
        }

        // 3. Search ALL rows in the entire table with any JSON-like data attributes
        console.log('   🔍 Last resort: searching ALL rows for JSON data...');
        const allTableRows = document.querySelectorAll('tr');
        console.log(`   📋 Checking all ${allTableRows.length} rows in table for JSON data`);

        let foundAnyJson = false;
        for (let i = 0; i < allTableRows.length; i++) {
            const row = allTableRows[i];

            // Check if this row has any data attributes with JSON content
            let hasJsonData = false;
            for (const attr of row.attributes) {
                if (attr.name.startsWith('data-') && (attr.value.includes('{') || attr.value.includes('main_order_id'))) {
                    hasJsonData = true;
                    foundAnyJson = true;
                    break;
                }
            }

            if (hasJsonData) {
                console.log(`   📋 Found row ${i} with JSON data`);
                result = extractOrderIdsFromElement(row);
                if (result && result.orderId && result.returnId) {
                    console.log(`✅ Found BOTH Order ID and Return ID from table row ${i}:`, result);
                    return {
                        orderId: result.orderId,
                        returnId: result.returnId
                    };
                } else if (result && result.orderId) {
                    console.log(`⚠️ Found Order ID (no Return ID) from table row ${i}:`, result);
                    // Store as backup but continue searching
                    if (!window.backupResult) {
                        window.backupResult = result;
                    }
                }
            }
        }

        console.log(`   📊 Summary: Found ${foundAnyJson ? 'some' : 'NO'} rows with JSON data`);

        // 4. Use backup result if we found one
        if (window.backupResult && window.backupResult.orderId) {
            console.log('⚠️ Using backup result with Order ID only:', window.backupResult);
            const backupResult = window.backupResult;
            window.backupResult = null; // Clear backup
            return {
                orderId: backupResult.orderId,
                returnId: 'UNKNOWN_RETURN'
            };
        }

        // 5. Final fallback: text search for Order ID only
        console.log('   🔍 Final fallback: searching header row text...');
        for (let i = Math.max(0, contentRowIndex - 5); i < contentRowIndex; i++) {
            const row = allRows[i];

            if (row.classList.contains('TBodyRowHeader-DSWkmI') || row.textContent.includes('Order ID')) {
                const orderId = extractOrderIdFromText(row.textContent);
                if (orderId) {
                    console.log('⚠️ Found Order ID from header row text (Return ID unknown):', orderId);
                    return {
                        orderId: orderId,
                        returnId: 'UNKNOWN_RETURN'
                    };
                }
            }
        }

        console.log('❌ Order ID and Return ID not found after checking all methods');
        return { orderId: 'UNKNOWN_ORDER', returnId: 'UNKNOWN_RETURN' };
    }

    function getOrderData() {
        // Get selected employee name
        const employeeSelect = document.getElementById('employeeNameSelect');
        if (!employeeSelect || employeeSelect.value === '') {
            console.log('❌ No employee selected');
            return null;
        }

        const employeeName = employeeSelect.value;
        const orderIds = findOrderIds();
        const timeData = formatTimestampUK();

        const data = {
            orderId: orderIds.orderId,
            returnId: orderIds.returnId,
            employeeName: employeeName,
            date: timeData.date,
            time: timeData.time,
            timestamp: timeData.timestamp
        };

        console.log('📋 Final data prepared:', data);
        return data;
    }

    function handleRespondSubmit() {
        console.log('🔵 Respond submit button clicked');
        const data = getOrderData();
        if (!data) {
            alert('Please select an employee name before submitting');
            return;
        }

        sendDataToSheet(data)
            .then(() => console.log('✅ Data sent via Respond submit button'))
            .catch(error => {
                console.error('❌ Error sending data via Respond submit button:', error);
            });
    }

    function fetchEmployeeNames() {
        return new Promise((resolve, reject) => {
            const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${EMPLOYEE_SHEET_NAME}&range=${EMPLOYEE_RANGE}`;

            GM_xmlhttpRequest({
                method: 'GET',
                url: url,
                onload: function(response) {
                    try {
                        const lines = response.responseText.split('\n');
                        const names = lines
                            .map(line => line.replace(/^"|"$/g, '').trim())
                            .filter(name => name);
                        console.log('✅ Employee names fetched:', names);
                        resolve(names);
                    } catch (e) {
                        console.error('❌ Error parsing employee names:', e);
                        reject(e);
                    }
                },
                onerror: function(error) {
                    console.error('❌ Error fetching employee names:', error);
                    reject(error);
                }
            });
        });
    }

    function sendDataToSheet(data) {
        return new Promise((resolve, reject) => {
            console.log('📤 Sending data to Google Sheets:', data);

            GM_xmlhttpRequest({
                method: 'POST',
                url: SCRIPT_URL,
                data: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                },
                onload: function(response) {
                    console.log('📨 Response status:', response.status);
                    console.log('📨 Response text:', response.responseText);

                    if (response.status >= 200 && response.status < 300) {
                        try {
                            const result = JSON.parse(response.responseText);
                            if (result.success) {
                                console.log('✅ Successfully sent to Google Sheets');
                                resolve(response);
                            } else {
                                // Handle duplicate or other business logic errors
                                if (result.error && result.error.includes('Duplicate entry')) {
                                    console.log('⚠️ Duplicate entry detected:', result.returnId);
                                    alert(`This return has already been processed!\nReturn ID: ${result.returnId}`);
                                } else {
                                    console.error('❌ Business logic error:', result.error);
                                }
                                reject(new Error(result.error));
                            }
                        } catch (parseError) {
                            console.log('✅ Successfully sent to Google Sheets (legacy response)');
                            resolve(response);
                        }
                    } else {
                        console.error('❌ Server responded with error status:', response.status);
                        reject(new Error(`Server responded with status ${response.status}: ${response.responseText}`));
                    }
                },
                onerror: function(error) {
                    console.error('❌ Network error:', error);
                    reject(error);
                }
            });
        });
    }

    // Start the initialization process
    console.log('🚀 Starting TikTok RMA Script...');

    // Set up navigation monitoring
    interceptNavigation();
    monitorUrlChanges();

    // Initial load
    waitForDom();

})();