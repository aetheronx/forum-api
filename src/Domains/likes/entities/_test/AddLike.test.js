const AddLike = require('../AddLike');

describe('AddLike entity', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      comment: 'comment-3000',
    };

    // Action & Assert
    expect(() => new AddLike(payload)).toThrowError('ADD_LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type requirements', () => {
    // Arrange
    const payload = {
      comment: 3000,
      owner: 8080,
    };

    // Action & Assert
    expect(() => new AddLike(payload)).toThrowError('ADD_LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewReply entities correctly', () => {
    // Arrange
    const payload = {
      comment: 'comment-3000',
      owner: 'user-8080',
    };

    // Action
    const addLike = new AddLike(payload);

    // Assert
    expect(addLike.comment).toEqual(payload.comment);
    expect(addLike.owner).toEqual(payload.owner);
  });
});
