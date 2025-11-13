"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const users_service_1 = require("./users.service");
const prisma_service_1 = require("@/prisma/prisma.service");
describe('UsersService', () => {
    let service;
    let prismaService;
    const mockUser = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'USER',
        status: 'ACTIVE',
        password: 'hashed',
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                users_service_1.UsersService,
                {
                    provide: prisma_service_1.PrismaService,
                    useValue: {
                        user: {
                            findMany: jest.fn().mockResolvedValue([mockUser]),
                            findUnique: jest.fn().mockResolvedValue(mockUser),
                            create: jest.fn().mockResolvedValue(mockUser),
                            update: jest.fn().mockResolvedValue(mockUser),
                            delete: jest.fn().mockResolvedValue(mockUser),
                            count: jest.fn().mockResolvedValue(1),
                        },
                    },
                },
            ],
        }).compile();
        service = module.get(users_service_1.UsersService);
        prismaService = module.get(prisma_service_1.PrismaService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('findAll', () => {
        it('should return array of users', async () => {
            const result = await service.findAll();
            expect(result.users).toEqual(expect.any(Array));
            expect(result.total).toEqual(1);
        });
    });
    describe('findById', () => {
        it('should return a user', async () => {
            const result = await service.findById('123');
            expect(result).toEqual(mockUser);
        });
    });
});
//# sourceMappingURL=users.service.spec.js.map