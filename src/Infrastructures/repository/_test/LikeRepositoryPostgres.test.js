const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const pool = require('../../database/postgres/pool');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');
const AddLike = require('../../../Domains/likes/entities/AddLike');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');

describe('LikeRepositoryPostgres', () => {
  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  const dummyUserId = 'user-8080';

  const dummyThread = {
    id: 'thread-3000',
    title: 'Thread Title',
    body: 'Thread body',
    date: new Date().toISOString(),
  };

  const dummyComment = {
    id: 'comment-5000',
    content: 'Just a simple comment',
    date: new Date().toISOString(),
    thread: dummyThread.id,
    isDelete: false,
  };

  describe('addLike', () => {
    it('should add a like to the database', async () => {
      // Arrange

      await UsersTableTestHelper.addUser({ id: dummyUserId });

      await ThreadsTableTestHelper.createThread({ ...dummyThread, owner: dummyUserId });

      await CommentsTableTestHelper.createComment({ ...dummyComment, owner: dummyUserId });

      const like = new AddLike({ comment: dummyComment.id, owner: dummyUserId });

      const fakeIdGenerator = () => '433';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await likeRepositoryPostgres.addLike(like);

      // Assert
      const likes = await LikesTableTestHelper.findLikeByCommentIdAndUserId(
        dummyComment.id,
        dummyUserId
      );
      expect(likes[0]).toStrictEqual({
        id: 'like-433',
        comment: 'comment-5000',
        owner: 'user-8080',
      });
    });
  });

  describe('verifyUserLike', () => {
    it('should return true if a user has liked a comment', async () => {
      // Arrange
      const like = new AddLike({
        comment: dummyComment.id,
        owner: dummyUserId,
      });

      await UsersTableTestHelper.addUser({ id: dummyUserId });

      await ThreadsTableTestHelper.createThread({ ...dummyThread, owner: dummyUserId });

      await CommentsTableTestHelper.createComment({ ...dummyComment, owner: dummyUserId });

      await LikesTableTestHelper.addLike({ id: 'like-433', ...like });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const isCommentLiked = await likeRepositoryPostgres.verifyUserLike(like);

      // Assert
      expect(isCommentLiked).toBe(true);
    });

    it('should return false if a user has not liked a comment', async () => {
      // Arrange
      const like = new AddLike({
        comment: dummyComment.id,
        owner: dummyUserId,
      });

      // add user
      await UsersTableTestHelper.addUser({ id: dummyUserId });
      // add thread
      await ThreadsTableTestHelper.createThread({ ...dummyThread, owner: dummyUserId });
      // add comments
      await CommentsTableTestHelper.createComment({ ...dummyComment, owner: dummyUserId });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const isCommentLiked = await likeRepositoryPostgres.verifyUserLike(like);

      // Assert
      expect(isCommentLiked).toBe(false);
    });
  });

  describe('getLikesByThreadId', () => {
    it('should return the likes for a thread', async () => {
      // Arrange
      // add user
      await UsersTableTestHelper.addUser({ id: dummyUserId });
      // add thread
      await ThreadsTableTestHelper.createThread({ ...dummyThread, owner: dummyUserId });
      // add comments
      await CommentsTableTestHelper.createComment({ ...dummyComment, owner: dummyUserId });
      await CommentsTableTestHelper.createComment({
        ...dummyComment,
        id: 'comment-5001',
        owner: dummyUserId,
      });
      // add likes
      await LikesTableTestHelper.addLike({
        id: 'like-433',
        comment: dummyComment.id,
        owner: dummyUserId,
      });
      await LikesTableTestHelper.addLike({
        id: 'like-434',
        comment: 'comment-5001',
        owner: dummyUserId,
      });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const threadCommentLikes = await likeRepositoryPostgres.getLikesByThreadId(dummyThread.id);

      // Assert
      expect(threadCommentLikes).toHaveLength(2);

      expect(threadCommentLikes[0].id).toStrictEqual('like-433');
      expect(threadCommentLikes[0].comment).toStrictEqual(dummyComment.id);
      expect(threadCommentLikes[0].owner).toBe(dummyUserId);

      expect(threadCommentLikes[1].id).toStrictEqual('like-434');
      expect(threadCommentLikes[1].comment).toStrictEqual('comment-5001');
      expect(threadCommentLikes[1].owner).toBe(dummyUserId);
    });
  });

  describe('deleteLike', () => {
    it('should delete a like from the database', async () => {
      // Arrange
      const like = new AddLike({
        comment: dummyComment.id,
        owner: dummyUserId,
      });

      // add user
      await UsersTableTestHelper.addUser({ id: dummyUserId });
      // add thread
      await ThreadsTableTestHelper.createThread({ ...dummyThread, owner: dummyUserId });
      // add comments
      await CommentsTableTestHelper.createComment({ ...dummyComment, owner: dummyUserId });
      // add like
      await LikesTableTestHelper.addLike({ id: 'like-433', ...like });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      await likeRepositoryPostgres.deleteLike(like);

      // Assert
      const likes = await LikesTableTestHelper.findLikeById('like-433');
      expect(likes).toHaveLength(0);
    });
  });
});
