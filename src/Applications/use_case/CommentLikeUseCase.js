const AddLike = require('../../Domains/likes/entities/AddLike');

class CommentLikeUseCase {
  constructor({ likeRepository, commentRepository, threadRepository }) {
    this._likeRepository = likeRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(userId, useCaseParams) {
    const { threadId, comment } = useCaseParams;
    await this._threadRepository.verifyThreadAvailability(threadId);
    await this._commentRepository.verifyCommentAvailability(comment, threadId);

    const like = new AddLike({
      comment,
      owner: userId,
    });

    const isCommentLiked = await this._likeRepository.verifyUserLike(like);

    return (await isCommentLiked)
      ? this._likeRepository.deleteLike(like)
      : this._likeRepository.addLike(like);
  }
}

module.exports = CommentLikeUseCase;
