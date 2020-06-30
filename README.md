# Simple Live Video Broadcaster
menggunakan socket.io,express js,webrtc,node js dan database postgresql

memerlukan
 - node js
 - database postgresql

buat table user dengan struktur
```
CREATE TABLE "public"."tb_users" (
    "id" int4 NOT NULL DEFAULT nextval('tb_users_id_seq'::regclass),
    "username" varchar(30),
    "password" varchar(30),
    PRIMARY KEY ("id")
);
```

 1. clone/download repo ini
 2. jalankan perintah `npm install`
 3. copy file `.env.example` dan renam jadi `.env`
 4. isi bagian databasenya seperti `DB_HOST,DB_PORT,DB_USERNAME,DB_PASSWORD,DB_NAME`
 5. daftar [https://pusher.com/](https://pusher.com/) untuk mengisi `PUSHER_APP_ID,PUSHER_APP_KEY,PUSHER_APP_SECRET,PUSHER_APP_CLUSTER` **(optional untuk fitur chat yang masih WIP)**
 6. jalankan perintah `npm start` lalu buka [http://localhost:4000/](http://localhost:4000/) **(karena local dengan http pastikan browser sudah di setting agar mengijinkan akses kamera untuk web yang tidak secure/non https)**

menggunakan STUN server [https://gist.github.com/mondain/b0ec1cf5f60ae726202e](https://gist.github.com/mondain/b0ec1cf5f60ae726202e) bisa di ganti di file `watch.js` dan `broadcast.js` pada bagian `iceServers`


@bagusindrayana