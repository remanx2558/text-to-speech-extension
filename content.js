// content.js

(function() {
    console.log("Text-to-Speech Extension: Content script loaded.");

    let speakButton = null;
    let currentSelectedText = ""; // Variable to store selected text

    // Base64-encoded SVG icon for the speak button (24x24 pixels)
    const speakIconSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000">
      <path d="M12 14c1.654 0 3-1.346 3-3V5c0-1.654-1.346-3-3-3S9 3.346 9 5v6c0 1.654 1.346 3 3 3zm5-3c0 2.757-2.243 5-5 5s-5-2.243-5-5H7c0 3.866 3.134 7 7 7s7-3.134 7-7h-2zm-5 9c-4.418 0-8-3.582-8-8h2c0 3.313 2.687 6 6 6s6-2.687 6-6h2c0 4.418-3.582 8-8 8z"/>
    </svg>
    `;

    // Function to create the speak button
    function createSpeakButton(x, y) {
        console.log(`Creating speak button at (${x}, ${y}).`);

        // Remove existing button if any
        removeSpeakButton();

        // Create the button element
        speakButton = document.createElement('div');
        speakButton.id = 'tts-speak-button';
        speakButton.style.position = 'absolute';
        speakButton.style.left = `${x}px`;
        speakButton.style.top = `${y}px`;
        speakButton.style.width = '24px';
        speakButton.style.height = '24px';
        speakButton.style.cursor = 'pointer';
        speakButton.style.zIndex = '10000';
        speakButton.style.boxShadow = '0 0 5px rgba(0,0,0,0.3)';
        speakButton.style.borderRadius = '4px';
        speakButton.style.backgroundColor = 'white';
        speakButton.style.opacity = '0.8';
        speakButton.style.transition = 'opacity 0.2s';
        speakButton.style.display = 'flex';
        speakButton.style.alignItems = 'center';
        speakButton.style.justifyContent = 'center';

        // Embed the SVG
        speakButton.innerHTML = speakIconSVG;

        // Hover effect
        speakButton.addEventListener('mouseover', () => {
            speakButton.style.opacity = '1';
        });
        speakButton.addEventListener('mouseout', () => {
            speakButton.style.opacity = '0.8';
        });

        // Add click event to the button
        speakButton.addEventListener('click', function(e) {
            console.log("Speak button clicked.");
            e.stopPropagation();
            e.preventDefault();
            readSelectedText();
            removeSpeakButton();
        });

        // Append the button to the body
        document.body.appendChild(speakButton);
        console.log("Speak button appended to the document.");
    }

    // Function to remove the speak button
    function removeSpeakButton() {
        if (speakButton) {
            console.log("Removing speak button.");
            speakButton.remove();
            speakButton = null;
        }
    }

    // Function to read the selected text
    function readSelectedText() {
        console.log(`Attempting to read aloud: "${currentSelectedText}"`);

        if (currentSelectedText.length > 0 && 'speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(currentSelectedText);
            speechSynthesis.speak(utterance);
            console.log("Speech synthesis initiated.");
        } else if (!('speechSynthesis' in window)) {
            alert('Text-to-Speech is not supported in your browser.');
            console.log("speechSynthesis not supported.");
        } else {
            console.log("No text selected to read.");
        }
    }

    // Event listener for text selection
    document.addEventListener('mouseup', function(event) {
        console.log("Mouseup event detected.");

        setTimeout(() => {
            const selection = window.getSelection();
            const selectedText = selection.toString().trim();
            console.log(`Selected Text: "${selectedText}"`);

            if (selectedText.length > 0) {
                currentSelectedText = selectedText; // Store the selected text
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                let x = rect.right + window.scrollX + 10; // 10px to the right of selection
                let y = rect.top + window.scrollY - 30; // 30px above the selection

                // Adjust positions to keep the button within the viewport
                if (x + 24 > window.scrollX + window.innerWidth) {
                    x = window.scrollX + window.innerWidth - 34; // 10px padding from the edge
                }
                if (y < window.scrollY + 10) {
                    y = window.scrollY + 10; // 10px padding from the top
                }

                createSpeakButton(x, y);
            } else {
                currentSelectedText = ""; // Clear the stored text
                removeSpeakButton();
            }
        }, 0);
    });

    // Remove speak button when clicking elsewhere
    document.addEventListener('mousedown', function(event) {
        if (speakButton && !speakButton.contains(event.target)) {
            console.log("Click detected outside the speak button. Removing it.");
            removeSpeakButton();
        }
    });
})();
