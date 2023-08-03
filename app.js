const { spawn } = require('child_process');
const speech = require('@google-cloud/speech');
const fs = require('fs');
const { promises: fsPromises } = require('fs');

const axios = require('axios');

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
generateTextDataFromYouTube(youtubeUrl)
  .then(textData => {
    console.log('Text Data:', textData);
  })
  .catch(error => {
    console.error('Error:', error.message);
  });
