# Spark-서버 Porting_manual
## 1. 서버 사양 및 네트워크 구성
    - 서버 인스턴스 정보
        - 인스턴스 타입 : Master - t3.medium, worker1, 2 - r5.large
        - 운영체제 및 버전 : Ubuntu 22.04
    - 접속 정보
        - Public IP : 43.201.84.232
    - 방화벽 설정
        - Port Numbers
            22     : SSH 접속용
            4040   : Spark 애플리케이션 UI
            7077   : Spark Master 포트
            7078   : Spark Driver 포트
            7079   : Spark BlockManager 포트
            8080   : Spark Master UI
            8081   : Spark Worker UI
            8088   : YARN ResourceManager UI 또는 
            8020   : HDFS NameNode RPC 포트
            9864   : HDFS DataNode block 서빙 포트
            9866   : HDFS DataNode 상태 확인용 HTTP 포트
            9867   : HDFS DataNode HTTPS 포트
            33837  : Spark 동적 포트
            33838  : Spark JAR 전송용 포트

## 2. Spark 설치 및 설정

### (1) 설치 과정
```bash
# Java 설치
sudo apt update && sudo apt install openjdk-11-jdk -y

# Spark 다운로드 및 압축 해제
wget https://downloads.apache.org/spark/spark-<버전>/spark-<버전>-bin-hadoop3.tgz
tar -xvzf spark-<버전>-bin-hadoop3.tgz
sudo mv spark-<버전>-bin-hadoop3 /opt/spark

# 환경변수 설정
vim ~/.bashrc
# 추가
export SPARK_HOME=/opt/spark
export PATH=$SPARK_HOME/bin:$PATH

source ~/.bashrc
```

### (2) spark-env.sh 설정
```bash
cd $SPARK_HOME/conf
cp spark-env.sh.template spark-env.sh
vim spark-env.sh

# 내용 추가 예시
SPARK_MASTER_HOST=172.31.xx.xx
SPARK_LOCAL_IP=172.31.xx.xx
SPARK_DRIVER_PORT=7078
SPARK_BLOCKMANAGER_PORT=7079
SPARK_WORKER_CORES=4
SPARK_WORKER_MEMORY=4g

```

### (3) slaves 또는 workers 설정
```bash
cd $SPARK_HOME/conf
cp workers.template workers
vim workers

# 예시
172.31.11.111
172.31.11.112

```

## 3. Spark Master 실행
```bash
# Master 실행
$SPARK_HOME/sbin/start-master.sh

# Worker 실행 (master에서 하거나, worker 서버에서 아래와 같이 실행)
$SPARK_HOME/sbin/start-worker.sh spark://<master-ip>:7077

```

## 4. Spark 테스트 및 검증
```bash
# WordCount 등 예제 실행
$SPARK_HOME/bin/spark-submit \
  --master spark://<master-ip>:7077 \
  --class org.apache.spark.examples.SparkPi \
  $SPARK_HOME/examples/jars/spark-examples_2.12-*.jar 100

```

## 5. 프로젝트 맞춤 설정
- S3 접근을 위한 Hadoop 설정(core-site.xml)
- spark-defaults.conf에 기본 설정 추가
```bash
# 예제 submit script
spark-submit \
  --master spark://<master-ip>:7077 \
  --conf spark.driver.port=7078 \
  --conf spark.driver.bindAddress=0.0.0.0 \
  --conf spark.blockManager.port=7079 \
  --conf spark.hadoop.fs.s3a.access.key=xxx \
  --conf spark.hadoop.fs.s3a.secret.key=xxx \
  ./transform_reports.py

```

## 6. main.py - FastAPI 기반 API 서버 생성
- 역할 :
    - 외부 요청을 받아 Spark 작업을 백그라운드로 실행하는 API 제공
    - 사용자 ID와 날짜 범위를 기반으로 transform_reports.py 실행
    - 이미 처리된 결과가 S3에 있으면 Spark작업을 건너뜀

