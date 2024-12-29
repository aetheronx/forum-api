const CreateReply = require('../CreateReply');

describe('a CrateReply entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {};

    // Action & Assert
    expect(() => new CreateReply(payload)).toThrowError('CREATE_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type requirements', () => {
    // Arrange
    const payload = { content: {} };

    // Action & Assert
    expect(() => new CreateReply(payload)).toThrowError(
      'CREATE_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create CreateReply entities correctly', () => {
    // Arrange
    const payload = { content: 'a reply' };

    // Action
    const createReply = new CreateReply(payload);

    // Assert
    expect(createReply).toBeInstanceOf(CreateReply);
    expect(createReply.content).toEqual(payload.content);
  });
});
