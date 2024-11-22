document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const voiceSelect = document.getElementById('voiceSelect');
    const speedRange = document.getElementById('speedRange');
    const speedValue = document.getElementById('speedValue');
    const saveButton = document.getElementById('saveButton');
    const resetButton = document.getElementById('resetButton');
    const messageDiv = document.getElementById('message');

    // Default settings
    const defaultSettings = {
        speed: '1',
        voiceName: 'Google UK English Female' // Default to female UK English voice
    };

    /**
     * Populates the voice selection dropdown with available voices.
     */
    function populateVoiceList() {
        const voices = speechSynthesis.getVoices();
        voiceSelect.innerHTML = ''; // Clear existing options

        voices.forEach(function(voice) {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})`;
            voiceSelect.appendChild(option);
        });

        // Set default voice if available
        const defaultVoice = voices.find(voice => voice.name === defaultSettings.voiceName);
        if (defaultVoice) {
            voiceSelect.value = defaultSettings.voiceName;
        } else {
            voiceSelect.selectedIndex = 0;
        }
    }

    /**
     * Loads saved settings from storage and updates the UI.
     */
    function loadSettings() {
        browser.storage.local.get(['selectedVoice', 'speechSpeed']).then((result) => {
            if (result.selectedVoice) {
                voiceSelect.value = result.selectedVoice;
            }
            if (result.speechSpeed) {
                speedRange.value = result.speechSpeed;
                speedValue.textContent = `${parseFloat(result.speechSpeed).toFixed(2)}x`;
            } else {
                resetToDefaultUI();
            }
        });
    }

    /**
     * Resets the UI elements to default settings.
     */
    function resetToDefaultUI() {
        speedRange.value = defaultSettings.speed;
        speedValue.textContent = `${parseFloat(defaultSettings.speed).toFixed(2)}x`;
        const voices = speechSynthesis.getVoices();
        const defaultVoice = voices.find(voice => voice.name === defaultSettings.voiceName);
        if (defaultVoice) {
            voiceSelect.value = defaultSettings.voiceName;
        } else {
            voiceSelect.selectedIndex = 0;
        }
    }

    /**
     * Displays a message to the user.
     * @param {string} text - The message text.
     * @param {string} type - The type of message ('success' or 'error').
     */
    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = type + ' show';

        // Hide the message after 1 second
        setTimeout(() => {
            messageDiv.classList.remove('show');
        }, 1000);
    }

    /**
     * Initializes the options page.
     */
    function init() {
        populateVoiceList();

        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = populateVoiceList;
        }

        loadSettings();

        // Event Listeners
        speedRange.addEventListener('input', function() {
            speedValue.textContent = `${parseFloat(speedRange.value).toFixed(2)}x`;
        });

        saveButton.addEventListener('click', function() {
            const selectedVoice = voiceSelect.value;
            const speechSpeed = speedRange.value;

            browser.storage.local.set({
                selectedVoice: selectedVoice,
                speechSpeed: speechSpeed
            }).then(() => {
                showMessage('Settings saved successfully.', 'success');
            }).catch(() => {
                showMessage('Failed to save settings.', 'error');
            });
        });

        resetButton.addEventListener('click', function() {
            resetToDefaultUI();

            // Save default settings
            browser.storage.local.set({
                selectedVoice: voiceSelect.value,
                speechSpeed: speedRange.value
            }).then(() => {
                showMessage('Settings have been reset to default.', 'success');
            }).catch(() => {
                showMessage('Failed to reset settings.', 'error');
            });
        });

        // Prevent default dragging behavior on the options page
        ['dragstart', 'drag', 'dragenter', 'dragover', 'dragleave', 'dragend', 'drop'].forEach(eventType => {
            document.addEventListener(eventType, function(event) {
                event.preventDefault();
            }, false);
        });
    }

    init();
});
