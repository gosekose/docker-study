## 1장

- 도커
  -  레지스트리: 우리가 만든 이미지를 저장하는 곳
  -  이미지: 다양한 종속성과 패키지, 애플리케이션이 묶여있는 파일
  -  컨테이너: 이미지 내 파일들을 기반으로, 지정된 명령어를 실행한느 프로세스
  -  도커
    -  사용자가 요청한 명령어를 HTTP로 요청받아, 이미지를 만들고(build), 실행(run)해서 프로세스를 만들며, 레지스트리에 이미지를 저장(push)하고 공유할 수 있도록 만들어주는 도구이다

```
  nginx
  docker run --rm -p 8080:80 nginx
  // nginx 컨테이너 내부 80 포트 실행, 8080포트 접근하면 80포트로 포워드, host 8080 사용, 이름 nginx
  docker ps
  docker run -f [CONTAINER ID]

```

```

// 도커 볼륨 생성
  docker volume create pg  

  // memory, cpu 제한, 영구저장볼륨, -e: 환경변수 -> postgres password 설정
  docker run --name pg --rm \
  --memory="512m" --cpus="0.5" \
  -v pg:/var/lib/postgresql/data \
  -e POSTGRES_PASSWORD=rex postgres

  docker exec -it pg bash // bash shell을 실행

  psql -U postgres // bash에서 postgres 접근

  docker rm -f 컨테이너아이디
  docker volume rm pg
  docker rmi -f pg

```

```
docker run --rm --name httpd -p 8080:80 \
-v .:/usr/local/apache2/htdocs/:ro \
-d httpd:2.4

// 바인드 마운트
// pc에 연결된 현재경로(.)를 /usr/~/htdocs/에 연결
// :ro = Read-Only (컨테이너 내부에서는 수정 불가능 해야 함)

```

