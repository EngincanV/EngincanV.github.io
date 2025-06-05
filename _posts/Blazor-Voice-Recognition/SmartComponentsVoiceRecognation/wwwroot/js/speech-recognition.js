window.speechRecognizer = {
    recognition: null,
    startRecognition: function (dotNetObject) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Speech recognition not supported in this browser."); //for Safari
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = function (event) {
            const text = event.results[0][0].transcript;
            dotNetObject.invokeMethodAsync('OnSpeechRecognized', text);
        };

        recognition.onerror = function (event) {
            console.error("Speech recognition error:", event.error);
        };

        recognition.start();
        window.speechRecognizer.recognition = recognition;
    },
    stopRecognition: function () {
        if (window.speechRecognizer.recognition) {
            window.speechRecognizer.recognition.stop();
        }
    },
    resetRecognition: function () {
        window.speechRecognizer.recognition = null;
    }
};
