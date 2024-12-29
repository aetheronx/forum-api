const CreatedComment = require('../CreatedComment');

describe('a CreatedComment entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'Just a few comment',
      owner: 'user-8080',
    };

    // Action & Assert
    expect(() => new CreatedComment(payload)).toThrowError(
      'CREATED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload does not meet data type requirements', () => {
    // Arrange
    const payload = {
      id: 'comment-5000',
      content: 1945,
      owner: 8080,
    };

    // Action & Assert
    expect(() => new CreatedComment(payload)).toThrowError(
      'CREATED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should throw error when id does not start with comment-', () => {
    // Arrange
    const payload = {
      id: '5000',
      content: 'Just a few comment',
      owner: 'user-8080',
    };

    // Action & Assert
    expect(() => new CreatedComment(payload)).toThrowError('CREATED_COMMENT.INVALID_ID_FORMAT');
  });

  it('should throw error when owner id does not start with "user-"', () => {
    // Arrange
    const payload = {
      id: 'comment-5000',
      content: 'Just a few comment',
      owner: '8080',
    };

    // Action & Assert
    expect(() => new CreatedComment(payload)).toThrowError(
      'CREATED_COMMENT.INVALID_OWNER_ID_FORMAT'
    );
  });

  it('should create CreatedComment entities correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-5000',
      content: 'Just a few comment',
      owner: 'user-8080',
    };

    // Action
    const createdComment = new CreatedComment(payload);

    // Assert
    expect(createdComment).toBeInstanceOf(CreatedComment);
    expect(createdComment.id).toEqual(payload.id);
    expect(createdComment.content).toEqual(payload.content);
    expect(createdComment.owner).toEqual(payload.owner);
  });
});
