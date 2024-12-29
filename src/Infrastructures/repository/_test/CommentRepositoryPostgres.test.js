const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const CreateComment = require('../../../Domains/comments/entities/CreateComment');
const CreatedComment = require('../../../Domains/comments/entities/CreatedComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('verifyCommentAvailability function', () => {
    it('should throw NotFoundError when comment not available', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentAvailability('comment-5000', 'thread-3000')
      ).rejects.toThrowError(new NotFoundError('comment tidak dapat ditemukan di database'));
    });

    it('should throw NotFoundError when comment is deleted', async () => {
      // Arrange
      const userId = 'user-8080';
      const threadId = 'thread-3000';
      const commentId = 'comment-5000';

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.createThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.createComment({
        id: commentId,
        thread: threadId,
        owner: userId,
        isDelete: true,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentAvailability(commentId, threadId)
      ).rejects.toThrowError(new NotFoundError('data comment tidak valid'));
    });

    it('should throw NotFoundError when comment is not found in thread', async () => {
      // Arrange
      const userId = 'user-8080';
      const threadId = 'thread-3000';
      const commentId = 'comment-5000';

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.createThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.createComment({
        id: commentId,
        thread: threadId,
        owner: userId,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentAvailability('comment-5000', 'thread-700')
      ).rejects.toThrowError(
        new NotFoundError('comment dalam thread tidak dapat ditemukan di database')
      );
    });

    it('should not throw NotFoundError when comment available', async () => {
      // Arrange
      const userId = 'user-8080';
      const threadId = 'thread-3000';
      const commentId = 'comment-5000';

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.createThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.createComment({
        id: commentId,
        thread: threadId,
        owner: userId,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentAvailability(commentId, threadId)
      ).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw AuthorizationError when comment owner not authorized', async () => {
      // Arrange
      const userId = 'user-8080';
      const threadId = 'thread-3000';
      const commentId = 'comment-5000';

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.createThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.createComment({
        id: commentId,
        thread: threadId,
        owner: userId,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentOwner(commentId, 'user-700')
      ).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when comment owner authorized', async () => {
      // Arrange
      const userId = 'user-8080';
      const threadId = 'thread-3000';
      const commentId = 'comment-5000';

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.createThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.createComment({
        id: commentId,
        thread: threadId,
        owner: userId,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentOwner(commentId, userId)
      ).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('createComment function', () => {
    beforeEach(async () => {
      await UsersTableTestHelper.addUser({ id: 'user-8080' });
      await ThreadsTableTestHelper.createThread({
        id: 'thread-3000',
        owner: 'user-8080',
      });
    });

    it('should persist new comment', async () => {
      // Arrange
      const createComment = new CreateComment({ content: 'Just a few comment' });

      const fakeIdGenerator = () => '5000';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.createComment('user-8080', 'thread-3000', createComment);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentsById('comment-5000');
      expect(comments).toHaveLength(1);

      expect(comments[0].id).toBe('comment-5000');
      expect(comments[0].content).toBe('Just a few comment');
      expect(comments[0].owner).toBe('user-8080');
      expect(comments[0].thread).toBe('thread-3000');
      expect(comments[0].is_delete).toBe(false);
    });

    it('should return created comment correctly', async () => {
      // Arrange
      const createComment = new CreateComment({ content: 'Just a few comment' });

      const fakeIdGenerator = () => '5000';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const createdComment = await commentRepositoryPostgres.createComment(
        'user-8080',
        'thread-3000',
        createComment
      );

      // Assert
      expect(createdComment).toStrictEqual(
        new CreatedComment({
          id: 'comment-5000',
          content: 'Just a few comment',
          owner: 'user-8080',
        })
      );
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return thread comments correctly', async () => {
      // Arrange
      const userId = 'user-8080';
      const otherUserId = 'user-700';
      const threadId = 'thread-3000';

      await UsersTableTestHelper.addUser({ id: userId, username: 'joko' });
      await UsersTableTestHelper.addUser({ id: otherUserId, username: 'mulyadi' });
      await ThreadsTableTestHelper.createThread({ id: threadId, owner: userId });

      await CommentsTableTestHelper.createComment({
        id: 'comment-5001',
        content: 'Just a few new comments',
        date: '2024-12-25T12:59:18.608942',
        thread: threadId,
        owner: userId,
      });

      await CommentsTableTestHelper.createComment({
        id: 'comment-5000',
        content: 'Just a few old comments',
        date: '2024-12-24T12:59:18.608942',
        thread: threadId,
        owner: otherUserId,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId(threadId);

      // Assert
      expect(comments).toHaveLength(2);
      expect(comments[0].id).toBe('comment-5000');
      expect(comments[0].username).toBe('mulyadi');
      expect(comments[0].content).toBe('Just a few old comments');
      expect(comments[0].date).toBeTruthy();
      expect(comments[0].is_delete).toBe(false);

      expect(comments[1].id).toBe('comment-5001');
      expect(comments[1].username).toBe('joko');
      expect(comments[1].content).toBe('Just a few new comments');
      expect(comments[1].date).toBeTruthy();
      expect(comments[1].is_delete).toBe(false);
    });
  });

  describe('deleteCommentById function', () => {
    it('should soft delete comment and update is_delete', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-8080' });
      await ThreadsTableTestHelper.createThread({
        id: 'thread-3000',
        owner: 'user-8080',
      });

      const commentId = 'comment-5000';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await CommentsTableTestHelper.createComment({
        id: commentId,
        thread: 'thread-3000',
        owner: 'user-8080',
      });

      // Action
      await commentRepositoryPostgres.deleteCommentById(commentId);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentsById(commentId);
      expect(comments).toHaveLength(1);
      expect(comments[0].is_delete).toBeTruthy();
    });
  });
});
