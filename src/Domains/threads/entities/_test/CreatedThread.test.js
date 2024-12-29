const CreatedThread = require('../CreatedThread');

describe('a CreatedThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thred-3000',
      title: 'My Thread Title',
    };

    // Action & Assert
    expect(() => new CreatedThread(payload)).toThrowError(
      'CREATED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 3000,
      title: 35000,
      owner: 'user-8080',
    };

    // Action & Asssert
    expect(() => new CreatedThread(payload)).toThrowError(
      'CREATED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should throw error when id does not start with thread-', () => {
    // Arrange
    const payload = {
      id: '3000',
      title: 'My Thread Title',
      owner: 'user-8080',
    };

    // Action & Assert
    expect(() => new CreatedThread(payload)).toThrowError('CREATED_THREAD.INVALID_ID_FORMAT');
  });

  it('should throw error when owner id does not start with "user-"', () => {
    // Arrange
    const payload = {
      id: 'thread-1234',
      title: 'My Thread Title',
      owner: '8080',
    };

    // Action & Assert
    expect(() => new CreatedThread(payload)).toThrowError('CREATED_THREAD.INVALID_OWNER_ID_FORMAT');
  });

  it('should create CreatedThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-3000',
      title: 'My Thread Title',
      owner: 'user-8080',
    };

    // Action
    const { id, title, owner } = new CreatedThread(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(title).toEqual(payload.title);
    expect(owner).toEqual(payload.owner);
  });
});
