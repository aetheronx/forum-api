const CreatedThread = require('../../../Domains/threads/entities/CreatedThread');
const CreateThread = require('../../../Domains/threads/entities/CreateThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CreateThreadUseCase = require('../CreateThreadUseCase');

describe('CreateThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    // Arrangee
    const useCasePayload = {
      title: 'My Thread Title',
      body: 'My thread body',
    };

    const mockCreatedThread = new CreatedThread({
      id: 'thread-3000',
      title: 'My Thread Title',
      owner: 'user-8080',
    });

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.createThread = jest.fn(() => Promise.resolve(mockCreatedThread));

    const createThreadUseCase = new CreateThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const createdThread = await createThreadUseCase.execute('user-8080', useCasePayload);

    // Assert
    expect(createdThread).toStrictEqual(
      new CreatedThread({
        id: 'thread-3000',
        title: 'My Thread Title',
        owner: 'user-8080',
      }),
    );

    expect(mockThreadRepository.createThread).toBeCalledWith(
      'user-8080',
      new CreateThread({
        title: useCasePayload.title,
        body: useCasePayload.body,
      }),
    );
  });
});
