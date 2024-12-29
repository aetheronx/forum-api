const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('threads comments endpoint', () => {
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

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and created comment', async () => {
      // Arrange
      const requestPayload = { content: 'Just a few comments' };

      const { accessToken, userId } = await serverTestHelper.getAccessTokenAndUserId();

      await ThreadsTableTestHelper.createThread({ ...dummyThread, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${dummyThread.id}/comments`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeTruthy();
      expect(responseJson.data.addedComment.content).toEqual(requestPayload.content);
    });

    it('should response 400 if payload not contain needed property', async () => {
      // Arrange
      const { accessToken, userId } = await serverTestHelper.getAccessTokenAndUserId();

      await ThreadsTableTestHelper.createThread({ ...dummyThread, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${dummyThread.id}/comments`,
        payload: {},
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada'
      );
    });

    it('should response 400 if payload wrong data type', async () => {
      // Arrange
      const requestPayload = { content: 700 };

      const { accessToken, userId } = await serverTestHelper.getAccessTokenAndUserId();

      await ThreadsTableTestHelper.createThread({ ...dummyThread, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${dummyThread.id}/comments`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat comment baru karena tipe data tidak sesuai'
      );
    });

    it('should response 404 if thread is not exist', async () => {
      // Arrange
      const requestPayload = { content: 'Just a few comments' };

      const { accessToken } = await serverTestHelper.getAccessTokenAndUserId();

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-700/comments',
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
      const requestPayload = { content: 'Just a few comments' };

      const { userId } = await serverTestHelper.getAccessTokenAndUserId();

      await ThreadsTableTestHelper.createThread({ ...dummyThread, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${dummyThread.id}/comments`,
        payload: requestPayload,
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    const dummyComment = {
      id: 'comment-5000',
      content: 'Just a few comments',
      date: new Date().toISOString(),
      thread: 'thread-3000',
      isDelete: false,
    };

    it('should response 200', async () => {
      // Arrange
      const { accessToken, userId } = await serverTestHelper.getAccessTokenAndUserId();

      await ThreadsTableTestHelper.createThread({ ...dummyThread, owner: userId });

      await CommentsTableTestHelper.createComment({ ...dummyComment, owner: userId });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 404 if comment is not exist', async () => {
      // Arrange
      const { accessToken, userId } = await serverTestHelper.getAccessTokenAndUserId();

      await ThreadsTableTestHelper.createThread({ ...dummyThread, owner: userId });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${dummyThread.id}/comments/comment-700`,
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

      await server.inject({
        method: 'DELETE',
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('data comment tidak valid');
    });

    it('should response 404 if comment is not exist in thread', async () => {
      // Arrange
      const { accessToken, userId } = await serverTestHelper.getAccessTokenAndUserId();

      await ThreadsTableTestHelper.createThread({ ...dummyThread, owner: userId });

      await CommentsTableTestHelper.createComment({ ...dummyComment, owner: userId });

      await ThreadsTableTestHelper.createThread({
        ...dummyThread,
        id: 'other-thread',
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/other-thread/comments/${dummyComment.id}`,
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

    it('should response 404 if thread is not exist', async () => {
      // Arrange
      const { accessToken } = await serverTestHelper.getAccessTokenAndUserId();

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-700/comments/comment-5000',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak dapat ditemukan di database');
    });

    it('should response 403 if comment owner is not authorized', async () => {
      // Arrange
      const { userId } = await serverTestHelper.getAccessTokenAndUserId();
      const { accessToken: otherAccessToken } = await serverTestHelper.getAccessTokenAndUserId({
        username: 'made',
        password: 'wrongpassword',
        fullname: 'Made Kucit',
      });

      await ThreadsTableTestHelper.createThread({ ...dummyThread, owner: userId });

      await CommentsTableTestHelper.createComment({ ...dummyComment, owner: userId });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}`,
        headers: { Authorization: `Bearer ${otherAccessToken}` },
      });

      // Assert
      expect(response.statusCode).toEqual(403);
    });

    it('should response 401 if headers not contain access token', async () => {
      // Arrange
      const { userId } = await serverTestHelper.getAccessTokenAndUserId();

      await ThreadsTableTestHelper.createThread({ ...dummyThread, owner: userId });

      await CommentsTableTestHelper.createComment({ ...dummyComment, owner: userId });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}`,
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });
  });
});
