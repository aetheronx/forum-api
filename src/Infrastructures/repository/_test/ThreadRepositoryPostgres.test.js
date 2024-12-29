const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const CreateThread = require('../../../Domains/threads/entities/CreateThread');
const CreatedThread = require('../../../Domains/threads/entities/CreatedThread');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('verifyThreadAvailability function', () => {
    it('should throw NotFoundError when thread not available', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        threadRepositoryPostgres.verifyThreadAvailability('thread-8080')
      ).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when thread available', async () => {
      // Arrange
      const threadId = 'thread-3000';
      const userId = 'user-8080';

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.createThread({ id: threadId, owner: userId });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        threadRepositoryPostgres.verifyThreadAvailability(threadId)
      ).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('createThread function', () => {
    beforeEach(async () => {
      await UsersTableTestHelper.addUser({ id: 'user-8080' });
    });

    it('should persist new thread', async () => {
      // Arrange
      const createThread = new CreateThread({
        title: 'My Thread Title',
        body: 'My thread body',
      });

      const fakeIdGenerator = () => '3000';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.createThread('user-8080', createThread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadsById('thread-3000');
      expect(threads).toHaveLength(1);

      expect(threads[0].id).toBe('thread-3000');
      expect(threads[0].title).toBe('My Thread Title');
      expect(threads[0].body).toBe('My thread body');
      expect(threads[0].owner).toBe('user-8080');
    });

    it('should return added thread correctly', async () => {
      // Arrange
      const createThread = new CreateThread({
        title: 'My Thread Title',
        body: 'My thread body',
      });

      const fakeIdGenerator = () => '3000';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const createdThread = await threadRepositoryPostgres.createThread('user-8080', createThread);

      // Assert
      expect(createdThread).toStrictEqual(
        new CreatedThread({
          id: 'thread-3000',
          title: 'My Thread Title',
          owner: 'user-8080',
        })
      );
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.getThreadById('thread-3000')).rejects.toThrowError(
        NotFoundError
      );
    });

    it('should return thread correctly', async () => {
      // Arrange
      const userId = 'user-8080';
      const threadId = 'thread-3000';
      const date = new Date().toISOString();

      await UsersTableTestHelper.addUser({ id: userId, username: 'joko' });
      await ThreadsTableTestHelper.createThread({
        id: threadId,
        title: 'My Thread Title',
        body: 'My thread body',
        date,
        owner: userId,
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const thread = await threadRepositoryPostgres.getThreadById(threadId);

      // Assert
      expect(thread.id).toStrictEqual(threadId);
      expect(thread.title).toStrictEqual('My Thread Title');
      expect(thread.body).toStrictEqual('My thread body');
      expect(thread.date).toBeTruthy();
      expect(thread.username).toStrictEqual('joko');
    });
  });
});
