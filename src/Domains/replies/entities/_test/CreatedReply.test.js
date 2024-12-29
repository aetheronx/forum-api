const CreatedReply = require('../CreatedReply');

describe('a CreatedReply entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'Just a dummy reply',
      owner: 'user-8080',
    };

    // Action & Assert
    expect(() => new CreatedReply(payload)).toThrowError(
      'CREATED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload does not meet data type requirements', () => {
    // Arrange
    const payload = {
      id: 'reply-80',
      content: 8080,
      owner: 2024,
    };

    // Action & Assert
    expect(() => new CreatedReply(payload)).toThrowError(
      'CREATED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should throw error when id does not start with reply-', () => {
    // Arrange
    const payload = {
      id: '80',
      content: 'Juat a dummy reply',
      owner: 'user-8080',
    };

    // Action & Assert
    expect(() => new CreatedReply(payload)).toThrowError('CREATED_REPLY.INVALID_ID_FORMAT');
  });

  it('should throw error when owner id does not start with "user-"', () => {
    // Arrange
    const payload = {
      id: 'reply-80',
      content: 'Juat a dummy reply',
      owner: '8080',
    };

    // Action & Assert
    expect(() => new CreatedReply(payload)).toThrowError('CREATED_REPLY.INVALID_OWNER_ID_FORMAT');
  });

  it('should create CreatedReply entities correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-80',
      content: 'Juat a dummy reply',
      owner: 'user-8080',
    };

    // Action
    const createdReply = new CreatedReply(payload);

    // Assert
    expect(createdReply).toBeInstanceOf(CreatedReply);
    expect(createdReply.id).toEqual(payload.id);
    expect(createdReply.content).toEqual(payload.content);
    expect(createdReply.owner).toEqual(payload.owner);
  });
});
