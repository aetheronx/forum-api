const CommentDetail = require('../../Domains/comments/entities/CommentDetail');
const ReplyDetail = require('../../Domains/replies/entities/ReplyDetail');
const ThreadDetail = require('../../Domains/threads/entities/ThreadDetail');

class ThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository, likeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._likeRepository = likeRepository;
  }

  async execute(threadId) {
    const threadDetail = await this._threadRepository.getThreadById(threadId);
    const threadComments = await this._commentRepository.getCommentsByThreadId(threadId);
    const threadCommentsReplies = await this._replyRepository.getRepliesByThreadId(threadId);
    const threadCommentsLikes = await this._likeRepository.getLikesByThreadId(threadId);

    threadDetail.comments = threadComments.map(
      (comment) =>
        new CommentDetail({
          ...comment,
          replies: comment.is_delete
            ? []
            : threadCommentsReplies
                .filter((reply) => reply.comment === comment.id)
                .map((reply) => new ReplyDetail(reply)),
          likeCount: threadCommentsLikes.filter((like) => like.comment === comment.id).length,
        })
    );

    return new ThreadDetail(threadDetail);
  }
}

module.exports = ThreadDetailUseCase;
