const CommentLikeUseCase = require('../../../../Applications/use_case/CommentLikeUseCase');

class LikesHandler {
  constructor(container) {
    this._container = container;
  }

  async putLikeHandler(request, h) {
    const { id: userId } = request.auth.credentials;

    const commentLikeUseCase = this._container.getInstance(CommentLikeUseCase.name);

    await commentLikeUseCase.execute(userId, request.params);

    const response = h.response({
      status: 'success',
    });

    response.code(200);
    return response;
  }
}

module.exports = LikesHandler;
