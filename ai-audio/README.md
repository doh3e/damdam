# Speech Emotion Recognition

## Settings

```bash
python -m venv venv
```
```bash
# Windows
venv\Scripts\activate
# Linux / macOS
source venv/bin/activate
```
```bash
pip install -r requirements.txt
```

## Run Fast API
```bash
cd server
```
To run server:
```bash
uvicorn main:app --reload
```
default port is `8000`.

To run server with another port:
```bash
uvicorn main:app --reload --port [YOUR_PORT]
# uvicorn main:app --reload --port 8081
```

## Swagger
```
http://localhost:8000/docs
```