class InvalidAudioFormatError(Exception):
    def __init__(self, content_type: str):
        self.detail = f'{content_type} not allowed'

class InternalSenseVociceError(Exception):
    def __init__(self, detail: str):
        self.detail = detail