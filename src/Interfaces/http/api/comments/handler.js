const CreateCommentUseCase = require('../../../../Applications/use_case/CreateCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;
  }

  async postCommentHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { threadId } = request.params;
    const createCommentUseCase = this._container.getInstance(CreateCommentUseCase.name);
    const addedComment = await createCommentUseCase.execute(userId, threadId, request.payload);

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCommentByIdHandler(request) {
    const { id: userId } = request.auth.credentials;
    const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
    await deleteCommentUseCase.execute(userId, request.params);

    return { status: 'success' };
  }
}

module.exports = CommentsHandler;
