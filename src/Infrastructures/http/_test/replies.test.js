const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const pool = require('../../database/postgres/pool');

describe('replies endpoint', () => {
  let server;
  let serverTestHelper;

  beforeAll(async () => {
    server = await createServer(container);
    serverTestHelper = new ServerTestHelper(server);
  });

  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  const dummyThread = {
    id: 'thread-3000',
    title: 'My Thread Title',
    body: 'My thread body',
    date: new Date().toISOString(),
  };

  const dummyComment = {
    id: 'comment-5000',
    content: 'Just a few comments',
    date: new Date().toISOString(),
    thread: dummyThread.id,
    isDelete: false,
  };

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and created reply', async () => {
      // Arrange
      const requestPayload = { content: 'Just a dummy reply' };

      // user login
      const { accessToken, userId } = await serverTestHelper.getAccessTokenAndUserId();

      await ThreadsTableTestHelper.createThread({ ...dummyThread, owner: userId });

      await CommentsTableTestHelper.createComment({ ...dummyComment, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/replies`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeTruthy();
      expect(responseJson.data.addedReply.content).toEqual(requestPayload.content);
    });

    it('should response 400 if payload not contain needed property', async () => {
      // Arrange
      const { accessToken, userId } = await serverTestHelper.getAccessTokenAndUserId();

      await ThreadsTableTestHelper.createThread({ ...dummyThread, owner: userId });

      await CommentsTableTestHelper.createComment({ ...dummyComment, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/replies`,
        payload: {},
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat reply baru karena properti yang dibutuhkan tidak ada'
      );
    });

    it('should response 400 if payload wrong data type', async () => {
      // Arrange
      const requestPayload = { content: 2024 };

      // user login
      const { accessToken, userId } = await serverTestHelper.getAccessTokenAndUserId();

      await ThreadsTableTestHelper.createThread({ ...dummyThread, owner: userId });

      await CommentsTableTestHelper.createComment({ ...dummyComment, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/replies`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat reply baru karena tipe data tidak sesuai'
      );
    });

    it('should response 404 if replied comment is not exist in thread', async () => {
      // Arrange
      const requestPayload = { content: 'Just a dummy reply' };

      const { accessToken, userId } = await serverTestHelper.getAccessTokenAndUserId();

      await ThreadsTableTestHelper.createThread({ ...dummyThread, owner: userId });

      await CommentsTableTestHelper.createComment({ ...dummyComment, owner: userId });

      await ThreadsTableTestHelper.createThread({
        ...dummyThread,
        id: 'thread-700',
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/thread-700/comments/${dummyComment.id}/replies`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'comment dalam thread tidak dapat ditemukan di database'
      );
    });

    it('should response 404 if comment is not exist', async () => {
      // Arrange
      const requestPayload = { content: 'Just a dummy reply' };

      const { accessToken, userId } = await serverTestHelper.getAccessTokenAndUserId();

      await ThreadsTableTestHelper.createThread({ ...dummyThread, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${dummyThread.id}/comments/comment-700/replies`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak dapat ditemukan di database');
    });

    it('should response 404 if comment is not valid or deleted', async () => {
      // Arrange
      const requestPayload = { content: 'Just a dummy reply' };

      const { accessToken, userId } = await serverTestHelper.getAccessTokenAndUserId();

      await ThreadsTableTestHelper.createThread({ ...dummyThread, owner: userId });

      await CommentsTableTestHelper.createComment({ ...dummyComment, owner: userId });

      await server.inject({
        method: 'DELETE',
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/replies`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('data comment tidak valid');
    });

    it('should response 404 if thread is not exist', async () => {
      // Arrange
      const requestPayload = { content: 'Just a dummy reply' };

      const { accessToken } = await serverTestHelper.getAccessTokenAndUserId();

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-700/comments/comment-700/replies',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak dapat ditemukan di database');
    });

    it('should response 401 if headers not contain access token', async () => {
      // Arrange
      const requestPayload = { content: 'Just a dummy reply' };

      const { userId } = await serverTestHelper.getAccessTokenAndUserId();

      await ThreadsTableTestHelper.createThread({ ...dummyThread, owner: userId });

      await CommentsTableTestHelper.createComment({ ...dummyComment, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/replies`,
        payload: requestPayload,
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    const dummyReply = {
      id: 'reply-80',
      content: 'Just a dummy new reply',
      date: new Date().toISOString(),
      comment: dummyComment.id,
      isDelete: false,
    };

    it('should response 200', async () => {
      // Arrange
      const { accessToken, userId } = await serverTestHelper.getAccessTokenAndUserId();

      await ThreadsTableTestHelper.createThread({ ...dummyThread, owner: userId });

      await CommentsTableTestHelper.createComment({ ...dummyComment, owner: userId });

      await RepliesTableTestHelper.createReply({ ...dummyReply, owner: userId });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/replies/${dummyReply.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 404 if reply is not exist', async () => {
      // Arrange
      const { accessToken, userId } = await serverTestHelper.getAccessTokenAndUserId();

      await ThreadsTableTestHelper.createThread({ ...dummyThread, owner: userId });

      await CommentsTableTestHelper.createComment({ ...dummyComment, owner: userId });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/replies/reply-700`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('reply tidak dapat ditemukan di database');
    });

    it('should response 404 if reply is not valid or deleted', async () => {
      // Arrange
      const { accessToken, userId } = await serverTestHelper.getAccessTokenAndUserId();

      await ThreadsTableTestHelper.createThread({ ...dummyThread, owner: userId });

      await CommentsTableTestHelper.createComment({ ...dummyComment, owner: userId });

      await RepliesTableTestHelper.createReply({ ...dummyReply, owner: userId });

      await server.inject({
        method: 'DELETE',
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/replies/${dummyReply.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/replies/${dummyReply.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('data reply tidak valid');
    });

    it('should response 404 if comment is not exist', async () => {
      // Arrange
      const { accessToken, userId } = await serverTestHelper.getAccessTokenAndUserId();

      await ThreadsTableTestHelper.createThread({ ...dummyThread, owner: userId });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${dummyThread.id}/comments/comment-700/replies/reply-700`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak dapat ditemukan di database');
    });

    it('should response 404 if comment is not valid or deleted', async () => {
      // Arrange
      const { accessToken, userId } = await serverTestHelper.getAccessTokenAndUserId();

      await ThreadsTableTestHelper.createThread({ ...dummyThread, owner: userId });

      await CommentsTableTestHelper.createComment({ ...dummyComment, owner: userId });

      await RepliesTableTestHelper.createReply({ ...dummyReply, owner: userId });

      await server.inject({
        method: 'DELETE',
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/replies/${dummyReply.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('data comment tidak valid');
    });

    it('should response 404 if thread is not exist', async () => {
      // Arrange
      const { accessToken } = await serverTestHelper.getAccessTokenAndUserId();

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-700/comments/comment-700/replies/reply-700',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak dapat ditemukan di database');
    });

    it('should response 404 if replied comment is not exist in thread', async () => {
      // Arrange
      const { accessToken, userId } = await serverTestHelper.getAccessTokenAndUserId();

      await ThreadsTableTestHelper.createThread({ ...dummyThread, owner: userId });

      await CommentsTableTestHelper.createComment({ ...dummyComment, owner: userId });

      await RepliesTableTestHelper.createReply({ ...dummyReply, owner: userId });

      await ThreadsTableTestHelper.createThread({
        ...dummyThread,
        id: 'thread-3001',
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/thread-3001/comments/${dummyComment.id}/replies/${dummyReply.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'comment dalam thread tidak dapat ditemukan di database'
      );
    });

    it('should response 404 if reply is not exist in comment', async () => {
      // Arrange
      const { accessToken, userId } = await serverTestHelper.getAccessTokenAndUserId();

      await ThreadsTableTestHelper.createThread({ ...dummyThread, owner: userId });

      await CommentsTableTestHelper.createComment({ ...dummyComment, owner: userId });

      await RepliesTableTestHelper.createReply({ ...dummyReply, owner: userId });

      await CommentsTableTestHelper.createComment({
        ...dummyComment,
        id: 'comment-3000',
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${dummyThread.id}/comments/comment-3000/replies/${dummyReply.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('reply dalam comment tidak dapat ditemukan di database');
    });

    it('should response 403 if reply owner is not authorized', async () => {
      // Arrange
      const { userId } = await serverTestHelper.getAccessTokenAndUserId();
      const { accessToken: otherAccessToken } = await serverTestHelper.getAccessTokenAndUserId({
        username: 'jokok',
        password: 'wropassword',
        fullname: 'Jokok Kancil',
      });

      await ThreadsTableTestHelper.createThread({ ...dummyThread, owner: userId });

      await CommentsTableTestHelper.createComment({ ...dummyComment, owner: userId });

      await RepliesTableTestHelper.createReply({ ...dummyReply, owner: userId });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/replies/${dummyReply.id}`,
        headers: { Authorization: `Bearer ${otherAccessToken}` }, // using different access token
      });

      // Assert
      expect(response.statusCode).toEqual(403);
    });

    it('should response 401 if headers not contain access token', async () => {
      // Arrange
      const { userId } = await serverTestHelper.getAccessTokenAndUserId();

      await ThreadsTableTestHelper.createThread({ ...dummyThread, owner: userId });

      await CommentsTableTestHelper.createComment({ ...dummyComment, owner: userId });

      await RepliesTableTestHelper.createReply({ ...dummyReply, owner: userId });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/replies/${dummyReply.id}`,
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });
  });
});
