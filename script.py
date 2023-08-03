
import os
from pytube import YouTube
from moviepy.editor import *

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


if __name__ == "__main__":
    youtube_url = "https://www.youtube.com/watch?v=h9xaHwBsRUw"
    audio_file = download_audio(youtube_url)
    print("Audio downloaded:", audio_file)
