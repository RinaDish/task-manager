# TASK — MANAGER

[https://dish-task-manager.herokuapp.com/](https://dish-task-manager.herokuapp.com/)


- [How It Works](#Howitworks)
  - [Running](#Running)
- [`API`](#API)

## How It Works

### Running

For running server:

```sh
$ npm start
```

For running in developer mode (with nodemon):

```sh
$ npm run dev
```

## API

`SignUp`
```
POST /users
```

`Login`
```
POST /users/login
```

`Logout`
```
POST /users/logout
```

`Close all sessions`
```
POST /users/logoutall
```

`View my profile`
```
GET /users/me
```

`View all users' profiles`
```
GET /users
```

`View somebody's profile`
```
GET /users/:id
```

`Update my profile`
```
PATCH /users/me
```

`Delete profile`
```
DELETE /users/me
```

`Upload avatar`
```
POST /users/me/avatar
```

`Delete avatar`
```
DELETE /users/me/avatar
```

`View user's avatar`
```
GET /users/:id/avatar
```