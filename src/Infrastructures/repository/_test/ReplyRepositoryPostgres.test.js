const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const CreateReply = require('../../../Domains/replies/entities/CreateReply');
const CreatedReply = require('../../../Domains/replies/entities/CreatedReply');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('verifyReplyAvailability function', () => {
    it('should throw NotFoundError when reply not available', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyAvailability('reply-80')
      ).rejects.toThrowError(new NotFoundError('reply tidak dapat ditemukan di database'));
    });

    it('should throw NotFoundError when reply is deleted', async () => {
      // Arrange
      const userId = 'user-8080';
      const threadId = 'thread-3000';
      const commentId = 'comment-5000';
      const replyId = 'reply-80';

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.createThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.createComment({
        id: commentId,
        thread: threadId,
        owner: userId,
      });
      await RepliesTableTestHelper.createReply({
        id: replyId,
        comment: commentId,
        owner: userId,
        isDelete: true,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyAvailability('reply-80', commentId)
      ).rejects.toThrowError(new NotFoundError('data reply tidak valid'));
    });

    it('should throw NotFoundError when reply is npt found in comment', async () => {
      // Arrange
      const userId = 'user-8080';
      const threadId = 'thread-3000';
      const commentId = 'comment-5000';
      const replyId = 'reply-80';

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.createThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.createComment({
        id: commentId,
        thread: threadId,
        owner: userId,
      });
      await RepliesTableTestHelper.createReply({
        id: replyId,
        comment: commentId,
        owner: userId,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyAvailability('reply-80', 'comment-700')
      ).rejects.toThrowError(
        new NotFoundError('reply dalam comment tidak dapat ditemukan di database')
      );
    });

    it('should not throw NotFoundError when reply available', async () => {
      // Arrange
      const userId = 'user-8080';
      const threadId = 'thread-300';
      const commentId = 'comment-5000';
      const replyId = 'reply-80';

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.createThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.createComment({
        id: commentId,
        thread: threadId,
        owner: userId,
      });
      await RepliesTableTestHelper.createReply({
        id: replyId,
        comment: commentId,
        owner: userId,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyAvailability(replyId, commentId)
      ).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw AuthorizationError when reply owner not authorized', async () => {
      // Arrange
      const userId = 'user-8080';
      const threadId = 'thread-3000';
      const commentId = 'comment-5000';
      const replyId = 'reply-80';

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.createThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.createComment({
        id: commentId,
        thread: threadId,
        owner: userId,
      });
      await RepliesTableTestHelper.createReply({
        id: replyId,
        comment: commentId,
        owner: userId,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyOwner(replyId, 'user-700')
      ).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when reply owner authorized', async () => {
      // Arrange
      const userId = 'user-8080';
      const threadId = 'thread-3000';
      const commentId = 'comment-5000';
      const replyId = 'reply-80';

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.createThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.createComment({
        id: commentId,
        thread: threadId,
        owner: userId,
      });
      await RepliesTableTestHelper.createReply({
        id: replyId,
        comment: commentId,
        owner: userId,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyOwner(replyId, userId)
      ).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('createReply function', () => {
    beforeEach(async () => {
      await UsersTableTestHelper.addUser({ id: 'user-8080' });
      await ThreadsTableTestHelper.createThread({
        id: 'thread-3000',
        owner: 'user-8080',
      });
      await CommentsTableTestHelper.createComment({
        id: 'comment-5000',
        thread: 'thread-3000',
        owner: 'user-8080',
      });
    });

    it('should persist create reply', async () => {
      // Arrange
      const createReply = new CreateReply({ content: 'A reply' });

      const fakeIdGenerator = () => '80';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await replyRepositoryPostgres.createReply('user-8080', 'comment-5000', createReply);

      // Assert
      const replys = await RepliesTableTestHelper.findRepliesById('reply-80');
      expect(replys).toHaveLength(1);
    });

    it('should return added reply correctly', async () => {
      // Arrange
      const createReply = new CreateReply({ content: 'Just a dummy reply' });

      const fakeIdGenerator = () => '80';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const createdReply = await replyRepositoryPostgres.createReply(
        'user-8080',
        'comment-5000',
        createReply
      );

      // Assert
      expect(createdReply).toStrictEqual(
        new CreatedReply({
          id: 'reply-80',
          content: 'Just a dummy reply',
          owner: 'user-8080',
        })
      );
    });
  });

  describe('getRepliesByCommentId function', () => {
    it('should return comment replies correctly', async () => {
      // Arrange
      const userId = 'user-8080';
      const otherUserId = 'user-700';
      const threadId = 'thread-3000';
      const commentId = 'comment-5000';

      await UsersTableTestHelper.addUser({ id: userId, username: 'joko' });
      await UsersTableTestHelper.addUser({ id: otherUserId, username: 'ketut' });
      await ThreadsTableTestHelper.createThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.createComment({
        id: commentId,
        content: 'Just a few comments',
        date: '2024-12-25T12:59:18.608942',
        thread: threadId,
        owner: userId,
      });

      await RepliesTableTestHelper.createReply({
        id: 'reply-81',
        content: 'Just a dummy new reply',
        date: '2024-12-26T12:59:18.608942',
        comment: commentId,
        owner: userId,
      });
      await RepliesTableTestHelper.createReply({
        id: 'reply-80',
        content: 'Just a dummy old reply',
        date: '2024-12-25T12:59:18.608942',
        comment: commentId,
        owner: otherUserId,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByCommentId(commentId);

      // Assert
      expect(replies).toHaveLength(2);
      expect(replies[0].id).toBe('reply-80');
      expect(replies[1].id).toBe('reply-81');
      expect(replies[0].username).toBe('ketut');
      expect(replies[1].username).toBe('joko');
      expect(replies[0].content).toBe('Just a dummy old reply');
      expect(replies[1].content).toBe('Just a dummy new reply');
      expect(replies[0].date).toBeTruthy();
      expect(replies[1].date).toBeTruthy();
    });
  });

  describe('getRepliesByThreadId function', () => {
    it('should return comment replies correctly', async () => {
      // Arrange
      const userId = 'user-8080';
      const otherUserId = 'user-700';
      const threadId = 'thread-3000';
      const commentId = 'comment-5000';

      await UsersTableTestHelper.addUser({ id: userId, username: 'joko' });
      await UsersTableTestHelper.addUser({ id: otherUserId, username: 'ketut' });
      await ThreadsTableTestHelper.createThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.createComment({
        id: commentId,
        content: 'Just a few comments',
        date: '2024-12-25T12:59:18.608942',
        thread: threadId,
        owner: userId,
      });
      await CommentsTableTestHelper.createComment({
        id: 'comment-5001',
        content: 'Just a few comments',
        date: '2024-12-25T12:59:18.608942',
        thread: threadId,
        owner: userId,
        isDelete: true,
      });

      await RepliesTableTestHelper.createReply({
        id: 'reply-82',
        content: 'Just a dummy new reply',
        date: '2024-12-26T12:59:18.608942',
        comment: commentId,
        owner: userId,
      });
      await RepliesTableTestHelper.createReply({
        id: 'reply-81',
        content: 'Just a dummy old reply',
        date: '2024-12-25T12:59:18.608942',
        comment: commentId,
        owner: otherUserId,
      });
      await RepliesTableTestHelper.createReply({
        id: 'reply-80',
        content: 'Just a dummy old reply',
        date: '2024-12-25T12:59:18.608942',
        comment: 'comment-5001',
        owner: otherUserId,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByThreadId(threadId);

      // Assert
      expect(replies).toHaveLength(2);
      expect(replies[0].id).toBe('reply-81');
      expect(replies[1].id).toBe('reply-82');
      expect(replies[0].username).toBe('ketut');
      expect(replies[1].username).toBe('joko');
      expect(replies[0].content).toBe('Just a dummy old reply');
      expect(replies[1].content).toBe('Just a dummy new reply');
      expect(replies[0].date).toBeTruthy();
      expect(replies[1].date).toBeTruthy();
      expect(replies[2]).toBeUndefined();
    });
  });

  describe('deleteReplyById function', () => {
    it('should soft delete reply and update is_delete field', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-8080' });
      await ThreadsTableTestHelper.createThread({
        id: 'thread-3000',
        owner: 'user-8080',
      });
      await CommentsTableTestHelper.createComment({
        id: 'comment-5000',
        thread: 'thread-3000',
        owner: 'user-8080',
      });

      const replyId = 'reply-80';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await RepliesTableTestHelper.createReply({
        id: replyId,
        comment: 'comment-5000',
        owner: 'user-8080',
      });

      // Action
      await replyRepositoryPostgres.deleteReplyById(replyId);

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById(replyId);
      expect(replies).toHaveLength(1);
      expect(replies[0].is_delete).toBeTruthy();
    });
  });
});
