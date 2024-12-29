class DeleteReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(userId, useCaseParams) {
    const { threadId, commentId, replyId } = useCaseParams;
    await this._threadRepository.verifyThreadAvailability(threadId);
    await this._commentRepository.verifyCommentAvailability(commentId, threadId);
    await this._replyRepository.verifyReplyAvailability(replyId, commentId);
    await this._replyRepository.verifyReplyOwner(replyId, userId);

    return this._replyRepository.deleteReplyById(replyId);
  }
}

module.exports = DeleteReplyUseCase;
