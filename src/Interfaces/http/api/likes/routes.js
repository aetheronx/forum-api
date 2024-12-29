const routes = (handler) => [
  {
    method: 'PUT',
    path: '/threads/{threadId}/comments/{comment}/likes',
    handler: (request, h) => handler.putLikeHandler(request, h),
    options: {
      auth: 'auth_token',
    },
  },
];

module.exports = routes;