```python
from fastapi import FastAPI
from fastapi.responses import JSONResponse
import subprocess
import boto3
import json
import os
import time

app = FastAPI()

S3_BUCKET = "*****"
REGION = "ap-northeast-2"

s3 = boto3.client("s3", region_name=REGION)

@app.get("/results/{user_id}/{start}/{end}")
def get_or_run_spark_job(user_id: str, start: str, end: str):
    prefix = f"processed-data/{user_id}/{start}_{end}/"
    response = s3.list_objects_v2(Bucket=S3_BUCKET, Prefix=prefix)
    already_processed = any(obj["Key"].endswith(".json") and obj["Size"] > 0 for obj in response.get("Contents", []))

    if not already_processed:
        script_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "transform_reports.py"))
        spark_submit_cmd = [
            "spark-submit",
            "--master", "spark://***.***.***.***:7077",
            "--deploy-mode", "client",
            "--conf", "spark.driver.bindAddress=0.0.0.0",
            "--conf", "spark.driver.host=***.***.***.***",
            "--conf", "spark.driver.port=33838",
            "--conf", "spark.blockManager.port=33837",
            "--conf", "spark.network.timeout=300s",
            "--conf", "spark.executor.instances=2",
            "--conf", "spark.local.dir=/tmp/spark-temp",
            "--conf", "spark.hadoop.fs.s3a.buffer.dir=/tmp/spark-s3a",
            "--conf", f"spark.hadoop.fs.s3a.access.key={os.environ['AWS_ACCESS_KEY_ID']}",
            "--conf", f"spark.hadoop.fs.s3a.secret.key={os.environ['AWS_SECRET_ACCESS_KEY']}",
            "--conf", "spark.hadoop.fs.s3a.path.style.access=true",
            "--conf", "spark.hadoop.fs.s3a.impl=org.apache.hadoop.fs.s3a.S3AFileSystem",
            "--conf", "spark.hadoop.fs.s3a.endpoint=s3.ap-northeast-2.amazonaws.com",
            "--executor-cores", "1",
            "--executor-memory", "1g",
            "--packages", "org.apache.hadoop:hadoop-aws:3.3.4,com.amazonaws:aws-java-sdk-bundle:1.12.367",
            script_path,
            "--user", user_id,
            "--start", start,
            "--end", end
        ]
        try:
            result = subprocess.run(spark_submit_cmd, check=True, capture_output=True, text=True)
            time.sleep(2)
        except subprocess.CalledProcessError as e:
            return JSONResponse(content={"error": "Spark job failed"}, status_code=500)

    try:
        response = s3.list_objects_v2(Bucket=S3_BUCKET, Prefix=prefix)
        if "Contents" not in response or len(response["Contents"]) == 0:
            return JSONResponse(content={"message": "No results found."}, status_code=404)

        results = []
        for obj in response["Contents"]:
            key = obj["Key"]
            if key.endswith(".json"):
                file_obj = s3.get_object(Bucket=S3_BUCKET, Key=key)
                body = file_obj["Body"].read().decode("utf-8").strip()
                if not body:
                    continue
                for line in body.split("\n"):
                    if line.strip():
                        results.append(json.loads(line))

        return JSONResponse(content={"count": len(results), "results": results})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

```

## 7. transform_reports.py - Spark 데이터 처리 로직
- 역할 :
    - 지정한 사용자와 기간에 해당하는 상담 기록을 S3에서 일겅옴
    - 감정 분석, 키워드 추출 등 데이터 전처리 수행
    - 결과를 파티션별로 나눠서 다시 S3에 저장 (processed-data/ 경로)

- 주요 기능:
    - SparkSession 초기화
    - 사용자 ID, 날짜 범위 기반 S3 데이터 필터링
    - UDF로 감정 태그/키워드 처리
    - 저장 형식: Parquet 파티셔닝 기중: user_id, date

```python
#!/usr/bin/env python3
import argparse
from pyspark.sql import SparkSession
from pyspark.sql.functions import explode, col, to_timestamp, from_json, lead
from pyspark.sql.types import StructType, StructField, StringType, ArrayType
from pyspark.sql.window import Window

def main():
    parser = argparse.ArgumentParser(description="Transform reports from S3 JSONs")
    parser.add_argument("--user", required=True, help="유저 ID (숫자 또는 문자열)")
    parser.add_argument("--start", required=True, help="시작일 (YYYY-MM-DD)")
    parser.add_argument("--end", required=True, help="종료일 (YYYY-MM-DD)")
    args = parser.parse_args()

    spark = SparkSession.builder.appName("TransformReports").getOrCreate()

    # S3 설정
    hconf = spark.sparkContext._jsc.hadoopConfiguration()
    hconf.set("fs.s3a.endpoint", "s3.ap-northeast-2.amazonaws.com")
    hconf.set("fs.s3a.fast.upload", "true")

    # JSON 스키마 정의
    schema = StructType([
        StructField("userId", StringType(), True),
        StructField("counsId", StringType(), True),
        StructField("messageList", ArrayType(
            StructType([
                StructField("timestamp", StringType(), True),
                StructField("sender", StringType(), True),
                StructField("message", StringType(), True),
                StructField("emotion", StringType(), True)
            ])
        ), True)
    ])

    origin_path = "s3a://damdam-counseling-bucket/origin_texts/*.json"
    df_text = spark.read.text(origin_path)

    df_raw = df_text.select(from_json(col("value"), schema).alias("data")).select("data.*")

    df_msgs = (
        df_raw
        .withColumn("msg", explode(col("messageList")))
        .withColumn("timestamp", to_timestamp(col("msg.timestamp")))
        .select(
            col("counsId"),
            col("userId"),
            col("timestamp"),
            col("msg.sender").alias("sender"),
            col("msg.message").alias("message"),
            col("msg.emotion").alias("emotion")
        )
        .filter(
            (col("userId") == args.user) &
            (col("timestamp").between(args.start, args.end))
        )
    )

    window_spec = Window.orderBy("timestamp")

    df_with_next = df_msgs.withColumn("next_sender", lead("sender").over(window_spec)) \
                          .withColumn("next_emotion", lead("emotion").over(window_spec))

    df_user_with_emotion = df_with_next.filter(col("sender") == "USER").select(
        "counsId", "userId", "timestamp", "message",
        col("next_emotion").alias("emotion")
    )

    df_out = df_user_with_emotion.repartition(4)

    output_path = f"s3a://damdam-counseling-bucket/processed-data/{args.user}/{args.start}_{args.end}"
    df_out.write.mode("overwrite").json(output_path)
    spark.stop()

if __name__ == "__main__":
    main()

```

## 8. FastAPI 서버 백그라운드로 실행하기
```bash
nohup uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload > uvicorn.log 2>&1 &
```