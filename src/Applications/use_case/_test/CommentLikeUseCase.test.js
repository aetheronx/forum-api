const CommentLikeUseCase = require('../CommentLikeUseCase');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddLike = require('../../../Domains/likes/entities/AddLike');

describe('CommentLikeUseCase', () => {
  it('should orchestrating the like comment action correctly if comment is not liked', async () => {
    // Arrange
    const like = new AddLike({
      comment: 'comment-5000',
      owner: 'user-8080',
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.verifyThreadAvailability = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentAvailability = jest.fn(() => Promise.resolve());
    mockLikeRepository.verifyUserLike = jest.fn(() => Promise.resolve(false));
    mockLikeRepository.addLike = jest.fn(() => Promise.resolve());

    const commentLikeUseCase = new CommentLikeUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await commentLikeUseCase.execute('user-8080', {
      threadId: 'thread-3000',
      comment: 'comment-5000',
    });

    // Assert
    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith('thread-3000');
    expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith(
      'comment-5000',
      'thread-3000'
    );
    expect(mockLikeRepository.verifyUserLike).toBeCalledWith(like);
    expect(mockLikeRepository.addLike).toBeCalledWith(like);
  });

  it('should orchestrating the dislike comment action correctly if comment is liked', async () => {
    // Arrange
    const like = new AddLike({
      comment: 'comment-5000',
      owner: 'user-8080',
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.verifyThreadAvailability = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentAvailability = jest.fn(() => Promise.resolve());
    mockLikeRepository.verifyUserLike = jest.fn(() => Promise.resolve(true));
    mockLikeRepository.deleteLike = jest.fn(() => Promise.resolve());

    /** creating use case instance */
    const commentLikeUseCase = new CommentLikeUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await commentLikeUseCase.execute('user-8080', {
      threadId: 'thread-3000',
      comment: 'comment-5000',
    });

    // Assert
    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith('thread-3000');
    expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith(
      'comment-5000',
      'thread-3000'
    );
    expect(mockLikeRepository.verifyUserLike).toBeCalledWith(like);
    expect(mockLikeRepository.deleteLike).toBeCalledWith(like);
  });
});
