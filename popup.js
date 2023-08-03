document.addEventListener('DOMContentLoaded', () => {
    // Find the Generate button by its ID
    const generateButton = document.getElementById('generateButton');
  
    // Add a click event listener to the button
    generateButton.addEventListener('click', () => {
      // Get the current active tab URL
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        const youtubeUrl = currentTab.url;
  
        // Send the YouTube URL to the backend
        fetch('http://localhost:3000/get-text-from-youtube', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ url: youtubeUrl })
        })
          .then((response) => response.json())
          .then((data) => {
            // Handle the response from the backend (data.textData)
            console.log(data.textData);
          })
          .catch((error) => {
            console.error('Error:', error);
          });
      });
    });
  });