const { spawn } = require('child_process');
const speech = require('@google-cloud/speech');
const fs = require('fs');
const { Client } = require('@notionhq/client'); 
const { promises: fsPromises } = require('fs');
const { get } = require('express/lib/response');
console.log(process.env.NOTION_KEY);
const notion = new Client({ auth: process.env["NOTION_KEY"] })

const pythonExecutable = '/Library/Frameworks/Python.framework/Versions/3.11/bin/python3';

function generateTextDataFromYouTube(url) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn(pythonExecutable, ['script.py', url]);

    let audioFilePath = 'audio.mp3';
    let error = '';

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', async (code) => {
      if (code === 0) {
        try {
          const textData = await convertAudioToText(audioFilePath);
          resolve(textData);
        } catch (error) {
          reject(error);
        }
      } else {
        reject(new Error(`Failed to download audio: ${error}`));
      }
    });
  });
}





async function getAllPages() {
  try {
    let continuePagination = true;
    let startCursor = undefined;
    
    while (continuePagination) {
      // Use the "search" endpoint to find all pages
      const response = await notion.search({
        query: "",
        filter: {
          value: "page",
          property: "object"
        },
        page_size: 100,
        start_cursor: startCursor,
      });
      
      // Log each page's name and ID
      response.results.forEach(page => {
        if (page.object === "page") {
          console.log(`Page Name: ${page.properties.title.title[0].plain_text}`);
          console.log(`Page ID: ${page.id}`);
        }
      });

      // Continue pagination if next cursor is present
      if (response.next_cursor) {
        startCursor = response.next_cursor;
      } else {
        continuePagination = false;
      }
    }
  } catch (error) {
    console.error("Error retrieving pages:", error);
  }
}



async function addBlockToNotion(notion) {
  (async () => {
    const blockId = '6a75e7a827f844e2b6fc01ae776ae7e8';
    const response = await notion.blocks.children.append({
      block_id: blockId,
      children: [
        {
          "heading_2": {
            "rich_text": [
              {
                "text": {
                  "content": "Lacinato kale in Tucson"
                }
              }
            ]
          }
        },
        {
          "paragraph": {
            "rich_text": [
              {
                "text": {
                  "content": "Lacinato kale is a variety of kale with a long tradition in Italian cuisine, especially that of Tuscany. It is also known as Tuscan kale, Italian kale, dinosaur kale, kale, flat back kale, palm tree kale, or black Tuscan palm.",
                  "link": {
                    "url": "https://en.wikipedia.org/wiki/Lacinato_kale"
                  }
                }
              }
            ]
          }
        }
      ],
    });
    console.log(response);
  })();
}

async function convertAudioToText(audioFilePath) {
  return new Promise((resolve, reject) => {
    try {
      console.log('Converting audio to text');
      // Initialize the SpeechClient
      const client = new speech.SpeechClient();

      // Create a recognize stream
      const recognizeStream = client.streamingRecognize({
        config: {
          encoding: 'MP3', // Use MP3 encoding
          sampleRateHertz: 44100,
          languageCode: 'en-US',
        },
        interimResults: true, // Get interim results during streaming
      });

      recognizeStream.on('data', (data) => {
        if (data.results[0] && data.results[0].alternatives[0]) {
          console.log('Streaming Response:', data.results[0].alternatives[0].transcript);
          resolve(data.results[0].alternatives[0].transcript);
        }
      });

      recognizeStream.on('error', (error) => {
        reject(new Error(`Failed to convert audio to text: ${error.message}`));
      });

      fs.createReadStream(audioFilePath).pipe(recognizeStream);
    } catch (error) {
      reject(new Error(`Failed to convert audio to text: ${error.message}`));
    }
  });
}

const youtubeUrl = 'https://www.youtube.com/watch?v=Rt07rT5kNWU';
getAllPages();
addBlockToNotion(notion);
// generateTextDataFromYouTube(youtubeUrl)
//   .then(textData => {
//     console.log('Text Data:', textData);
//   })
//   .catch(error => {
//     console.error('Error:', error.message);
//   });
