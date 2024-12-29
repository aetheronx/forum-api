const ThreadDetail = require('../ThreadDetail');

describe('ThreadDetail entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thread-3000',
      title: 'My Thread Title',
      body: 'My thread body',
      comments: [],
    };

    // Action & Assert
    expect(() => new ThreadDetail(payload)).toThrowError(
      'THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload does not meet data type requirements', () => {
    // Arrange
    const payload = {
      id: 8080,
      title: 123,
      body: 456,
      username: 'Joko',
      date: 8000,
      comments: 'some comments',
    };

    // Action & Assert
    expect(() => new ThreadDetail(payload)).toThrowError(
      'THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should throw error when id is not a string', () => {
    // Arrange
    const payload = {
      id: 3000,
      title: 'My Thread Title',
      body: 'My thread body',
      username: 'joko',
      date: '2024-12-25T12:59:18.608942',
      comments: [],
    };

    // Action & Assert
    expect(() => new ThreadDetail(payload)).toThrowError(
      'THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create ThreadDetail entities correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-3000',
      title: 'My Thread Title',
      body: 'My thread body',
      username: 'joko',
      date: '2024-12-25T12:59:18.608942',
      comments: [],
    };

    // Action
    const threadDetail = new ThreadDetail(payload);

    // Assert
    expect(threadDetail).toBeInstanceOf(ThreadDetail);
    expect(threadDetail).toStrictEqual(
      new ThreadDetail({
        id: 'thread-3000',
        title: 'My Thread Title',
        body: 'My thread body',
        username: 'joko',
        date: '2024-12-25T12:59:18.608942',
        comments: [],
      })
    );
  });
});
