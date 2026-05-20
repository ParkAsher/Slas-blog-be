import { PostService } from './post.service';

describe('PostService', () => {
    describe('getPost', () => {
        it('returns a post without exposing or incrementing views', async () => {
            const findUnique = jest.fn().mockResolvedValue({
                id: 'post-1',
                title: 'Test post',
                content: 'content',
                thumbnail: null,
                slug: 'test-post',
                createdAt: new Date('2026-05-20T00:00:00.000Z'),
                updatedAt: new Date('2026-05-20T00:00:00.000Z'),
                author: {
                    id: 'user-1',
                    nickname: 'author',
                },
                tags: [{ tag: { name: 'nestjs' } }],
            });
            const update = jest.fn();
            const service = new PostService({
                post: {
                    findUnique,
                    update,
                },
            } as any);

            const result = await service.getPost('test-post');

            expect(update).not.toHaveBeenCalled();
            expect(findUnique).toHaveBeenCalledWith(
                expect.objectContaining({
                    select: expect.not.objectContaining({ views: true }),
                }),
            );
            expect(result).not.toHaveProperty('views');
            expect(result.tags).toEqual(['nestjs']);
        });
    });
});
