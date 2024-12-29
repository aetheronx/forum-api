const CreateThread = require('../CreateThread');

describe('a CreateThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'My Thread Title',
    };

    // Action & Assert
    expect(() => new CreateThread(payload)).toThrowError(
      'CREATE_THREAD.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      title: 35000,
      body: 'My thread body',
    };

    // Action & Asssert
    expect(() => new CreateThread(payload)).toThrowError(
      'CREATE_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should throw error when title or body has less than 2 characters', () => {
    // Arrange
    const payloadTitle = {
      title: 'A',
      body: 'My thread body',
    };

    const payloadBody = {
      title: 'My Thread Title',
      body: 'B',
    };

    // Action & Assert
    expect(() => new CreateThread(payloadTitle)).toThrowError(
      'CREATE_THREAD.NOT_CONTAIN_NEEDED_PROPERTY',
    );

    // Action & Assert
    expect(() => new CreateThread(payloadBody)).toThrowError(
      'CREATE_THREAD.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should create CreateThread object correctly', () => {
    // Arrange
    const payload = {
      title: 'My Thread Title',
      body: 'My thread body',
    };

    // Action
    const { title, body } = new CreateThread(payload);

    // Assert
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
  });
});
