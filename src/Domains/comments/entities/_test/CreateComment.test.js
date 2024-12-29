const CreateComment = require('../CreateComment');

describe('a CreateComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {};

    // Action & Assert
    expect(() => new CreateComment(payload)).toThrowError(
      'CREATE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload does not meet data type requirements', () => {
    // Arrange
    const payload = { content: 5000 };

    // Action & Assert
    expect(() => new CreateComment(payload)).toThrowError(
      'CREATE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create CreateComment entities correctly', () => {
    // Arrange
    const payload = { content: 'Just a few comment' };

    // Action
    const createComment = new CreateComment(payload);

    // Assert
    expect(createComment).toBeInstanceOf(CreateComment);
    expect(createComment.content).toEqual(payload.content);
  });
});
