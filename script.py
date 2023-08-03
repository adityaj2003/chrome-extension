
import os
from pytube import YouTube
from moviepy.editor import *
import openai

def download_audio(url):
    yt = YouTube(url)
    audio_stream = yt.streams.filter(only_audio=True).first()
    output_path = os.path.join(os.getcwd(), 'audio.mp4')
    audio_stream.download(output_path)

    # Convert the audio to mp3 using moviepy (requires ffmpeg)
    audio_clip = AudioFileClip(get_first_file_name_in_directory(output_path))
    output_mp3_path = os.path.join(os.getcwd(), 'audio.mp3')
    audio_clip.write_audiofile(output_mp3_path)
    audio_clip.close()

    return output_mp3_path


def get_first_file_name_in_directory(directory_path):
    try:
        for file_name in os.listdir(directory_path):
            if file_name.lower().endswith(".mp4"):
                return os.path.join(directory_path, file_name)
    except Exception as e:
        raise Exception("Failed to get the first file name: " + str(e))


system_prompt = "You are a summary writer at an academic setting. Write the summary of the transcript of the following audio file which explains in detail the topic and information covered in it. I wanna skip out on all jokes and unncessary information. Write detailed summary and explanation on the core topics of the video." 

def generate_corrected_transcript(temperature, system_prompt, audio_file):
    response = openai.ChatCompletion.create(
        model="gpt-4",
        temperature=temperature,
        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": transcribe(audio_file, "")
            }
        ]
    )
    return response['choices'][0]['message']['content']


if __name__ == "__main__":
    youtube_url = "https://www.youtube.com/watch?v=h9xaHwBsRUw"
    audio_file = download_audio(youtube_url)
    summary_text = generate_corrected_transcript(0, system_prompt, "audio.mp3")
    print(summary_text)
