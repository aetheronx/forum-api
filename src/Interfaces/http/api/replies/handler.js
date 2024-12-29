const CreateReplyUseCase = require('../../../../Applications/use_case/CreateReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteReplyUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;
  }

  async postReplyHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const createReplyUseCase = this._container.getInstance(CreateReplyUseCase.name);
    const addedReply = await createReplyUseCase.execute(userId, request.params, request.payload);

    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteReplyByIdHandler(request) {
    const { id: userId } = request.auth.credentials;
    const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name);
    await deleteReplyUseCase.execute(userId, request.params);

    return { status: 'success' };
  }
}

module.exports = RepliesHandler;
