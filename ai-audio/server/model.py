import random

EMOTION_LABELS = ["happiness", "angry", "disgust", "fear", "neutral", "sadness", "surprise"]

def predict(features):
    emotions = random.sample(EMOTION_LABELS, 2)
    scores = [round(random.uniform(0.2, 1.0), 3) for _ in emotions]
    
    return dict(zip(emotions, scores))