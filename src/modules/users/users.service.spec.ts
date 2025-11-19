import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '@/prisma/prisma.service';
import {
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
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

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
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

  describe('create', () => {
    it('should prevent creating SYSTEM_ADMIN users', async () => {
      await expect(
        service.create({
          email: 'admin@example.com',
          password: 'password123',
          firstName: 'Admin',
          lastName: 'User',
          role: 'SYSTEM_ADMIN',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should prevent updating SYSTEM_ADMIN users', async () => {
      const systemAdmin = { ...mockUser, role: 'SYSTEM_ADMIN' };
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(systemAdmin as any);

      await expect(
        service.update('123', { firstName: 'NewName' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should prevent promoting users to SYSTEM_ADMIN', async () => {
      await expect(
        service.update('123', { role: 'SYSTEM_ADMIN' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateStatus', () => {
    it('should prevent changing SYSTEM_ADMIN status', async () => {
      const systemAdmin = { ...mockUser, role: 'SYSTEM_ADMIN' };
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(systemAdmin as any);

      await expect(service.updateStatus('123', 'INACTIVE')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('delete', () => {
    it('should prevent deleting SYSTEM_ADMIN users', async () => {
      const systemAdmin = { ...mockUser, role: 'SYSTEM_ADMIN' };
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(systemAdmin as any);

      await expect(service.delete('123')).rejects.toThrow(ForbiddenException);
    });
  });
});
