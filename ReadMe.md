# Forum API

## Users & Authentication

- **User Registration**
  `POST /users`

- **User Login**
  `POST /authentications`

- **Refresh Access Token**
  `PUT /authentications`

- **User Logout**
  `DELETE /authentications`

## Threads

- **Create a New Thread**
  `POST /threads`

- **View Thread Details**
  `GET /threads/{threadId}`

## Thread Comments

- **Add a Comment to a Thread**
  `POST /threads/{threadId}/comments`

- **Delete a Comment from a Thread**
  `DELETE /threads/{threadId}/comments/{commentId}`

## Thread Comment Replies

- **Add a Reply to a Comment**
  `POST /threads/{threadId}/comments/{commentId}/replies`

- **Delete a Reply from a Comment**
  `DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}`

  ## Thread Comment Like

- **Add and Remove a Like to a Comment**
  `PUT /threads/{threadId}/comments/{commentId}/likes`
